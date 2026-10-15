# Atmos — Weather Social Studio

根据用户提供的八屏参考图实现的英文交互原型。保留冰蓝渐变、玻璃面板、柔和雪景、左侧导航和四步创作流程，并适配桌面、平板与手机。

## 启动

无需安装依赖或构建。

```bash
cd weather-social-studio
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

访问 `http://127.0.0.1:4173`。必须通过 HTTP 服务打开，图片导出使用同源资源。

## 已实现

- Home：雪山主视觉、功能介绍、热点入口。
- Topic Finder：关键词搜索、地区／时间／天气／内容类型筛选、分类标签、世界地图。
- Topic Details：增长指标、趋势图悬停、受众分布、关键词及参考素材。
- Content Brief：主题、目标地区、受众、时间、内容角度及五种内容格式。
- Script Generation：三种演示脚本、格式切换、分镜编辑与保存。
- Asset Generation：图片／视频分镜演示／模板标签、素材选择、比例切换、标题及文案编辑、动态分镜预览。
- Publish & Schedule：平台开关、文案、北京时间排期、手机预览、演示排期保存及移除。
- Analytics：日期范围、平台／内容／受众切换、趋势图、示例表现明细。
- Asset Library、Brand Kit、Settings、通知、键盘快捷键及弹窗焦点管理。
- 下载带标题的创作图片（1080×1920、1080×1080 或 1920×1080），原始摄影图片、TXT 创作包和 JSON 工作区。

## 数据边界

这是前端交互原型。页面顶栏标记 `Demo workspace`；天气热点、趋势、社交指标均为示例。脚本使用本地模板；照片是精选示例素材；视频为带分镜字幕的浏览器动画预览，没有生成 MP4。

草稿、品牌偏好、已编辑脚本及演示排期保存在当前域名的 `localStorage`，键为 `atmos-studio-v1`。不同域名、浏览器和设备之间不会同步。真实天气服务、AI 生成任务和社交 OAuth 尚未接入；排期不会触发真实发布。可从 Settings 导出工作区 JSON。

## 文件

| 文件 | 内容 |
| --- | --- |
| `dist/index.html` | 页面入口 |
| `dist/styles.css` | 字体、视觉样式与响应式断点 |
| `dist/app.js` | 状态、示例数据、路由和交互 |
| `dist/assets/` | 本地图片、字体及字体许可证 |
| `BACKEND-PROPOSAL.md` | 后端架构与分阶段接入建议 |
| `qa/` | 浏览器验收截图及记录 |
| `.openai/hosting.json` | Sites 私有部署配置 |

仅发布 `dist/`。图片与字体均保存在项目中，运行不依赖第三方 CDN。

## 资源来源

照片来自 Unsplash；用户参考图仅用于视觉与流程参考，没有作为网页内容嵌入。

| 本地文件 | Unsplash 图片 |
| --- | --- |
| `peak.jpg` | https://unsplash.com/photos/yJ7FcTIlmjo — Amit Gupta |
| `winter-cabin.jpg` | https://unsplash.com/photos/_4xlA2a3pK0 — Delfina Iacub |
| `alpine.jpg` | https://unsplash.com/photos/E3pbVPY_0Uw — Harry Dona |
| `village.jpg` | https://unsplash.com/photos/8hCbyovrhKw — The 414 Company |
| `snow.jpg` | https://images.unsplash.com/photo-1418985991508-e47386d96a71 |
| `mountain.jpg` | https://images.unsplash.com/photo-1464822759023-fed622ff2c3b |
| `aurora.jpg` | https://images.unsplash.com/photo-1531366936337-7c912a4589a7 |
| `cabin.jpg` | https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8 |
| `japan.jpg` | https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e |
| `sunset.jpg` | https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05 |

字体为 DM Sans 和 Manrope，通过 Google Fonts 获取，SIL Open Font License 保留在 `dist/assets/` 中。图标是内嵌 SVG。
