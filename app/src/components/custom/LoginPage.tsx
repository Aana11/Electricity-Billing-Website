import { useState } from 'react';
import { Zap, Eye, EyeOff, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (account: string, password: string) => Promise<boolean>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account.trim()) {
      toast.error('请输入账号');
      return;
    }
    
    if (!password.trim()) {
      toast.error('请输入密码');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await onLogin(account, password);
      if (success) {
        toast.success('登录成功');
      } else {
        toast.error('登录失败', {
          description: '账号或密码错误，请重试'
        });
      }
    } catch (error) {
      toast.error('登录出错', {
        description: '请检查网络连接后重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07c160]/10 via-white to-[#07c160]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-electric mb-4 shadow-lg shadow-[#07c160]/30">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">电费数据中心</h1>
          <p className="text-gray-500 mt-1">南宁师范大学</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5 text-[#07c160]" />
            <h2 className="text-lg font-semibold text-gray-900">宿舍登录</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 账号输入 */}
            <div className="space-y-2">
              <Label htmlFor="account" className="text-gray-700">
                账号（手机号）
              </Label>
              <Input
                id="account"
                type="text"
                placeholder="请输入电费系统账号"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="h-12 border-gray-200 focus:border-[#07c160] focus:ring-[#07c160]/20"
                disabled={isLoading}
              />
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                密码
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-gray-200 focus:border-[#07c160] focus:ring-[#07c160]/20 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p>使用电费充值平台的账号密码登录</p>
              <p className="text-xs mt-1 text-gray-400">登录后可查看该宿舍的电费数据和充值记录</p>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-electric hover:opacity-90 text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* 底部信息 */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              数据来源于南宁师范大学电费充值平台
            </p>
          </div>
        </div>

        {/* 功能特点 */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
            <div className="text-[#07c160] font-semibold text-lg">实时</div>
            <div className="text-xs text-gray-500">余额查询</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
            <div className="text-[#07c160] font-semibold text-lg">趋势</div>
            <div className="text-xs text-gray-500">用电分析</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
            <div className="text-[#07c160] font-semibold text-lg">对比</div>
            <div className="text-xs text-gray-500">宿舍排名</div>
          </div>
        </div>
      </div>
    </div>
  );
}
