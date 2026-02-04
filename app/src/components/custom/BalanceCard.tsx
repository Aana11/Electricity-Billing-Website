import { useState, useEffect } from 'react';
import { RefreshCw, Zap, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BalanceCardProps {
  balance: number;
  updateTime: string;
  isOnline: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export function BalanceCard({ balance, updateTime, isOnline, onRefresh, isLoading }: BalanceCardProps) {
  const [displayBalance, setDisplayBalance] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 数字动画效果
  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = balance;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutBack 缓动函数
      const easeOutBack = (t: number) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };
      
      const currentValue = startValue + (endValue - startValue) * easeOutBack(progress);
      setDisplayBalance(Math.round(currentValue * 100) / 100);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [balance]);

  // 格式化金额
  const formatBalance = (value: number) => {
    return value.toFixed(2);
  };

  // 获取余额状态颜色
  const getBalanceStatus = (value: number) => {
    if (value > 50) return 'text-white';
    if (value > 20) return 'text-yellow-200';
    return 'text-red-200';
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-gradient-electric p-6 text-white transition-all duration-300 ${
        isHovered ? 'scale-[1.01] shadow-lg' : 'shadow-card'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景装饰 */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />
      
      {/* 内容 */}
      <div className="relative z-10">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white/90">当前余额</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 在线状态指示器 */}
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-1">
              <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-300 animate-pulse' : 'bg-red-300'}`} />
              <span className="text-xs text-white/90">{isOnline ? '正常' : '离线'}</span>
            </div>
            {/* 刷新按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* 余额显示 */}
        <div className="mt-6">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-medium text-white/80">¥</span>
            <span className={`font-number text-5xl font-bold tracking-tight ${getBalanceStatus(balance)}`}>
              {formatBalance(displayBalance)}
            </span>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Battery className="h-4 w-4" />
            <span>电表在线运行中</span>
          </div>
          <div className="text-xs text-white/60">
            更新于 {updateTime}
          </div>
        </div>

        {/* 余额状态提示 */}
        {balance < 20 && (
          <div className="mt-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-white">
            ⚠️ 余额不足，请及时充值
          </div>
        )}
        {balance >= 20 && balance < 50 && (
          <div className="mt-4 rounded-lg bg-yellow-500/20 px-3 py-2 text-sm text-white">
            💡 余额适中，建议关注用电情况
          </div>
        )}
        {balance >= 50 && (
          <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/90">
            ✓ 余额充足，用电无忧
          </div>
        )}
      </div>
    </div>
  );
}
