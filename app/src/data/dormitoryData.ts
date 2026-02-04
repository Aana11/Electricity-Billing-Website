import type { Dormitory, DormitoryData, HourlyData, ComparisonData } from '@/types';

export type { Dormitory, DormitoryData, HourlyData, ComparisonData };

// 模拟登录API
export const loginToElectricitySystem = async (
  account: string,
  password: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // 验证账号密码（这里使用预设的账号密码进行演示）
  if (account && password) {
    return {
      success: true,
      message: '登录成功',
      data: {
        userInfo: {
          realName: '用户' + account.slice(-4),
          mobile: account.slice(0, 3) + '****' + account.slice(-4),
          gender: '男',
        },
        roomInfo: {
          roomName: `武鸣校区桂园公寓${account.slice(-2)}栋学生宿舍`,
          roomId: 'mock_' + account,
          building: account.slice(-2) + '栋',
          floor: '5楼',
          roomNumber: account.slice(-3),
        },
        deviceInfo: {
          deviceName: '模拟电表',
          deviceType: '电表',
          deviceNo: '00' + Math.random().toString().slice(2, 10),
          deviceBalance: Math.round((30 + Math.random() * 100) * 100) / 100,
          updateTime: new Date().toISOString(),
          isOnline: true,
          devicePrice: 0.5441,
          roomId: 'mock_' + account,
          roomInfo: `武鸣校区桂园公寓${account.slice(-2)}栋学生宿舍`,
        }
      }
    };
  }
  
  return {
    success: false,
    message: '账号或密码错误'
  };
};

// 宿舍配置
export const DORMITORIES: Dormitory[] = [
  {
    id: '13-513',
    name: '13栋513',
    building: '13栋',
    roomNumber: '513',
    floor: '5楼',
    userName: '周逸飞'
  }
];

// API基础URL（开发时使用代理，生产时使用相对路径）
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 本地存储键名
const STORAGE_KEYS = {
  DATA_PREFIX: 'elec_data_',
  LATEST_PREFIX: 'elec_latest_',
  HISTORY_PREFIX: 'elec_history_',
  CURRENT_DORM: 'elec_current_dorm'
};

// 获取当前选中的宿舍
export function getCurrentDormitory(): Dormitory {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_DORM);
  if (saved) {
    const found = DORMITORIES.find(d => d.id === saved);
    if (found) return found;
  }
  return DORMITORIES[0];
}

// 设置当前宿舍
export function setCurrentDormitory(dormitoryId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_DORM, dormitoryId);
}

// 保存数据到本地存储
export function saveDataToLocal(data: DormitoryData): void {
  const key = `${STORAGE_KEYS.LATEST_PREFIX}${data.dormitoryId}`;
  localStorage.setItem(key, JSON.stringify(data));
  
  // 同时保存到历史记录
  const historyKey = `${STORAGE_KEYS.HISTORY_PREFIX}${data.dormitoryId}`;
  const existing = localStorage.getItem(historyKey);
  let history: DormitoryData[] = [];
  
  if (existing) {
    try {
      history = JSON.parse(existing);
    } catch (e) {
      console.error('Failed to parse history:', e);
    }
  }
  
  // 检查是否已存在同一时间点的数据
  const exists = history.find(h => 
    h.date === data.date && h.time === data.time
  );
  
  if (!exists) {
    history.push(data);
    // 只保留最近100条记录
    if (history.length > 100) {
      history = history.slice(-100);
    }
    localStorage.setItem(historyKey, JSON.stringify(history));
  }
}

