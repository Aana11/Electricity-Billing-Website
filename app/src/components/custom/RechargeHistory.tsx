import { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, Clock, User, CreditCard, ChevronRight } from 'lucide-react';
import type { RechargeRecord } from '@/types';

interface RechargeHistoryProps {
  records: RechargeRecord[];
}

export function RechargeHistory({ records }: RechargeHistoryProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 获取状态图标和样式
  const getStatusInfo = (statusCode: number) => {
    switch (statusCode) {
      case 2: // 支付成功
        return {
          icon: CheckCircle2,
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          label: '支付成功'
        };
      case 3: // 取消支付
        return {
          icon: XCircle,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600',
          label: '已取消'
        };
      case 4: // 支付失败
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          label: '支付失败'
        };
      case 5: // 已退款
        return {
          icon: Clock,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          label: '已退款'
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          label: '处理中'
        };
    }
  };

  // 计算充值统计
  const totalRecharge = records
    .filter(r => r.statusCode === 2)
    .reduce((sum, r) => sum + r.amount, 0);
  
  const successCount = records.filter(r => r.statusCode === 2).length;

  return (
    <div className={`rounded-xl bg-white p-5 shadow-card transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <History className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">充值记录</h3>
            <p className="text-xs text-gray-500">最近充值明细</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-sm text-[#07c160] hover:text-[#06ad56] transition-colors">
          查看全部
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-green-50 p-3">
          <div className="flex items-center gap-1.5 text-green-600 mb-1">
            <CreditCard className="h-3.5 w-3.5" />
            <span className="text-xs">累计充值</span>
          </div>
          <p className="font-number text-xl font-semibold text-green-700">
            ¥{totalRecharge.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs">成功笔数</span>
          </div>
          <p className="font-number text-xl font-semibold text-blue-700">
            {successCount} <span className="text-sm font-normal">笔</span>
          </p>
        </div>
      </div>

      {/* 时间线列表 */}
      <div className="relative">
        {/* 时间线 */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100" />
        
        {/* 记录项 */}
        <div className="space-y-3">
          {records.slice(0, 5).map((record, index) => {
            const statusInfo = getStatusInfo(record.statusCode);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div 
                key={record.id}
                className="relative flex items-start gap-4 pl-1"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible ? 'fadeInUp 0.4s ease-out forwards' : 'none',
                  opacity: isVisible ? 1 : 0
                }}
              >
                {/* 状态图标 */}
                <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${statusInfo.bgColor}`}>
                  <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                </div>
                
                {/* 内容 */}
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        +¥{record.amount.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(record.payTime)}
                    </span>
                  </div>
                  
                  {/* 充值人信息 */}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{record.rechargeBy || '未知'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span className="font-mono">{record.orderNo.slice(-8)}</span>
                    </div>
                  </div>
                  
                  {/* 时间详情 */}
                  <div className="mt-1 text-xs text-gray-400">
                    {record.payTime}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {records.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <History className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>暂无充值记录</p>
          </div>
        )}
      </div>

      {/* 充值提示 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-2 w-2 rounded-full bg-[#07c160] animate-pulse" />
          <span>建议余额低于20元时及时充值</span>
        </div>
      </div>
    </div>
  );
}
