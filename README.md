# NKU-iGEM 首页原型

此目录是原 wiki 的源码副本。首页按 2026-09-22 提供的 B17 / A04 视觉方向和 D01 叙事改造；保留原来的 Python 静态构建、31 个页面及真实路由。未引入框架或第三方运行时依赖。

## 本地运行

```sh
python3 build.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

打开 http://127.0.0.1:8765/ 。修改源码后重新执行构建，不要直接编辑 public。

## 首页入口

- `_content/index.html`：区段装配顺序。
- `_partials/home/`：导航、开场、地图、科学叙事、成果、收束和页脚。
- `_data/home.json`：内容状态和详细页链接。链接从原有页面元信息解析。
- `css/home-*.css`、`js/home-*.js`：仅首页加载的样式与交互。
- `docs/home-prototype-contract.md`：共享规范、职责、组件接口和基线。
- `docs/home-validation.md`：实际验证记录和本轮待补项。

## 验证

```sh
python3 tools/audit_wiki_content.py --generated --generated-root public
```

探索支持鼠标、触屏和键盘，也可以直接跳过。普通滚动揭示世界地图。地图当前只显示有来源的真实底图，科学数据尚未接入。ascr#3/#18 组合保持项目假设；成果卡链接既有记录并保留证据边界。

正式地图数据及中国三图含义核定、团队审阅的科学插画、正式成果图和批准的支持机构素材仍待补。本副本仅供本地评审，未推送或发布到云端。
