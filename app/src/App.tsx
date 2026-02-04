import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, 
  Gauge, 
  Home, 
  TrendingUp,
  Battery,
  Calendar,
  RefreshCw,
  Plus,
  LogOut
} from 'lucide-react';
import { PageHeader } from '@/components/custom/PageHeader';
import { PageFooter } from '@/components/custom/PageFooter';
import { BalanceCard } from '@/components/custom/BalanceCard';
import { StatCard } from '@/components/custom/StatCard';
import { ConsumptionChart } from '@/components/custom/ConsumptionChart';
import { BalanceChart } from '@/components/custom/BalanceChart';
import { MonthlyStats } from '@/components/custom/MonthlyStats';
import { RechargeHistory } from '@/components/custom/RechargeHistory';
import { DormitorySwitcher } from '@/components/custom/DormitorySwitcher';
import { HourlyAnalysisChart } from '@/components/custom/HourlyAnalysisChart';
import { DormitoryComparison } from '@/components/custom/DormitoryComparison';
import { LoginPage } from '@/components/custom/LoginPage';
import { 
  DORMITORIES, 
  getCurrentDormitory, 
  setCurrentDormitory as saveCurrentDormitory,
  getLatestDataFromLocal,
  getHistoryFromLocal,
  getHourlyDataFromLocal,
  getComparisonDataFromLocal,
  saveDataToLocal,
  fetchLatestData
} from '@/data/dormitoryData';
import { loginToElectricitySystem } from '@/data/electricityData';
import { electricityData, fetchRechargeRecords } from '@/data/electricityData';
import type { Dormitory, DormitoryData, HourlyData, ComparisonData, RechargeRecord } from '@/types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 登录状态存储键
const AUTH_KEY = 'elec_auth';

