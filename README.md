# 电费数据中心 - 鸿蒙原生应用

<p align="center">
  <img src="https://img.shields.io/badge/HarmonyOS-4.0+-07C160?logo=harmonyos" alt="HarmonyOS 4.0+">
  <img src="https://img.shields.io/badge/ArkTS-API%209+-3178C6?logo=typescript" alt="ArkTS API 9+">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

<p align="center">
  <b>南宁师范大学电费数据中心 - 鸿蒙原生应用</b>
</p>

<p align="center">
  基于 HarmonyOS NEXT 原生开发，提供流畅的电费数据查询和管理体验
</p>

---

## ✨ 功能特性

| 功能 | 描述 | 状态 |
|------|------|------|
| 🔐 原生登录 | 使用电费系统账号密码登录 | ✅ |
| 💰 余额显示 | 实时余额展示，带数字动画 | ✅ |
| 📊 用电趋势 | 近7/30天用电量柱状图 | ✅ |
| ⏰ 时段分析 | 24小时用电分布分析 | ✅ |
| 📈 余额趋势 | 余额变化折线图 | ✅ |
| 🏠 宿舍对比 | 多宿舍用电量排行榜 | ✅ |
| 💳 充值记录 | 显示充值人信息的充值记录 | ✅ |
| 🔄 宿舍切换 | 支持多宿舍管理和切换 | ✅ |
| 🎨 流畅动画 | 原生动画过渡效果 | ✅ |

---

## 🎬 动画效果展示

### 登录页面
- 渐变背景动画
- 输入框焦点动画
- 按钮按压反馈
- 登录加载动画

### 首页
- 余额数字滚动动画
- 卡片悬停缩放效果
- 图表绘制动画
- 下拉刷新动画
- 页面滚动渐变导航栏

### 图表
- 柱状图逐个升起动画
- 折线图绘制动画
- 数据点弹出效果

---

## 📱 界面预览

```
┌─────────────────────────────┐
│  电费数据中心                    │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  💰 ¥96.28            │  │  ← 余额卡片（渐变背景）
│  │  当前余额    ● 正常      │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 电价 │ │ 电表 │ │ 宿舍 │  │  ← 统计卡片
│  │0.54 │ │0031 │ │13-513│  │
│  └─────┘ └─────┘ └─────┘  │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  📊 用电趋势分析        │  │
│  │    ▓▓▓ ▓▓▓▓ ▓▓ ▓▓▓▓   │  │  ← 柱状图
│  └───────────────────────┘  │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  ⏰ 时段用电分析        │  │
│  │  ▓▓  ▓▓▓  ▓▓▓▓  ▓▓    │  │  ← 24小时分布
│  └───────────────────────┘  │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │  💳 充值记录           │  │
│  │  +¥190 周逸飞 今天     │  │  ← 带充值人信息
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 🛠 技术栈

- **开发语言**: ArkTS (TypeScript for HarmonyOS)
- **UI框架**: ArkUI (声明式UI)
- **状态管理**: @State, @Prop, @Link
- **动画**: ArkUI 动画系统
- **网络**: @ohos.net.http
- **存储**: @ohos.data.preferences

---

## 📁 项目结构

```
entry/src/main/ets/
├── entryability/          # 应用入口
│   └── EntryAbility.ets   # 主Ability
├── pages/                 # 页面
│   ├── LoginPage.ets      # 登录页
│   └── HomePage.ets       # 首页
├── components/            # 组件
│   ├── BalanceCard.ets    # 余额卡片
│   ├── StatCard.ets       # 统计卡片
│   ├── ConsumptionChart.ets   # 用电趋势图
│   ├── HourlyChart.ets    # 时段分析图
│   ├── BalanceChart.ets   # 余额趋势图
│   ├── ComparisonChart.ets    # 宿舍对比图
│   ├── MonthlyStats.ets   # 月度统计
│   └── RechargeList.ets   # 充值记录
├── model/                 # 数据模型
│   └── DormitoryModel.ets # 模型定义
├── utils/                 # 工具类
│   └── DataService.ets    # 数据服务
└── viewmodel/             # 视图模型
    └── HomeViewModel.ets  # 首页VM
```

---

## 🚀 快速开始

### 环境准备

1. 安装 [DevEco Studio 4.0+](https://developer.harmonyos.com/cn/develop/deveco-studio)
2. 安装 HarmonyOS SDK (API 9+)
3. 安装 Node.js 16+

### 运行项目

```bash
# 1. 克隆项目
git clone <repository-url>

# 2. 用 DevEco Studio 打开项目
File > Open > 选择 harmonyos 文件夹

# 3. 等待同步完成
# 首次打开会自动下载依赖

# 4. 创建模拟器或连接真机
Tools > Device Manager

# 5. 运行应用
点击 Run 按钮 或 Shift+F10
```

详细部署指南请参考 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

---

## 📲 安装包

构建完成后，HAP 包位于：

```
entry/build/default/outputs/default/entry-default-signed.hap
```

安装方式：

```bash
# 命令行安装
hdc install entry-default-signed.hap

# 或拖拽安装
# 将 hap 文件拖入模拟器窗口
```

---

## 📝 使用说明

### 登录
1. 打开应用
2. 输入电费系统账号（如：19940686925）
3. 输入密码（如：#ZYFzyf20051029）
4. 点击登录

### 查看数据
- 首页显示当前余额、电价、电表信息
- 下滑查看更多图表和记录
- 点击"切换宿舍"可切换/添加宿舍

### 刷新数据
- 点击右上角刷新按钮
- 或下拉页面刷新

### 退出登录
- 点击右上角退出按钮

---

## 🎨 设计规范

### 色彩系统

| 颜色 | 色值 | 用途 |
|------|------|------|
| 主色 | #07C160 | 按钮、高亮、余额卡片 |
| 主色深 | #06AD56 | 悬停状态 |
| 主色浅 | #E6F7ED | 背景高亮 |
| 背景 | #F5F5F5 | 页面背景 |
| 卡片 | #FFFFFF | 卡片背景 |

### 字体规范

| 级别 | 大小 | 字重 | 用途 |
|------|------|------|------|
| 标题 | 18sp | Bold | 页面标题 |
| 大标题 | 16sp | SemiBold | 卡片标题 |
| 正文 | 14sp | Regular | 普通文本 |
| 小正文 | 12sp | Regular | 辅助文本 |
| 数字大 | 48sp | Bold | 余额显示 |

### 间距规范

- 页面边距：16vp
- 卡片间距：12vp
- 卡片内边距：16vp
- 元素间距：8vp

---

## 🔧 自定义配置

### 修改默认宿舍

编辑 `ets/utils/DataService.ets`：

```typescript
constructor() {
  this.dormitories.push(new Dormitory(
    '13-513',      // ID
    '13栋513',      // 名称
    '13栋',         // 楼栋
    '513',          // 房号
    '5楼',          // 楼层
    '周逸飞'        // 用户名
  ))
}
```

### 修改API地址

编辑 `ets/utils/DataService.ets` 中的网络请求方法。

---

## 🐛 调试技巧

### 日志输出

```typescript
import { hilog } from '@kit.PerformanceAnalysisKit'

hilog.info(0x0000, 'TAG', 'message: %{public}s', 'hello')
```

### 预览器调试

```
View > Tool Windows > Previewer
```

### 真机调试

1. 连接手机
2. 开启USB调试
3. 选择设备运行
4. 使用 hdc 命令查看日志

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- 南宁师范大学电费充值平台提供数据支持
- 鸿蒙开发者社区提供技术支持

---

## 📞 联系方式

如有问题或建议，欢迎提交 Issue。
