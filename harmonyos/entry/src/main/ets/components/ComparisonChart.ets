import { ComparisonData } from '../model/DormitoryModel'

// 宿舍对比图表组件
@Component
export struct ComparisonChart {
  @Prop data: ComparisonData[]
  @Prop currentDormitoryId: string
  @State sortBy: number = 0 // 0: 余额, 1: 用电量
  @State animationProgress: number = 0

  aboutToAppear() {
    this.startAnimation()
  }

  startAnimation() {
    const animate = () => {
      if (this.animationProgress < 1) {
        this.animationProgress += 0.04
        setTimeout(animate, 16)
      } else {
        this.animationProgress = 1
      }
    }
    animate()
  }

  // 获取排序后的数据
  getSortedData(): ComparisonData[] {
    const sorted = [...this.data]
    if (this.sortBy === 0) {
      sorted.sort((a, b) => b.currentBalance - a.currentBalance)
    } else {
      sorted.sort((a, b) => b.consumption7d - a.consumption7d)
    }
    return sorted
  }

  // 获取当前排名
  getCurrentRank(): number {
    const sorted = this.getSortedData()
    const index = sorted.findIndex(d => d.dormitoryId === this.currentDormitoryId)
    return index >= 0 ? index + 1 : 1
  }

  // 计算平均值
  getAverages(): { balance: number, consumption: number } {
    if (this.data.length === 0) return { balance: 0, consumption: 0 }
    
    const totalBalance = this.data.reduce((sum, d) => sum + d.currentBalance, 0)
    const totalConsumption = this.data.reduce((sum, d) => sum + d.consumption7d, 0)
    
    return {
      balance: Math.round((totalBalance / this.data.length) * 100) / 100,
      consumption: Math.round((totalConsumption / this.data.length) * 10) / 10
    }
  }

