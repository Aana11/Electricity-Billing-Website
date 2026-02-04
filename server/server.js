const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs').promises;

const { 
  scrapeAll, 
  scrapeDormitory, 
  getDormitoryList, 
  getDormitoryHistory, 
  getLatestData,
  addDormitory,
  DORMITORIES 
} = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 确保数据目录存在
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// ========== API 路由 ==========

// 获取所有宿舍列表
app.get('/api/dormitories', (req, res) => {
  res.json({
    success: true,
    data: getDormitoryList()
  });
});

// 获取指定宿舍的最新数据
app.get('/api/dormitories/:id/latest', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getLatestData(id);
    
    if (data) {
      res.json({
        success: true,
        data
      });
    } else {
      res.status(404).json({
        success: false,
        message: '未找到该宿舍数据'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取指定宿舍的历史数据
app.get('/api/dormitories/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 30;
    const data = await getDormitoryHistory(id, days);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取指定宿舍的时段分析数据
app.get('/api/dormitories/:id/hourly', async (req, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days) || 7;
    const historyData = await getDormitoryHistory(id, days);
    
    // 按小时分组统计
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { hour: i, count: 0, avgBalance: 0, records: [] };
    }
    
    historyData.forEach(record => {
      const hour = record.hour;
      if (hourlyData[hour]) {
        hourlyData[hour].records.push(record);
        hourlyData[hour].count++;
      }
    });
    
    // 计算每小时的平均余额
    Object.keys(hourlyData).forEach(hour => {
      const records = hourlyData[hour].records;
      if (records.length > 0) {
        const sum = records.reduce((acc, r) => acc + r.deviceInfo.deviceBalance, 0);
        hourlyData[hour].avgBalance = sum / records.length;
      }
    });
    
    res.json({
      success: true,
      data: Object.values(hourlyData)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取所有宿舍对比数据
app.get('/api/comparison', async (req, res) => {
  try {
    const dormitories = getDormitoryList();
    const comparisonData = [];
    
    for (const dorm of dormitories) {
      const latest = await getLatestData(dorm.id);
      const history = await getDormitoryHistory(dorm.id, 7);
      
      if (latest) {
        // 计算7天用电量
        let consumption7d = 0;
        if (history.length >= 2) {
          const firstBalance = history[0].deviceInfo.deviceBalance;
          const lastBalance = history[history.length - 1].deviceInfo.deviceBalance;
          consumption7d = Math.max(0, (firstBalance - lastBalance) / latest.deviceInfo.devicePrice);
        }
        
        comparisonData.push({
          dormitoryId: dorm.id,
          name: dorm.name,
          building: dorm.building,
          roomNumber: dorm.roomNumber,
          currentBalance: latest.deviceInfo.deviceBalance,
          devicePrice: latest.deviceInfo.devicePrice,
          consumption7d: Math.round(consumption7d * 10) / 10,
          updateTime: latest.deviceInfo.updateTime,
          isOnline: latest.deviceInfo.isOnline
        });
      }
    }
    
    // 按余额排序
    comparisonData.sort((a, b) => b.currentBalance - a.currentBalance);
    
    res.json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 手动触发数据抓取
app.post('/api/scrape', async (req, res) => {
  try {
    const { dormitoryId } = req.body;
    
    if (dormitoryId) {
      // 抓取指定宿舍
      const dormitory = DORMITORIES.find(d => d.id === dormitoryId);
      if (!dormitory) {
        return res.status(404).json({
          success: false,
          message: '未找到该宿舍'
        });
      }
      
      const data = await scrapeDormitory(dormitory);
      res.json({
        success: true,
        data
      });
    } else {
      // 抓取所有宿舍
      const results = await scrapeAll();
      res.json({
        success: true,
        data: results
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 添加新宿舍
app.post('/api/dormitories', async (req, res) => {
  try {
    const { id, name, building, roomNumber, floor, account, password, userName } = req.body;
    
    if (!id || !name || !account || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    const result = await addDormitory({
      id,
      name,
      building: building || '',
      roomNumber: roomNumber || '',
      floor: floor || '',
      account,
      password,
      userName: userName || ''
    });
    
    if (result) {
      res.json({
        success: true,
        message: '宿舍添加成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: '宿舍已存在'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取统计数据摘要
app.get('/api/stats', async (req, res) => {
  try {
    const dormitories = getDormitoryList();
    const stats = {
      totalDormitories: dormitories.length,
      onlineCount: 0,
      totalBalance: 0,
      avgBalance: 0,
      lowBalanceCount: 0, // 余额低于20
      lastUpdate: null
    };
    
    for (const dorm of dormitories) {
      const latest = await getLatestData(dorm.id);
      if (latest) {
        if (latest.deviceInfo.isOnline) stats.onlineCount++;
        stats.totalBalance += latest.deviceInfo.deviceBalance;
        if (latest.deviceInfo.deviceBalance < 20) stats.lowBalanceCount++;
        
        if (!stats.lastUpdate || new Date(latest.timestamp) > new Date(stats.lastUpdate)) {
          stats.lastUpdate = latest.timestamp;
        }
      }
    }
    
    stats.avgBalance = dormitories.length > 0 
      ? Math.round((stats.totalBalance / dormitories.length) * 100) / 100 
      : 0;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// ========== 定时任务 ==========

// 每天 6:00, 12:00, 18:00 执行数据抓取
function setupCronJobs() {
  // 6:00
  cron.schedule('0 6 * * *', async () => {
    console.log(`[${new Date().toLocaleString()}] 执行 6:00 定时任务`);
    await scrapeAll();
  }, {
    timezone: 'Asia/Shanghai'
  });
  
  // 12:00
  cron.schedule('0 12 * * *', async () => {
    console.log(`[${new Date().toLocaleString()}] 执行 12:00 定时任务`);
    await scrapeAll();
  }, {
    timezone: 'Asia/Shanghai'
  });
  
  // 18:00
  cron.schedule('0 18 * * *', async () => {
    console.log(`[${new Date().toLocaleString()}] 执行 18:00 定时任务`);
    await scrapeAll();
  }, {
    timezone: 'Asia/Shanghai'
  });
  
  console.log(`[${new Date().toLocaleString()}] 定时任务已设置: 每天 6:00, 12:00, 18:00`);
}

// ========== 启动服务 ==========

async function startServer() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`\n[${new Date().toLocaleString()}] ========================================`);
    console.log(`[${new Date().toLocaleString()}] 电费数据服务已启动`);
    console.log(`[${new Date().toLocaleString()}] API地址: http://localhost:${PORT}`);
    console.log(`[${new Date().toLocaleString()}] ========================================\n`);
  });
  
  // 设置定时任务
  setupCronJobs();
  
  // 启动时立即抓取一次数据
  console.log(`[${new Date().toLocaleString()}] 启动时执行首次数据抓取...`);
  await scrapeAll();
}

startServer().catch(console.error);