function App() {
  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [, setCurrentUser] = useState<{ account: string; userName: string } | null>(null);
  
  // 当前选中的宿舍
  const [currentDormitory, setCurrentDormitoryState] = useState<Dormitory>(getCurrentDormitory());
  
  // 数据状态
  const [latestData, setLatestData] = useState<DormitoryData | null>(null);
  const [historyData, setHistoryData] = useState<DormitoryData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
  
  // UI状态
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);

  // 新宿舍表单
  const [newDormitory, setNewDormitory] = useState({
    id: '',
    name: '',
    building: '',
    roomNumber: '',
    account: '',
    password: ''
  });

  // 检查登录状态
  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setIsLoggedIn(true);
        setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  // 初始化数据（登录后）
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const init = async () => {
      // 加载本地数据
      const saved = getLatestDataFromLocal(currentDormitory.id);
      if (saved) {
        setLatestData(saved);
      } else {
        // 使用默认数据
        const defaultData: DormitoryData = {
          dormitoryId: currentDormitory.id,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
          hour: new Date().getHours(),
          userInfo: electricityData.userInfo,
          roomInfo: {
            ...electricityData.roomInfo,
            building: currentDormitory.building,
            roomNumber: currentDormitory.roomNumber,
            floor: currentDormitory.floor
          },
          deviceInfo: electricityData.deviceInfo
        };
        setLatestData(defaultData);
        saveDataToLocal(defaultData);
      }

      // 加载历史数据
      const history = getHistoryFromLocal(currentDormitory.id, 30);
      setHistoryData(history);

      // 加载时段数据
      const hourly = getHourlyDataFromLocal(currentDormitory.id, 7);
      setHourlyData(hourly);

      // 加载对比数据
      const comparison = getComparisonDataFromLocal();
      setComparisonData(comparison);

      // 加载充值记录
      const records = await fetchRechargeRecords();
      setRechargeRecords(records);

      // 页面加载动画
      setTimeout(() => {
        setIsPageLoaded(true);
      }, 100);
    };

    init();
  }, [isLoggedIn, currentDormitory]);

  // 登录处理
  const handleLogin = async (account: string, password: string): Promise<boolean> => {
    const result = await loginToElectricitySystem(account, password);
    
    if (result.success && result.data) {
      // 保存登录状态
      const authData = {
        account,
        userName: result.data.userInfo.realName,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setCurrentUser(authData);
      setIsLoggedIn(true);
      
      // 保存数据
      const dormData: DormitoryData = {
        dormitoryId: currentDormitory.id,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        hour: new Date().getHours(),
        userInfo: result.data.userInfo,
        roomInfo: result.data.roomInfo,
        deviceInfo: result.data.deviceInfo
      };
      setLatestData(dormData);
      saveDataToLocal(dormData);
      
      // 更新充值记录
      setRechargeRecords(result.data.rechargeRecords);
      
      return true;
    }
    
    return false;
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    setCurrentUser(null);
    toast.success('已退出登录');
  };

  // 切换宿舍
  const handleSwitchDormitory = useCallback((dormitory: Dormitory) => {
    setCurrentDormitoryState(dormitory);
    saveCurrentDormitory(dormitory.id);
    setIsPageLoaded(false);
    
    // 重新加载数据
    setTimeout(() => {
      const saved = getLatestDataFromLocal(dormitory.id);
      if (saved) {
        setLatestData(saved);
      }
      
      const history = getHistoryFromLocal(dormitory.id, 30);
      setHistoryData(history);
      
      const hourly = getHourlyDataFromLocal(dormitory.id, 7);
      setHourlyData(hourly);
      
      setIsPageLoaded(true);
      toast.success(`已切换到 ${dormitory.name}`);
    }, 100);
  }, []);

  // 刷新数据
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // 尝试从API获取最新数据
      const newData = await fetchLatestData(currentDormitory.id);
      
      if (newData) {
        setLatestData(newData);
        saveDataToLocal(newData);
        
        // 刷新历史数据
        const history = getHistoryFromLocal(currentDormitory.id, 30);
        setHistoryData(history);
        
        // 刷新时段数据
        const hourly = getHourlyDataFromLocal(currentDormitory.id, 7);
        setHourlyData(hourly);
        
        // 刷新对比数据
        const comparison = getComparisonDataFromLocal();
        setComparisonData(comparison);
        
        // 刷新充值记录
        const records = await fetchRechargeRecords();
        setRechargeRecords(records);
        
        setLastUpdate(new Date());
        toast.success('数据已更新', {
          description: `余额：¥${newData.deviceInfo.deviceBalance.toFixed(2)}`,
        });
      } else {
        toast.error('更新失败', {
          description: '请稍后重试',
        });
      }
    } catch (error) {
      toast.error('更新失败', {
        description: '请稍后重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 添加新宿舍
  const handleAddDormitory = () => {
    if (!newDormitory.id || !newDormitory.name || !newDormitory.account || !newDormitory.password) {
      toast.error('请填写完整信息');
      return;
    }

    // 这里应该调用API验证账号并获取数据
    // 现在只是模拟添加
    const dormitory: Dormitory = {
      id: newDormitory.id,
      name: newDormitory.name,
      building: newDormitory.building || '',
      roomNumber: newDormitory.roomNumber || '',
      floor: '',
      userName: ''
    };

    DORMITORIES.push(dormitory);
    
    // 创建默认数据
    const defaultData: DormitoryData = {
      dormitoryId: dormitory.id,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      hour: new Date().getHours(),
      userInfo: { realName: '', mobile: '', gender: '男' },
      roomInfo: {
        roomName: dormitory.name,
        roomId: '',
        building: dormitory.building,
        floor: '',
        roomNumber: dormitory.roomNumber
      },
      deviceInfo: {
        deviceName: '',
        deviceType: '电表',
        deviceNo: '',
        deviceBalance: 0,
        updateTime: new Date().toISOString(),
        isOnline: true,
        devicePrice: 0.5441,
        roomId: '',
        roomInfo: ''
      }
    };
    
    saveDataToLocal(defaultData);
    setShowAddDialog(false);
    toast.success('宿舍添加成功');
    
    // 切换到新宿舍
    handleSwitchDormitory(dormitory);
  };

  // 格式化更新时间
  const formatUpdateTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 转换历史数据为图表格式
  const getDailyConsumption = () => {
    const consumptionMap = new Map();
    
    historyData.forEach(record => {
      const date = record.date;
      if (!consumptionMap.has(date)) {
        consumptionMap.set(date, {
          date,
          consumption: 0,
          cost: 0,
          count: 0,
          balance: record.deviceInfo.deviceBalance
        });
      }
    });

    // 按日期排序并计算用电量
    const sortedDates = Array.from(consumptionMap.keys()).sort();
    const result = [];
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const prevRecord = historyData.find(h => h.date === prevDate);
      const currRecord = historyData.find(h => h.date === currDate);
      
      if (prevRecord && currRecord) {
        const balanceDiff = prevRecord.deviceInfo.deviceBalance - currRecord.deviceInfo.deviceBalance;
        const consumption = Math.max(0, balanceDiff / prevRecord.deviceInfo.devicePrice);
        const cost = balanceDiff;
        
        result.push({
          date: currDate,
          consumption: Math.round(consumption * 10) / 10,
          cost: Math.round(cost * 100) / 100
        });
      }
    }
    
    return result.length > 0 ? result : electricityData.dailyConsumption;
  };

  // 转换余额历史
  const getBalanceHistory = () => {
    if (historyData.length === 0) {
      return electricityData.balanceHistory;
    }
    
    return historyData
      .filter((record, index, arr) => {
        // 每天只保留一条记录
        return arr.findIndex(r => r.date === record.date) === index;
      })
      .map(record => ({
        date: record.date,
        balance: record.deviceInfo.deviceBalance
      }));
  };

  // 未登录时显示登录页面
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!latestData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <PageHeader
        title="电费数据中心"
        subtitle={`${currentDormitory.name} · 更新于 ${formatUpdateTime(lastUpdate)}`}
        userName={latestData.userInfo.realName || currentDormitory.userName}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`space-y-4 transition-all duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* 退出登录按钮 */}
          <div className={`flex justify-end transition-all duration-500 delay-75 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </div>

          {/* 宿舍切换器 + 余额卡片 */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-500 delay-100 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="sm:w-auto">
              <DormitorySwitcher
                dormitories={DORMITORIES}
                currentDormitory={currentDormitory}
                onSwitch={handleSwitchDormitory}
                onAddDormitory={() => setShowAddDialog(true)}
              />
            </div>
            <div className="flex-1">
              <BalanceCard
                balance={latestData.deviceInfo.deviceBalance}
                updateTime={latestData.deviceInfo.updateTime}
                isOnline={latestData.deviceInfo.isOnline}
                onRefresh={handleRefresh}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* 关键指标卡片组 */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-all duration-500 delay-200 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <StatCard
              icon={Zap}
              iconBgColor="bg-green-50"
              iconColor="text-[#07c160]"
              label="当前电价"
              value={`${latestData.deviceInfo.devicePrice} 元/度`}
              description="居民用电标准"
              delay={100}
            />
            <StatCard
              icon={Gauge}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
              label="电表编号"
              value={latestData.deviceInfo.deviceNo || '---'}
              description={latestData.deviceInfo.isOnline ? '在线正常运行' : '离线'}
              delay={200}
            />
            <StatCard
              icon={Home}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
              label="宿舍位置"
              value={`${currentDormitory.building}-${currentDormitory.roomNumber}`}
              description="武鸣校区桂园公寓"
              delay={300}
            />
          </div>

          {/* 图表区域 - 用电趋势 + 时段分析 */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-500 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <ConsumptionChart data={getDailyConsumption()} />
            <HourlyAnalysisChart data={hourlyData} />
          </div>

          {/* 图表区域 - 余额变化 + 宿舍对比 */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-500 delay-400 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <BalanceChart data={getBalanceHistory()} />
            <DormitoryComparison 
              data={comparisonData} 
              currentDormitoryId={currentDormitory.id}
            />
          </div>

          {/* 统计和记录区域 */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-500 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <MonthlyStats
              currentMonthConsumption={electricityData.monthlyStats.currentMonthConsumption}
              currentMonthCost={electricityData.monthlyStats.currentMonthCost}
              avgDailyConsumption={electricityData.monthlyStats.avgDailyConsumption}
              avgDailyCost={electricityData.monthlyStats.avgDailyCost}
              estimatedDays={Math.floor(latestData.deviceInfo.deviceBalance / (electricityData.monthlyStats.avgDailyCost || 1.5))}
              ranking={comparisonData.findIndex(d => d.dormitoryId === currentDormitory.id) + 1 || 1}
              totalRooms={comparisonData.length || 1}
            />
            <RechargeHistory records={rechargeRecords} />
          </div>

          {/* 快速提示卡片 */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all duration-500 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {[
              { icon: Battery, label: '当前余额', value: `¥${latestData.deviceInfo.deviceBalance.toFixed(2)}`, color: 'text-green-600', bgColor: 'bg-green-50' },
              { icon: TrendingUp, label: '今日用电', value: `${getDailyConsumption().slice(-1)[0]?.consumption.toFixed(1) || 0} 度`, color: 'text-blue-600', bgColor: 'bg-blue-50' },
              { icon: Calendar, label: '预计可用', value: `${Math.floor(latestData.deviceInfo.deviceBalance / (electricityData.monthlyStats.avgDailyCost || 1.5))} 天`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
              { icon: Zap, label: '本月电费', value: `¥${electricityData.monthlyStats.currentMonthCost.toFixed(2)}`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            ].map((item, index) => (
              <div 
                key={index}
                className="rounded-xl bg-white p-3 shadow-card flex items-center gap-3 hover:shadow-card-hover transition-all duration-300"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className={`font-number font-semibold ${item.color}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 页面底部 */}
      <PageFooter
        userName={latestData.userInfo.realName || currentDormitory.userName}
        mobile={latestData.userInfo.mobile}
        updateTime={latestData.deviceInfo.updateTime}
      />

      {/* 添加宿舍对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加新宿舍</DialogTitle>
            <DialogDescription>
              输入宿舍信息和登录账号，系统将自动获取电费数据
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dorm-id">宿舍ID</Label>
                <Input
                  id="dorm-id"
                  placeholder="如: 13-514"
                  value={newDormitory.id}
                  onChange={e => setNewDormitory({...newDormitory, id: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dorm-name">宿舍名称</Label>
                <Input
                  id="dorm-name"
                  placeholder="如: 13栋514"
                  value={newDormitory.name}
                  onChange={e => setNewDormitory({...newDormitory, name: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="building">楼栋</Label>
                <Input
                  id="building"
                  placeholder="如: 13栋"
                  value={newDormitory.building}
                  onChange={e => setNewDormitory({...newDormitory, building: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">房号</Label>
                <Input
                  id="room"
                  placeholder="如: 514"
                  value={newDormitory.roomNumber}
                  onChange={e => setNewDormitory({...newDormitory, roomNumber: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">登录账号</Label>
              <Input
                id="account"
                placeholder="手机号"
                value={newDormitory.account}
                onChange={e => setNewDormitory({...newDormitory, account: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">登录密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="密码"
                value={newDormitory.password}
                onChange={e => setNewDormitory({...newDormitory, password: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddDormitory} className="bg-[#07c160] hover:bg-[#06ad56]">
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