// 从本地存储获取最新数据
export function getLatestDataFromLocal(dormitoryId: string): DormitoryData | null {
  const key = `${STORAGE_KEYS.LATEST_PREFIX}${dormitoryId}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse latest data:', e);
    }
  }
  return null;
}

// 从本地存储获取历史数据
export function getHistoryFromLocal(dormitoryId: string, days: number = 30): DormitoryData[] {
  const historyKey = `${STORAGE_KEYS.HISTORY_PREFIX}${dormitoryId}`;
  const saved = localStorage.getItem(historyKey);
  
  if (saved) {
    try {
      const history: DormitoryData[] = JSON.parse(saved);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return history.filter(h => new Date(h.timestamp) >= cutoffDate);
    } catch (e) {
      console.error('Failed to parse history:', e);
    }
  }
  return [];
}

// 获取时段分析数据
export function getHourlyDataFromLocal(dormitoryId: string, days: number = 7): HourlyData[] {
  const history = getHistoryFromLocal(dormitoryId, days);
  const hourlyData: Record<number, HourlyData> = {};
  
  // 初始化24小时
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = {
      hour: i,
      count: 0,
      avgBalance: 0,
      avgConsumption: 0,
      records: []
    };
  }
  
  // 按小时分组
  history.forEach(record => {
    const hour = record.hour;
    if (hourlyData[hour]) {
      hourlyData[hour].records.push(record);
      hourlyData[hour].count++;
    }
  });
  
  // 计算每小时的统计数据
  Object.keys(hourlyData).forEach(hourKey => {
    const hour = parseInt(hourKey);
    const records = hourlyData[hour].records;
    
    if (records.length > 0) {
      // 平均余额
      const balanceSum = records.reduce((acc, r) => acc + r.deviceInfo.deviceBalance, 0);
      hourlyData[hour].avgBalance = balanceSum / records.length;
      
      // 计算用电量（如果有足够的数据点）
      if (records.length >= 2) {
        const sorted = [...records].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const firstBalance = sorted[0].deviceInfo.deviceBalance;
        const lastBalance = sorted[sorted.length - 1].deviceInfo.deviceBalance;
        const price = sorted[0].deviceInfo.devicePrice;
        hourlyData[hour].avgConsumption = (firstBalance - lastBalance) / price / records.length;
      }
    }
  });
  
  return Object.values(hourlyData);
}

// 获取所有宿舍对比数据
export function getComparisonDataFromLocal(): ComparisonData[] {
  const comparisonData: ComparisonData[] = [];
  
  DORMITORIES.forEach(dorm => {
    const latest = getLatestDataFromLocal(dorm.id);
    const history = getHistoryFromLocal(dorm.id, 7);
    
    if (latest) {
      // 计算7天用电量
      let consumption7d = 0;
      if (history.length >= 2) {
        const sorted = [...history].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const firstBalance = sorted[0].deviceInfo.deviceBalance;
        const lastBalance = sorted[sorted.length - 1].deviceInfo.deviceBalance;
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
  });
  
  // 按余额排序
  comparisonData.sort((a, b) => b.currentBalance - a.currentBalance);
  
  return comparisonData;
}

// API调用函数（如果有后端服务）
export async function fetchLatestData(dormitoryId: string): Promise<DormitoryData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dormitories/${dormitoryId}/latest`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // 保存到本地
      saveDataToLocal(result.data);
      return result.data;
    }
  } catch (error) {
    console.log('API not available, using local data');
  }
  
  // 如果API失败，使用本地数据
  return getLatestDataFromLocal(dormitoryId);
}

export async function fetchHistoryData(dormitoryId: string, days: number = 30): Promise<DormitoryData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dormitories/${dormitoryId}/history?days=${days}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.log('API not available, using local data');
  }
  
  return getHistoryFromLocal(dormitoryId, days);
}

export async function fetchHourlyData(dormitoryId: string, days: number = 7): Promise<HourlyData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dormitories/${dormitoryId}/hourly?days=${days}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.log('API not available, using local data');
  }
  
  return getHourlyDataFromLocal(dormitoryId, days);
}

export async function fetchComparisonData(): Promise<ComparisonData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/comparison`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.log('API not available, using local data');
  }
  
  return getComparisonDataFromLocal();
}

export async function triggerScrape(dormitoryId?: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dormitoryId ? { dormitoryId } : {})
    });
  } catch (error) {
    console.log('API not available');
  }
}

// 添加新宿舍
export function addDormitory(dormitory: Dormitory): boolean {
  const exists = DORMITORIES.find(d => d.id === dormitory.id);
  if (exists) {
    return false;
  }
  
  DORMITORIES.push(dormitory);
  return true;
}

// 获取所有宿舍列表
export function getDormitoryList(): Dormitory[] {
  return [...DORMITORIES];
}