  build() {
    Column({ space: 16 }) {
      // 头部
      Row({ space: 12 }) {
        Stack({ alignContent: Alignment.Center }) {
          Circle()
            .width(36)
            .height(36)
            .fill('#FCE7F3')
        
          Image($r('app.media.ic_users'))
            .width(20)
            .height(20)
            .fillColor('#EC4899')
        }

        Column({ space: 4 }) {
          Text('宿舍用电对比')
            .fontSize(16)
            .fontWeight(FontWeight.SemiBold)
            .fontColor('#333333')
          
          Text(`共 ${this.data.length} 个宿舍 · 你的排名: 第${this.getCurrentRank()}名`)
            .fontSize(12)
            .fontColor('#999999')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        // 排序选项
        Row({ space: 4 }) {
          Button('按余额')
            .type(ButtonType.Capsule)
            .fontSize(12)
            .fontWeight(this.sortBy === 0 ? FontWeight.Medium : FontWeight.Normal)
            .fontColor(this.sortBy === 0 ? '#07C160' : '#666666')
            .backgroundColor(this.sortBy === 0 ? '#E6F7ED' : '#F5F5F5')
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .onClick(() => {
              this.sortBy = 0
              this.animationProgress = 0
              this.startAnimation()
            })

          Button('按用电')
            .type(ButtonType.Capsule)
            .fontSize(12)
            .fontWeight(this.sortBy === 1 ? FontWeight.Medium : FontWeight.Normal)
            .fontColor(this.sortBy === 1 ? '#07C160' : '#666666')
            .backgroundColor(this.sortBy === 1 ? '#E6F7ED' : '#F5F5F5')
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .onClick(() => {
              this.sortBy = 1
              this.animationProgress = 0
              this.startAnimation()
            })
        }
      }
      .width('100%')

      // 统计概览
      const avgs = this.getAverages()
      Row({ space: 12 }) {
        Column({ space: 4 }) {
          Row({ space: 4 }) {
            Image($r('app.media.ic_building'))
              .width(14)
              .height(14)
              .fillColor('#999999')
            Text('总宿舍数')
              .fontSize(11)
              .fontColor('#999999')
          }
          
          Text(`${this.data.length}`)
            .fontSize(20)
            .fontWeight(FontWeight.SemiBold)
            .fontColor('#333333')
        }
        .layoutWeight(1)
        .padding(12)
        .backgroundColor('#F8F8F8')
        .borderRadius(8)
        .alignItems(HorizontalAlign.Center)

        Column({ space: 4 }) {
          Row({ space: 4 }) {
            Image($r('app.media.ic_battery'))
              .width(14)
              .height(14)
              .fillColor('#999999')
            Text('平均余额')
              .fontSize(11)
              .fontColor('#999999')
          }
          
          Text(`¥${avgs.balance.toFixed(2)}`)
            .fontSize(18)
            .fontWeight(FontWeight.SemiBold)
            .fontColor('#333333')
        }
        .layoutWeight(1)
        .padding(12)
        .backgroundColor('#F8F8F8')
        .borderRadius(8)
        .alignItems(HorizontalAlign.Center)

        Column({ space: 4 }) {
          Row({ space: 4 }) {
            Image($r('app.media.ic_trending_up'))
              .width(14)
              .height(14)
              .fillColor('#999999')
            Text('平均用电')
              .fontSize(11)
              .fontColor('#999999')
          }
          
          Text(`${avgs.consumption}度`)
            .fontSize(18)
            .fontWeight(FontWeight.SemiBold)
            .fontColor('#333333')
        }
        .layoutWeight(1)
        .padding(12)
        .backgroundColor('#F8F8F8')
        .borderRadius(8)
        .alignItems(HorizontalAlign.Center)
      }
      .width('100%')

      // 图表区域
      Stack({ alignContent: Alignment.BottomStart }) {
        // 背景网格
        Column({ space: 0 }) {
          ForEach([0, 1, 2], (i: number) => {
            Row()
              .width('100%')
              .height(0.5)
              .backgroundColor('#E5E5E5')
            
            if (i < 2) {
              Blank().height(50)
            }
          })
        }
        .width('100%')
        .height(150)

        // 柱状图
        Row({ space: 8 }) {
          ForEach(this.getSortedData().slice(0, 6), (item: ComparisonData, index: number) => {
            if (index < 6 * this.animationProgress) {
              Column({ space: 4 }) {
                // 柱子
                Column()
                  .width(24)
                  .height(
                    this.sortBy === 0 
                      ? (item.currentBalance / 150) * 120 
                      : (item.consumption7d / 30) * 120
                  )
                  .backgroundColor(
                    item.dormitoryId === this.currentDormitoryId ? '#07C160' :
                    index < 3 ? '#3B82F6' : '#E5E5E5'
                  )
                  .borderRadius({ topLeft: 4, topRight: 4 })
                  .shadow(
                    item.dormitoryId === this.currentDormitoryId 
                      ? { radius: 6, color: 'rgba(7,193,96,0.4)', offsetY: 3 }
                      : { radius: 0 }
                  )
                  .animation({ duration: 300, delay: index * 50 })
                
                // 宿舍名称
                Text(item.name)
                  .fontSize(10)
                  .fontColor(item.dormitoryId === this.currentDormitoryId ? '#07C160' : '#666666')
                  .fontWeight(item.dormitoryId === this.currentDormitoryId ? FontWeight.Bold : FontWeight.Normal)
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .width(40)
                  .textAlign(TextAlign.Center)
              }
              .layoutWeight(1)
              .height(150)
              .justifyContent(FlexAlign.End)
            }
          })
        }
        .width('100%')
        .height(170)
        .padding({ bottom: 20 })
      }
      .width('100%')
      .height(170)

      // 图例
      Row({ space: 24 }) {
        Row({ space: 6 }) {
          Row().width(12).height(12).backgroundColor('#07C160').borderRadius(2)
          Text('当前宿舍').fontSize(11).fontColor('#666666')
        }
        
        Row({ space: 6 }) {
          Row().width(12).height(12).backgroundColor('#3B82F6').borderRadius(2)
          Text('前三名').fontSize(11).fontColor('#666666')
        }
        
        Row({ space: 6 }) {
          Row().width(12).height(12).backgroundColor('#E5E5E5').borderRadius(2)
          Text('其他宿舍').fontSize(11).fontColor('#666666')
        }
      }
      .width('100%')

      // 排行榜
      Column({ space: 8 }) {
        Text('用电排行榜')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
          .alignSelf(ItemAlign.Start)
        
        List({ space: 8 }) {
          ForEach(this.getSortedData().slice(0, 5), (item: ComparisonData, index: number) => {
            ListItem() {
              Row({ space: 12 }) {
                // 排名
                Stack({ alignContent: Alignment.Center }) {
                  Circle()
                    .width(28)
                    .height(28)
                    .fill(
                      index === 0 ? '#FEF3C7' :
                      index === 1 ? '#F3F4F6' :
                      index === 2 ? '#FFF7ED' : '#F8F8F8'
                    )
                  
                  Text(`${index + 1}`)
                    .fontSize(12)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(
                      index === 0 ? '#F59E0B' :
                      index === 1 ? '#6B7280' :
                      index === 2 ? '#F97316' : '#999999'
                    )
                }

                // 宿舍名称
                Text(item.name)
                  .fontSize(14)
                  .fontWeight(item.dormitoryId === this.currentDormitoryId ? FontWeight.Bold : FontWeight.Normal)
                  .fontColor(item.dormitoryId === this.currentDormitoryId ? '#07C160' : '#333333')
                  .layoutWeight(1)

                // 当前标记
                if (item.dormitoryId === this.currentDormitoryId) {
                  Text('当前')
                    .fontSize(10)
                    .fontColor('#07C160')
                    .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                    .backgroundColor('#E6F7ED')
                    .borderRadius(4)
                }

                // 数值
                Text(
                  this.sortBy === 0 
                    ? `¥${item.currentBalance.toFixed(2)}`
                    : `${item.consumption7d.toFixed(1)}度`
                )
                  .fontSize(14)
                  .fontWeight(FontWeight.Medium)
                  .fontColor('#333333')
              }
              .width('100%')
              .padding(12)
              .backgroundColor(item.dormitoryId === this.currentDormitoryId ? '#E6F7ED' : '#F8F8F8')
              .borderRadius(10)
            }
          })
        }
        .maxHeight(250)
      }
      .width('100%')
      .padding({ top: 8 })
      .border({ width: { top: 0.5 }, color: '#E5E5E5' })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#FFFFFF')
    .borderRadius(16)
    .shadow({ radius: 12, color: 'rgba(0,0,0,0.04)', offsetY: 4 })
  }
}
