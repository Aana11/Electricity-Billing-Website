import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Wallet, TrendingDown } from 'lucide-react';
import type { BalanceRecord } from '@/types';

interface BalanceChartProps {
  data: BalanceRecord[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 计算余额变化
  const getBalanceChange = () => {
    if (data.length < 2) return 0;
    const firstBalance = data[0].balance;
    const lastBalance = data[data.length - 1].balance;
    return lastBalance - firstBalance;
  };

  const balanceChange = getBalanceChange();

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">
            ¥{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">余额变化趋势</h3>
            <p className="text-xs text-gray-500">近30天余额变化</p>
          </div>
        </div>
        
        {/* 变化指示 */}
        <div className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${
          balanceChange >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          <TrendingDown className={`h-4 w-4 ${balanceChange >= 0 ? 'rotate-180' : ''}`} />
          <span className="text-sm font-medium">
            {balanceChange >= 0 ? '+' : ''}¥{balanceChange.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 图表 */}
      <div className="mt-5 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999', fontSize: 12 }}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#10aeff"
              strokeWidth={2}
              dot={{ fill: '#10aeff', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, stroke: '#10aeff', strokeWidth: 2, fill: '#fff' }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 说明 */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span>余额变化</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>充值记录</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span>日常消费</span>
        </div>
      </div>
    </div>
  );
}
