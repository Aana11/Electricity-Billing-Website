const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// 宿舍配置列表
const DORMITORIES = [
  {
    id: '13-513',
    name: '13栋513',
    building: '13栋',
    roomNumber: '513',
    floor: '5楼',
    roomId: '878680437252165632',
    account: '19940686925',
    password: '#ZYFzyf20051029',
    userName: '周逸飞'
  }
];

// 创建axios实例
function createSession() {
  return axios.create({
    baseURL: 'https://wpp.nnnu.edu.cn',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://wpp.nnnu.edu.cn',
      'Referer': 'https://wpp.nnnu.edu.cn/Login/Login'
    },
    withCredentials: true
  });
}

// 登录并获取session
async function login(session, account, password) {
  try {
    // 先访问登录页面获取cookie
    await session.get('/Login/Login');
    
    // 执行登录
    const loginData = new URLSearchParams();
    loginData.append('account', account);
    loginData.append('password', password);
    
    const response = await session.post('/Login/LoginJson', loginData.toString());
    
    if (response.data && response.data.Tag === 1) {
      console.log(`[${new Date().toLocaleString()}] 登录成功: ${account}`);
      return true;
    } else {
      console.error(`[${new Date().toLocaleString()}] 登录失败:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] 登录错误:`, error.message);
    return false;
  }
}

// 获取宿舍数据
async function fetchDormitoryData(session, dormitory) {
  try {
    // 获取用户信息
    const userInfoResponse = await session.post('/Home/GetUserInfo');
    const userInfo = userInfoResponse.data;
    
    // 获取设备信息
    const devicesResponse = await session.post('/Home/GetUserBindDevices');
    const devicesData = devicesResponse.data;
    
    if (devicesData && devicesData.Tag === 1 && devicesData.Data) {
      const device = devicesData.Data.DevicesList && devicesData.Data.DevicesList[0];
      
      if (device) {
        return {
          dormitoryId: dormitory.id,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          hour: new Date().getHours(),
          userInfo: {
            realName: userInfo.Data?.RealName || dormitory.userName,
            mobile: userInfo.Data?.Mobile || '',
            gender: userInfo.Data?.GenderStr || '男'
          },
          roomInfo: {
            roomName: devicesData.Data.RoomName,
            roomId: device.RoomId,
            building: dormitory.building,
            floor: dormitory.floor,
            roomNumber: dormitory.roomNumber
          },
          deviceInfo: {
            deviceName: device.DeviceName,
            deviceType: device.DeviceTypeName,
            // 线上字段存在历史拼写错误 `DevcieNo`，兼容两种写法
            deviceNo: device.DeviceNo ?? device.DevcieNo ?? '',
            deviceBalance: device.DeviceBalance,
            updateTime: device.UpdateTime,
            isOnline: device.IsOnline === 1,
            devicePrice: device.DevicePrice,
            roomId: device.RoomId,
            roomInfo: device.RoomInfo
          }
        };
      }
    }
    
    console.error(`[${new Date().toLocaleString()}] 获取设备数据失败`);
    return null;
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] 获取数据错误:`, error.message);
    return null;
  }
}

// 保存数据到文件
async function saveData(data) {
  try {
    const dataDir = path.join(__dirname, 'data');
    const date = new Date().toISOString().split('T')[0];
    const filename = `${data.dormitoryId}_${date}.json`;
    const filepath = path.join(dataDir, filename);
    
    // 读取现有数据
    let existingData = [];
    try {
      const content = await fs.readFile(filepath, 'utf8');
      existingData = JSON.parse(content);
    } catch (e) {
      // 文件不存在，创建新数组
    }
    
    // 添加新数据
    existingData.push(data);
    
    // 保存数据
    await fs.writeFile(filepath, JSON.stringify(existingData, null, 2));
    
    // 同时更新最新数据文件
    const latestFile = path.join(dataDir, `${data.dormitoryId}_latest.json`);
    await fs.writeFile(latestFile, JSON.stringify(data, null, 2));
    
    console.log(`[${new Date().toLocaleString()}] 数据已保存: ${filename}`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] 保存数据错误:`, error.message);
    return false;
  }
}

// 抓取单个宿舍数据
async function scrapeDormitory(dormitory) {
  console.log(`[${new Date().toLocaleString()}] 开始抓取: ${dormitory.name}`);
  
  const session = createSession();
  
  // 登录
  const loggedIn = await login(session, dormitory.account, dormitory.password);
  if (!loggedIn) {
    console.error(`[${new Date().toLocaleString()}] 登录失败，跳过: ${dormitory.name}`);
    return null;
  }
  
  // 获取数据
  const data = await fetchDormitoryData(session, dormitory);
  if (data) {
    await saveData(data);
    console.log(`[${new Date().toLocaleString()}] 抓取完成: ${dormitory.name}, 余额: ¥${data.deviceInfo.deviceBalance}`);
  }
  
  return data;
}

// 主抓取函数
async function scrapeAll() {
  console.log(`\n[${new Date().toLocaleString()}] ========== 开始定时抓取任务 ==========`);
  
  const results = [];
  for (const dormitory of DORMITORIES) {
    try {
      const data = await scrapeDormitory(dormitory);
      if (data) {
        results.push(data);
      }
      // 间隔5秒，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] 抓取异常:`, error.message);
    }
  }
  
  console.log(`[${new Date().toLocaleString()}] ========== 抓取任务完成，成功: ${results.length}/${DORMITORIES.length} ==========\n`);
  return results;
}

// 获取所有宿舍列表
function getDormitoryList() {
  return DORMITORIES.map(d => ({
    id: d.id,
    name: d.name,
    building: d.building,
    roomNumber: d.roomNumber,
    floor: d.floor,
    userName: d.userName
  }));
}

// 获取宿舍历史数据
async function getDormitoryHistory(dormitoryId, days = 30) {
  try {
    const dataDir = path.join(__dirname, 'data');
    const historyData = [];
    
    // 读取最近N天的数据
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const filename = `${dormitoryId}_${dateStr}.json`;
      const filepath = path.join(dataDir, filename);
      
      try {
        const content = await fs.readFile(filepath, 'utf8');
        const dayData = JSON.parse(content);
        historyData.unshift(...dayData);
      } catch (e) {
        // 文件不存在，跳过
      }
    }
    
    return historyData;
  } catch (error) {
    console.error('获取历史数据错误:', error.message);
    return [];
  }
}

// 获取最新数据
async function getLatestData(dormitoryId) {
  try {
    const dataDir = path.join(__dirname, 'data');
    const latestFile = path.join(dataDir, `${dormitoryId}_latest.json`);
    
    const content = await fs.readFile(latestFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('获取最新数据错误:', error.message);
    return null;
  }
}

// 添加新宿舍
async function addDormitory(dormitoryConfig) {
  // 检查是否已存在
  const exists = DORMITORIES.find(d => d.id === dormitoryConfig.id);
  if (exists) {
    console.log(`宿舍 ${dormitoryConfig.id} 已存在`);
    return false;
  }
  
  DORMITORIES.push(dormitoryConfig);
  console.log(`已添加宿舍: ${dormitoryConfig.name}`);
  
  // 立即抓取一次
  await scrapeDormitory(dormitoryConfig);
  return true;
}

module.exports = {
  scrapeAll,
  scrapeDormitory,
  getDormitoryList,
  getDormitoryHistory,
  getLatestData,
  addDormitory,
  DORMITORIES,
  __testables: {
    fetchDormitoryData
  }
};
