// 宿舍信息
export interface Dormitory {
  id: string;
  name: string;
  building: string;
  roomNumber: string;
  floor: string;
  userName: string;
  account?: string;
  password?: string;
}

// 用户信息
export interface UserInfo {
  realName: string;
  mobile: string;
  gender: string;
}

// 设备信息
export interface DeviceInfo {
  deviceName: string;
  deviceType: string;
  deviceNo: string;
  deviceBalance: number;
  updateTime: string;
  isOnline: boolean;
  devicePrice: number;
  roomId: string;
  roomInfo: string;
}

// 房间信息
export interface RoomInfo {
  roomName: string;
  roomId: string;
  building: string;
  floor: string;
  roomNumber: string;
}

// 宿舍数据（包含时间戳）
export interface DormitoryData {
  dormitoryId: string;
  timestamp: string;
  date: string;
  time: string;
  hour: number;
  userInfo: UserInfo;
  roomInfo: RoomInfo;
  deviceInfo: DeviceInfo;
}

// 日用电量
export interface DailyConsumption {
  date: string;
  consumption: number;
  cost: number;
}

// 余额记录
export interface BalanceRecord {
  date: string;
  balance: number;
}

// 充值记录（从API获取的真实数据）
export interface RechargeRecord {
  id: string;
  orderNo: string;
  tradeNo: string;
  amount: number;
  date: string;
  payTime: string;
  status: string;
  statusCode: number;
  rechargeBy: string; // 充值人
  roomInfo: string;
  deviceNo: string;
  orderType: string;
}

// 时段数据
export interface HourlyData {
  hour: number;
  count: number;
  avgBalance: number;
  avgConsumption: number;
  records: DormitoryData[];
}

// 对比数据
export interface ComparisonData {
  dormitoryId: string;
  name: string;
  building: string;
  roomNumber: string;
  currentBalance: number;
  devicePrice: number;
  consumption7d: number;
  updateTime: string;
  isOnline: boolean;
}

// 月度统计
export interface MonthlyStats {
  currentMonthConsumption: number;
  currentMonthCost: number;
  avgDailyConsumption: number;
  avgDailyCost: number;
  estimatedDays: number;
  ranking: number;
  totalRooms: number;
}

// 完整电费数据
export interface ElectricityData {
  userInfo: UserInfo;
  roomInfo: RoomInfo;
  deviceInfo: DeviceInfo;
  dailyConsumption: DailyConsumption[];
  balanceHistory: BalanceRecord[];
  rechargeRecords: RechargeRecord[];
  monthlyStats: MonthlyStats;
}

// 登录凭证
export interface LoginCredentials {
  account: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    userInfo: UserInfo;
    roomInfo: RoomInfo;
    deviceInfo: DeviceInfo;
  };
}
