import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Users, TrendingUp, Battery, Building2 } from 'lucide-react';
import type { ComparisonData } from '@/types';

interface DormitoryComparisonProps {
  data: ComparisonData[];
  currentDormitoryId: string;
}

export function DormitoryComparison({ data, currentDormitoryId }: DormitoryComparisonProps) {
  const [sortBy, setSortBy] = useState<'balance' | 'consumption'>('balance');

  // 排序数据
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'balance') {
      return b.currentBalance - a.currentBalance;
    }
    return b.consumption7d - a.consumption7d;
  });

  // 获取当前宿舍排名
  const currentRank = sortedData.findIndex(d => d.dormitoryId === currentDormitoryId) + 1;

  // 格式化数据用于图表
  const chartData = sortedData.map((d, index) => ({
    ...d,
    rank: index + 1,
    isCurrent: d.dormitoryId === currentDormitoryId
  }));

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900">{item.name}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-gray-600">
              余额: <span className="font-semibold text-gray-900">¥{item.currentBalance.toFixed(2)}</span>
            </p>
            <p className="text-gray-600">
              7天用电: <span className="font-semibold text-gray-900">{item.consumption7d.toFixed(1)}度</span>
            </p>
            <p className="text-gray-600">
              排名: <span className="font-semibold text-gray-900">第{item.rank}名</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // 获取颜色
  const getBarColor = (item: typeof chartData[0]) => {
    if (item.isCurrent) return '#07c160';
    if (item.rank <= 3) return '#10aeff';
    return '#e5e5e5';
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
            <Users className="h-4 w-4 text-pink-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">宿舍用电对比</h3>
            <p className="text-xs text-gray-500">
              共 {data.length} 个宿舍 · 你的排名: 第{currentRank}名
            </p>
          </div>
        </div>
        
        {/* 排序选项 */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setSortBy('balance')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              sortBy === 'balance'
                ? 'bg-white text-[#07c160] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            按余额
          </button>
          <button
            onClick={() => setSortBy('consumption')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              sortBy === 'consumption'
                ? 'bg-white text-[#07c160] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            按用电量
          </button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span className="text-xs">总宿舍数</span>
          </div>
          <p className="font-number text-xl font-semibold text-gray-900">{data.length}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Battery className="h-3.5 w-3.5" />
            <span className="text-xs">平均余额</span>
          </div>
          <p className="font-number text-xl font-semibold text-gray-900">
            ¥{(data.reduce((sum, d) => sum + d.currentBalance, 0) / data.length).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs">平均用电</span>
          </div>
          <p className="font-number text-xl font-semibold text-gray-900">
            {(data.reduce((sum, d) => sum + d.consumption7d, 0) / data.length).toFixed(1)}度
          </p>
        </div>
      </div>

      {/* 图表 */}
      <div className="mt-5 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 10 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={sortBy === 'balance' ? 'currentBalance' : 'consumption7d'}
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 图例 */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[#07c160]" />
          <span>当前宿舍</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-[#10aeff]" />
          <span>前三名</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-gray-300" />
          <span>其他宿舍</span>
        </div>
      </div>

      {/* 排名列表 */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="text-sm font-medium text-gray-700 mb-3">用电排行榜</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {chartData.slice(0, 5).map((item, index) => (
            <div
              key={item.dormitoryId}
              className={`flex items-center justify-between p-2 rounded-lg ${
                item.isCurrent ? 'bg-[#e6f7ed]' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-200 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <span className={`text-sm ${item.isCurrent ? 'font-medium text-[#07c160]' : 'text-gray-700'}`}>
                  {item.name}
                </span>
                {item.isCurrent && (
                  <span className="text-xs text-[#07c160] bg-white px-1.5 py-0.5 rounded">当前</span>
                )}
              </div>
              <div className="text-right">
                <div className="font-number font-medium text-gray-900">
                  {sortBy === 'balance' 
                    ? `¥${item.currentBalance.toFixed(2)}`
                    : `${item.consumption7d.toFixed(1)}度`
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
