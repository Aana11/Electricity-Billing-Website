import { BalanceRecord } from '../model/DormitoryModel'

// 余额变化趋势图表组件
@Component
export struct BalanceChart {
  @Prop data: BalanceRecord[]
  @State animationProgress: number = 0

  aboutToAppear() {
    this.startAnimation()
  }

  startAnimation() {
    const animate = () => {
      if (this.animationProgress < 1) {
        this.animationProgress += 0.03
        setTimeout(animate, 16)
      } else {
        this.animationProgress = 1
      }
    }
    animate()
  }

  // 计算余额变化
  getBalanceChange(): number {
    if (this.data.length < 2) return 0
    const first = this.data[0].balance
    const last = this.data[this.data.length - 1].balance
    return Math.round((last - first) * 100) / 100
  }

  // 格式化日期
  formatDate(dateStr: string): string {
    const parts = dateStr.split('-')
    return `${parts[1]}/${parts[2]}`
  }

  build() {
    Column({ space: 16 }) {
      // 头部
      Row({ space: 12 }) {
        Stack({ alignContent: Alignment.Center }) {
          Circle()
            .width(36)
            .height(36)
            .fill('#DBEAFE')
        
          Image($r('app.media.ic_wallet'))
            .width(20)
            .height(20)
            .fillColor('#3B82F6')
        }

        Column({ space: 4 }) {
          Text('余额变化趋势')
            .fontSize(16)
            .fontWeight(FontWeight.SemiBold)
            .fontColor('#333333')
          
          Text('近30天余额变化')
            .fontSize(12)
            .fontColor('#999999')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        // 变化指示
        const change = this.getBalanceChange()
        Row({ space: 4 }) {
          Image(change >= 0 ? $r('app.media.ic_trending_up') : $r('app.media.ic_trending_down'))
            .width(16)
            .height(16)
            .fillColor(change >= 0 ? '#07C160' : '#FA5151')
          
          Text(`${change >= 0 ? '+' : ''}¥${Math.abs(change).toFixed(2)}`)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(change >= 0 ? '#07C160' : '#FA5151')
        }
        .padding({ left: 10, right: 10, top: 6, bottom: 6 })
        .backgroundColor(change >= 0 ? '#E6F7ED' : '#FEE2E2')
        .borderRadius(8)
      }
      .width('100%')

      // 图表区域
      Stack({ alignContent: Alignment.Center }) {
        // 背景网格
        Column({ space: 0 }) {
          ForEach([0, 1, 2, 3], (i: number) => {
            Row()
              .width('100%')
              .height(0.5)
              .backgroundColor('#E5E5E5')
            
            if (i < 3) {
              Blank().height(40)
            }
          })
        }
        .width('100%')
        .height(160)

        // 折线图（使用点模拟）
        Row({ space: 0 }) {
          ForEach(this.data, (item: BalanceRecord, index: number) => {
            if (index < this.data.length * this.animationProgress) {
              Column() {
                // 数据点
                Circle()
                  .width(8)
                  .height(8)
                  .fill('#3B82F6')
                  .shadow({ radius: 4, color: 'rgba(59,130,246,0.4)' })
                
                // 日期标签（间隔显示）
                if (index % Math.ceil(this.data.length / 6) === 0) {
                  Text(this.formatDate(item.date))
                    .fontSize(9)
                    .fontColor('#999999')
                    .margin({ top: 8 })
                    .maxLines(1)
                }
              }
              .layoutWeight(1)
              .height(160)
              .justifyContent(FlexAlign.End)
              .padding({ bottom: 20 })
              // 根据余额值定位高度
              .position({
                y: 160 - (item.balance / 150) * 140
              })
            }
          })
        }
        .width('100%')
        .height(160)
      }
      .width('100%')
      .height(180)

      // 图例
      Row({ space: 24 }) {
        Row({ space: 6 }) {
          Circle().width(10).height(10).fill('#3B82F6')
          Text('余额变化').fontSize(11).fontColor('#666666')
        }
        
        Row({ space: 6 }) {
          Circle().width(10).height(10).fill('#07C160')
          Text('充值记录').fontSize(11).fontColor('#666666')
        }
        
        Row({ space: 6 }) {
          Circle().width(10).height(10).fill('#FA5151')
          Text('日常消费').fontSize(11).fontColor('#666666')
        }
      }
      .width('100%')
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .borderRadius(16)
    .shadow({ radius: 12, color: 'rgba(0,0,0,0.04)', offsetY: 4 })
  }
}
