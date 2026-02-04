import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { DailyConsumption } from '@/types';

interface ConsumptionChartProps {
  data: DailyConsumption[];
}

type TimeRange = '7d' | '30d' | 'all';

export function ConsumptionChart({ data }: ConsumptionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // 根据时间范围过滤数据
  const getFilteredData = () => {
    if (timeRange === '7d') {
      return data.slice(-7);
    } else if (timeRange === '30d') {
      return data.slice(-30);
    }
    return data;
  };

  const filteredData = getFilteredData();

  // 计算统计数据
  const totalConsumption = filteredData.reduce((sum, item) => sum + item.consumption, 0);
  const avgConsumption = totalConsumption / filteredData.length;
  const maxConsumption = Math.max(...filteredData.map(item => item.consumption));

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">
            {payload[0].value.toFixed(1)} <span className="text-sm font-normal text-gray-500">度</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            约 ¥{(payload[0].value * 0.5441).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f7ed]">
            <TrendingUp className="h-4 w-4 text-[#07c160]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">用电趋势分析</h3>
            <p className="text-xs text-gray-500">近{filteredData.length}天用电情况</p>
          </div>
        </div>
        
        {/* 时间范围选择 */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {(['7d', '30d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                timeRange === range
                  ? 'bg-white text-[#07c160] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range === '7d' ? '近7天' : range === '30d' ? '近30天' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">总用电量</p>
          <p className="mt-1 font-number text-lg font-semibold text-gray-900">
            {totalConsumption.toFixed(1)} <span className="text-xs font-normal">度</span>
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">日均用电</p>
          <p className="mt-1 font-number text-lg font-semibold text-gray-900">
            {avgConsumption.toFixed(1)} <span className="text-xs font-normal">度</span>
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">最高单日</p>
          <p className="mt-1 font-number text-lg font-semibold text-gray-900">
            {maxConsumption.toFixed(1)} <span className="text-xs font-normal">度</span>
          </p>
        </div>
      </div>

      {/* 图表 */}
      <div className="mt-5 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#07c160" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#07c160" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="#07c160"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorConsumption)"
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
