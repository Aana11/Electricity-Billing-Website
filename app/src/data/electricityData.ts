import type { ElectricityData, RechargeRecord } from '@/types';

// 从API获取的真实充值记录数据
const realRechargeRecords: RechargeRecord[] = [
  {
    id: '917069918657060864',
    orderNo: 'N202512051508260000002004',
    tradeNo: '4200002929202512057999445955',
    amount: 190.0,
    date: '2025-12-05',
    payTime: '2025-12-05 15:08:33',
    status: '支付成功',
    statusCode: 2,
    rechargeBy: '周逸飞',
    roomInfo: '武鸣校区桂园公寓13栋5楼学生宿舍桂园公寓13-513',
    deviceNo: '003101003732',
    orderType: '电费充值'
  }
];

// 生成更多模拟充值记录（用于展示）
const generateMockRechargeRecords = (): RechargeRecord[] => {
  const records: RechargeRecord[] = [...realRechargeRecords];
  
  // 添加一些模拟记录
  const mockData = [
    { amount: 50, date: '2025-11-20', rechargeBy: '周逸飞' },
    { amount: 100, date: '2025-11-05', rechargeBy: '周逸飞' },
    { amount: 50, date: '2025-10-28', rechargeBy: '室友A' },
    { amount: 100, date: '2025-10-15', rechargeBy: '周逸飞' },
  ];
  
  mockData.forEach((item, index) => {
    records.push({
      id: `mock_${index}`,
      orderNo: `N2025${Math.random().toString(36).substr(2, 10)}`,
      tradeNo: `420000${Math.random().toString(36).substr(2, 20)}`,
      amount: item.amount,
      date: item.date,
      payTime: `${item.date} ${10 + index}:30:00`,
      status: '支付成功',
      statusCode: 2,
      rechargeBy: item.rechargeBy,
      roomInfo: '武鸣校区桂园公寓13栋5楼学生宿舍桂园公寓13-513',
      deviceNo: '003101003732',
      orderType: '电费充值'
    });
  });
  
  // 按时间倒序排列
  return records.sort((a, b) => 
    new Date(b.payTime).getTime() - new Date(a.payTime).getTime()
  );
};

// 从API获取的真实数据
const realTimeData = {
  userInfo: {
    realName: '周逸飞',
    mobile: '199****6925',
    gender: '男',
  },
  roomInfo: {
    roomName: '武鸣校区桂园公寓13栋5楼学生宿舍桂园公寓13-513',
    roomId: '878680437252165632',
    building: '13栋',
    floor: '5楼',
    roomNumber: '513',
  },
  deviceInfo: {
    deviceName: '003101003732-电表',
    deviceType: '电表',
    deviceNo: '003101003732',
    deviceBalance: 96.28,
    updateTime: '2026-02-04 04:03:00',
    isOnline: true,
    devicePrice: 0.5441,
    roomId: '878680437252165632',
    roomInfo: '武鸣校区桂园公寓13栋5楼学生宿舍桂园公寓13-513',
  },
};

// 生成近30天用电数据（模拟数据）
const generateDailyConsumption = () => {
  const data = [];
  const baseConsumption = 2.5;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date('2026-02-04');
    date.setDate(date.getDate() - i);
    
    // 模拟用电波动：工作日较高，周末较低
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const randomFactor = 0.7 + Math.random() * 0.6;
    const weekendFactor = isWeekend ? 0.8 : 1.2;
    
    const consumption = Math.round(baseConsumption * randomFactor * weekendFactor * 10) / 10;
    const cost = Math.round(consumption * 0.5441 * 100) / 100;
    
    data.push({
      date: date.toISOString().split('T')[0],
      consumption,
      cost,
    });
  }
  
  return data;
};

// 生成余额历史数据（模拟数据）
const generateBalanceHistory = () => {
  const data = [];
  let currentBalance = 96.28;
  const dailyData = generateDailyConsumption();
  
  // 从最近一天往前推算
  for (let i = 0; i < dailyData.length; i++) {
    const day = dailyData[dailyData.length - 1 - i];
    data.unshift({
      date: day.date,
      balance: Math.round(currentBalance * 100) / 100,
    });
    
    // 扣除当天用电费用
    currentBalance += day.cost;
    
    // 模拟充值（每10天左右充值一次）
    if (i % 10 === 9) {
      currentBalance += 50;
    }
  }
  
  return data;
};

// 月度统计（基于模拟数据计算）
const dailyConsumption = generateDailyConsumption();
const currentMonthConsumption = dailyConsumption.reduce((sum, day) => sum + day.consumption, 0);
const currentMonthCost = dailyConsumption.reduce((sum, day) => sum + day.cost, 0);

const monthlyStats = {
  currentMonthConsumption: Math.round(currentMonthConsumption * 10) / 10,
  currentMonthCost: Math.round(currentMonthCost * 100) / 100,
  avgDailyConsumption: Math.round((currentMonthConsumption / 30) * 10) / 10,
  avgDailyCost: Math.round((currentMonthCost / 30) * 100) / 100,
  estimatedDays: Math.floor(96.28 / (currentMonthCost / 30)),
  ranking: 5,
  totalRooms: 48,
};

// 完整数据对象
export const electricityData: ElectricityData = {
  ...realTimeData,
  dailyConsumption,
  balanceHistory: generateBalanceHistory(),
  rechargeRecords: generateMockRechargeRecords(),
  monthlyStats,
};

// 数据更新函数（模拟API调用）
export const fetchElectricityData = async (): Promise<ElectricityData> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800));
  return electricityData;
};

// 获取最新余额（模拟实时更新）
export const fetchLatestBalance = async (): Promise<number> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // 模拟微小波动
  const fluctuation = (Math.random() - 0.5) * 0.1;
  return Math.round((electricityData.deviceInfo.deviceBalance + fluctuation) * 100) / 100;
};

// 模拟登录API
export const loginToElectricitySystem = async (
  account: string,
  password: string
): Promise<{ success: boolean; message: string; data?: ElectricityData }> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // 验证账号密码（这里使用预设的账号密码进行演示）
  // 实际使用时应该调用真实的API
  if (account === '19940686925' && password === '#ZYFzyf20051029') {
    return {
      success: true,
      message: '登录成功',
      data: electricityData
    };
  }
  
  // 模拟其他宿舍账号
  if (account && password) {
    // 生成模拟数据
    const mockData: ElectricityData = {
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
      },
      dailyConsumption: generateDailyConsumption(),
      balanceHistory: generateBalanceHistory(),
      rechargeRecords: generateMockRechargeRecords(),
      monthlyStats: {
        currentMonthConsumption: 85.5,
        currentMonthCost: 46.52,
        avgDailyConsumption: 2.85,
        avgDailyCost: 1.55,
        estimatedDays: 25,
        ranking: Math.floor(Math.random() * 20) + 1,
        totalRooms: 48,
      },
    };
    
    return {
      success: true,
      message: '登录成功',
      data: mockData
    };
  }
  
  return {
    success: false,
    message: '账号或密码错误'
  };
};

// 获取充值记录
export const fetchRechargeRecords = async (): Promise<RechargeRecord[]> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return generateMockRechargeRecords();
};
