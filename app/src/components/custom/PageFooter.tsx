import { Info, Clock, Shield } from 'lucide-react';

interface PageFooterProps {
  userName: string;
  mobile: string;
  updateTime: string;
}

export function PageFooter({ userName, mobile, updateTime }: PageFooterProps) {
  return (
    <footer className="mt-8 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 信息卡片 */}
        <div className="rounded-xl bg-gray-50 p-4 space-y-3">
          {/* 用户信息 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <Info className="h-3 w-3 text-gray-400" />
            </div>
            <span>用户：{userName} ({mobile})</span>
          </div>
          
          {/* 更新时间 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <Clock className="h-3 w-3 text-gray-400" />
            </div>
            <span>数据更新时间：{updateTime}</span>
          </div>
          
          {/* 免责声明 */}
          <div className="flex items-start gap-2 text-xs text-gray-400 pt-2 border-t border-gray-200">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shrink-0 mt-0.5">
              <Shield className="h-3 w-3 text-gray-300" />
            </div>
            <p>
              本页面数据仅供参考，实际数据以南宁师范大学官方电费充值平台为准。
              如有疑问，请联系学校后勤部门。
            </p>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>© 2026 南宁师范大学电费数据中心 · 13栋513宿舍</p>
        </div>
      </div>
    </footer>
  );
}
