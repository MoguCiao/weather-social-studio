# Atmos 图文使用 Demo

[← 返回项目首页](../README.md) · [在线预览（需访问权限）](https://weather-social-studio-flow.soundsnail12.chatgpt.site/)

这份演示带你走完「发现话题 → 创作内容 → 保存排期 → 总览与改期」的流程。界面文字为英文，下面使用实际按钮名称，便于对照操作。

截图记录于 **2026-10-16**，来自本地运行的同一版本。热点、指标和日历任务均为演示数据，示例任务不会自动写入其他浏览器或线上工作区。

## 1. 找到一个话题

进入 **Topics**，使用 **Region / Country**、**Time Range**、**Weather Type** 和 **Content Type** 缩小范围，也可以输入关键词。点击话题卡片查看详情，再点击 **Create from this topic**。

![选择地区并浏览天气话题](media/topics.jpg)

## 2. 准备简报与脚本

在 **Content Brief** 中填写主题、受众和地区，选择内容角度与格式后点击 **Generate Scripts**。选择一个候选脚本，通过 **Edit Script** 修改分镜，再点击 **Generate Assets**。

当前脚本来自本地模板。这里演示的是内容编辑与流转方式，尚未连接真实 AI 生成服务。

## 3. 选择素材并保存到日历

在素材页选择画面和比例。通过 **Edit** 修改标题、文案，确认后点击 **Save to Calendar**；脚本页也有相同的保存入口。

![素材选择、比例设置与保存到日历的入口](media/asset-studio.jpg)

保存弹窗中可以设置：

| 字段 | 操作 |
| --- | --- |
| **Post Title** | 给任务起一个容易识别的名称 |
| **Date / Time** | 选择计划日期和时间；时区为 Asia / Shanghai |
| **Draft** | 保存还在准备中的内容 |
| **Scheduled** | 标记为已排期；需要未来时间、至少一个平台和文案 |
| **Platforms** | 选择一个或多个社媒平台 |
| **Caption** | 保存这条任务自己的文案 |

点击弹窗中的 **Save to Calendar**，再点击 **View Calendar**，即可查看任务所在的一周。保存仅创建演示排期，不会发出真实社媒帖子。

![选择日期、时间、Scheduled 状态、平台和文案](media/calendar-save.jpg)

## 4. 总览本周发布任务

左侧 **Calendar** 集中展示排期：

- 使用前后箭头切换周，**Today** 返回当前周。
- **Week / List** 在周日历与按日列表之间切换。
- 按平台、**Drafts** 或 **Scheduled** 筛选。
- **New Post** 或日期格内的 **Add post** 可以直接创建任务。

示例工作区包含三条已排期任务和一条草稿，分布在四个日期。

![每周排期总览与筛选](media/calendar-week.jpg)

## 5. 查看保存内容与修改排期

点击任务卡片，查看该任务保存时的文案、素材和脚本。之后继续编辑创作工作区，不会覆盖这份内容快照。

使用 **Edit Schedule** 修改任务信息、平台或时间；跨周改期会自动显示目标周，并更新原任务。**Export** 导出这条已保存任务的 TXT 内容；**Remove from Calendar** 移除后，可立即点击提示中的 **Undo** 撤销。

![查看已保存的素材、文案和脚本，并编辑排期或导出](media/calendar-post.jpg)

## 6. 在手机上查看

手机端推荐使用 **List** 查看按日期分组的任务；**Week** 也可以横向滑动查看完整七天。

<img src="media/calendar-mobile.jpg" alt="390px 手机端按日期分组的任务列表" width="360">

## 演示前需要知道

- 首次打开时，日历可能为空；先保存一条内容即可开始。
- 截图日期仅用于演示。实际操作请选择自己的日期；过去的内容可以存为草稿。
- 保存后刷新仍可恢复，但浏览器、设备、域名之间不会同步。
- 当前没有实时天气、AI 生成 API 或真实社媒自动发布。
- 如需留存工作区，可在 **Settings** 导出 JSON；建议使用同一个本地地址持续体验。

运行方式和后端规划见 [项目 README](../README.md)。
