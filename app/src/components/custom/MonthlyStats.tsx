import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Wallet, 
  Calendar, 
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface MonthlyStatsProps {
  currentMonthConsumption: number;
  currentMonthCost: number;
  avgDailyConsumption: number;
  avgDailyCost: number;
  estimatedDays: number;
  ranking: number;
  totalRooms: number;
}

interface StatItemProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay: number;
}

function StatItem({ 
  icon: Icon, 
  iconBgColor, 
  iconColor, 
  label, 
  value, 
  subValue,
  trend,
  trendValue,
  delay 
}: StatItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-gray-400';

  return (
    <div 
      className={`rounded-xl bg-white p-4 shadow-card transition-all duration-500 hover:shadow-card-hover hover:-translate-y-0.5 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgColor}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-0.5 font-number text-xl font-semibold text-gray-900">{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
          </div>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MonthlyStats({
  currentMonthConsumption,
  currentMonthCost,
  avgDailyCost,
  estimatedDays,
  ranking,
  totalRooms,
}: MonthlyStatsProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      {/* 头部 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
          <BarChart3 className="h-4 w-4 text-purple-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">本月用电统计</h3>
          <p className="text-xs text-gray-500">基于近30天数据分析</p>
        </div>
      </div>

      {/* 统计网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatItem
          icon={BarChart3}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-500"
          label="本月用电"
          value={`${currentMonthConsumption.toFixed(1)} 度`}
          subValue="日均约 2.8 度"
          trend="up"
          trendValue="+12%"
          delay={100}
        />
        <StatItem
          icon={Wallet}
          iconBgColor="bg-red-50"
          iconColor="text-red-500"
          label="本月电费"
          value={`¥${currentMonthCost.toFixed(2)}`}
          subValue={`日均约 ¥${avgDailyCost.toFixed(2)}`}
          delay={200}
        />
        <StatItem
          icon={Calendar}
          iconBgColor="bg-cyan-50"
          iconColor="text-cyan-500"
          label="预计可用天数"
          value={`约 ${estimatedDays} 天`}
          subValue="基于当前用电趋势"
          delay={300}
        />
        <StatItem
          icon={Trophy}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-500"
          label="用电排名"
          value={`${ranking} / ${totalRooms}`}
          subValue="用电适中"
          delay={400}
        />
      </div>

      {/* 进度条 - 用电排名 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">用电水平</span>
          <span className="text-gray-700">{ranking <= totalRooms / 3 ? '偏低' : ranking <= totalRooms * 2 / 3 ? '适中' : '偏高'}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-1000"
            style={{ width: `${(ranking / totalRooms) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>省电</span>
          <span>平均</span>
          <span>高耗</span>
        </div>
      </div>
    </div>
  );
}
