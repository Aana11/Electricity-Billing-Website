import { useState } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { Clock, TrendingUp, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import type { HourlyData } from '@/types';

interface HourlyAnalysisChartProps {
  data: HourlyData[];
}

type ViewMode = 'consumption' | 'balance';

export function HourlyAnalysisChart({ data }: HourlyAnalysisChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('consumption');

  // 处理数据，标记高峰时段
  const processedData = data.map(item => {
    const hour = item.hour;
    let timeLabel = '';
    let period = '';
    
    if (hour >= 6 && hour < 12) {
      timeLabel = '上午';
      period = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timeLabel = '下午';
      period = 'afternoon';
    } else if (hour >= 18 && hour < 24) {
      timeLabel = '晚上';
      period = 'evening';
    } else {
      timeLabel = '凌晨';
      period = 'night';
    }
    
    return {
      ...item,
      timeLabel,
      period,
      displayHour: `${hour.toString().padStart(2, '0')}:00`
    };
  });

  // 找出用电高峰和低谷
  const maxConsumption = Math.max(...processedData.map(d => d.avgConsumption));
  const minConsumption = Math.min(...processedData.map(d => d.avgConsumption));
  const peakHour = processedData.find(d => d.avgConsumption === maxConsumption);
  const valleyHour = processedData.find(d => d.avgConsumption === minConsumption);

  // 计算各时段平均用电
  const periodStats = {
    morning: processedData.filter(d => d.period === 'morning'),
    afternoon: processedData.filter(d => d.period === 'afternoon'),
    evening: processedData.filter(d => d.period === 'evening'),
    night: processedData.filter(d => d.period === 'night')
  };

  const getPeriodAvg = (periodData: typeof processedData) => {
    if (periodData.length === 0) return 0;
    const sum = periodData.reduce((acc, d) => acc + d.avgConsumption, 0);
    return sum / periodData.length;
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = processedData.find(d => d.displayHour === label);
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">{label} {item?.timeLabel}</p>
          {viewMode === 'consumption' ? (
            <>
              <p className="text-lg font-semibold text-gray-900">
                {payload[0].value.toFixed(2)} <span className="text-sm font-normal text-gray-500">度</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                基于 {item?.count || 0} 条记录
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-900">
                ¥{payload[0].value.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                平均余额
              </p>
            </>
          )}
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">时段用电分析</h3>
            <p className="text-xs text-gray-500">24小时用电分布</p>
          </div>
        </div>
        
        {/* 视图切换 */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('consumption')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === 'consumption'
                ? 'bg-white text-[#07c160] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            用电量
          </button>
          <button
            onClick={() => setViewMode('balance')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              viewMode === 'balance'
                ? 'bg-white text-[#07c160] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            余额变化
          </button>
        </div>
      </div>

      {/* 时段统计 */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'morning', label: '上午 (6-12点)', icon: Sunrise, color: 'text-orange-500', bgColor: 'bg-orange-50' },
          { key: 'afternoon', label: '下午 (12-18点)', icon: Sun, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
          { key: 'evening', label: '晚上 (18-24点)', icon: Sunset, color: 'text-purple-500', bgColor: 'bg-purple-50' },
          { key: 'night', label: '凌晨 (0-6点)', icon: Moon, color: 'text-blue-500', bgColor: 'bg-blue-50' }
        ].map(({ key, label, icon: Icon, color, bgColor }) => {
          const periodData = periodStats[key as keyof typeof periodStats];
          const avg = getPeriodAvg(periodData);
          return (
            <div key={key} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`flex h-5 w-5 items-center justify-center rounded ${bgColor}`}>
                  <Icon className={`h-3 w-3 ${color}`} />
                </div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <p className="font-number text-lg font-semibold text-gray-900">
                {avg.toFixed(2)} <span className="text-xs font-normal text-gray-500">度</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* 高峰低谷信息 */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {peakHour && (
          <div className="flex items-center gap-2 text-red-500">
            <TrendingUp className="h-4 w-4" />
            <span>用电高峰: {peakHour.displayHour} ({peakHour.avgConsumption.toFixed(2)}度)</span>
          </div>
        )}
        {valleyHour && (
          <div className="flex items-center gap-2 text-green-500">
            <TrendingUp className="h-4 w-4 rotate-180" />
            <span>用电低谷: {valleyHour.displayHour} ({valleyHour.avgConsumption.toFixed(2)}度)</span>
          </div>
        )}
      </div>

      {/* 图表 */}
      <div className="mt-5 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="displayHour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 11 }}
              interval={2}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 时段背景 */}
            <ReferenceLine x="06:00" stroke="#e5e5e5" strokeDasharray="2 2" />
            <ReferenceLine x="12:00" stroke="#e5e5e5" strokeDasharray="2 2" />
            <ReferenceLine x="18:00" stroke="#e5e5e5" strokeDasharray="2 2" />
            
            {viewMode === 'consumption' ? (
              <Bar
                dataKey="avgConsumption"
                fill="#07c160"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="avgBalance"
                stroke="#10aeff"
                strokeWidth={2}
                dot={{ fill: '#10aeff', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, stroke: '#10aeff', strokeWidth: 2, fill: '#fff' }}
                animationDuration={800}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 图例说明 */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[#07c160]" />
          <span>平均用电量</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-gray-300" />
          <span>时段分界</span>
        </div>
      </div>
    </div>
  );
}
