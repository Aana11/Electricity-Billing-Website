// 余额卡片组件
@Component
export struct BalanceCard {
  @Prop balance: number
  @Prop updateTime: string
  @Prop isOnline: boolean
  @State displayBalance: number = 0

  aboutToAppear() {
    // 数字动画
    this.animateNumber()
  }

  // 数字动画
  animateNumber() {
    const target = this.balance
    const duration = 800
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // easeOutBack 缓动函数
      const c1 = 1.70158
      const c3 = c1 + 1
      const easeOutBack = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2)
      
      this.displayBalance = target * easeOutBack
      
      if (progress < 1) {
        setTimeout(animate, 16)
      } else {
        this.displayBalance = target
      }
    }
    
    animate()
  }

  // 获取余额状态提示
  getBalanceStatus(): { text: string, color: string } {
    if (this.balance < 20) {
      return { text: '⚠️ 余额不足，请及时充值', color: '#FA5151' }
    } else if (this.balance < 50) {
      return { text: '💡 余额适中，建议关注用电情况', color: '#FFC300' }
    }
    return { text: '✓ 余额充足，用电无忧', color: '#07C160' }
  }

  build() {
    Column({ space: 16 }) {
      // 顶部：标题和状态
      Row() {
        Row({ space: 8 }) {
          // 图标
          Stack({ alignContent: Alignment.Center }) {
            Circle()
              .width(32)
              .height(32)
              .fill('rgba(255,255,255,0.2)')
          
            Image($r('app.media.ic_zap'))
              .width(18)
              .height(18)
              .fillColor('#FFFFFF')
          }
          
          Text('当前余额')
            .fontSize(14)
            .fontColor('rgba(255,255,255,0.9)')
        }

        Blank()

        // 在线状态
        Row({ space: 6 }) {
          Circle()
            .width(8)
            .height(8)
            .fill(this.isOnline ? '#4ADE80' : '#FA5151')
            .shadow({ radius: 4, color: this.isOnline ? '#4ADE80' : '#FA5151' })
          
          Text(this.isOnline ? '正常' : '离线')
            .fontSize(12)
            .fontColor('rgba(255,255,255,0.9)')
        }
        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
        .backgroundColor('rgba(255,255,255,0.2)')
        .borderRadius(12)
      }
      .width('100%')

      // 余额金额
      Row({ space: 4 }) {
        Text('¥')
          .fontSize(24)
          .fontWeight(FontWeight.Medium)
          .fontColor('rgba(255,255,255,0.8)')
          .margin({ top: 8 })
        
        Text(this.displayBalance.toFixed(2))
          .fontSize(48)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FFFFFF')
          .fontFamily('HarmonyOS Sans')
      }
      .width('100%')

      // 底部信息
      Row() {
        Row({ space: 6 }) {
          Image($r('app.media.ic_battery'))
            .width(16)
            .height(16)
            .fillColor('rgba(255,255,255,0.7)')
          
          Text('电表在线运行中')
            .fontSize(12)
            .fontColor('rgba(255,255,255,0.7)')
        }

        Blank()

        Text(`更新于 ${this.updateTime}`)
          .fontSize(11)
          .fontColor('rgba(255,255,255,0.6)')
      }
      .width('100%')

      // 状态提示
      const status = this.getBalanceStatus()
      Text(status.text)
        .fontSize(13)
        .fontColor(status.color)
        .padding(12)
        .backgroundColor('rgba(255,255,255,0.15)')
        .borderRadius(8)
        .width('100%')
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .padding(20)
    .backgroundColor('#07C160')
    .borderRadius(16)
    .linearGradient({
      direction: GradientDirection.BottomRight,
      colors: [['#07C160', 0], ['#06AD56', 0.5], ['#05A04D', 1]]
    })
    .shadow({ radius: 16, color: 'rgba(7,193,96,0.3)', offsetY: 8 })
  }
}
