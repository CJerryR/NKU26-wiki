# NemaKlear · Wiki 组件交付

交付日期：2026-10-17。内容为当前本地网页的快照，附带嵌入适配。

## 包里有什么

- `app/`：完整网页、Python 计算服务、冻结模型和数据、图件及测试。
- `wiki/embed.html`：可复制的 iframe 嵌入示例，自动调整高度。
- `MANIFEST-SHA256.json`：本包文件校验值。

默认样本为 **Mi 120＋Ce 80**，自动计算；首次显示英文，页头可切换中文并记住选择。两路显色、预测密度、风险分级与 Eco 报告保持联动。

## 1. 在同学电脑上运行

使用 Python 3.14（当前验证环境），进入 app 目录：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -B server.py --port 8765
```

浏览器打开 http://127.0.0.1:8765/ 。Windows 使用 `.venv\Scripts\python` 替换 `.venv/bin/python`。
Mac 依赖安装后也可以双击 `app/start.command`。在终端按 Control+C 停止。

## 2. 查看组件形式

保持计算服务运行，在本包根目录另开终端：

```sh
python3 -m http.server 8767 --bind 127.0.0.1 --directory wiki
```

打开 http://127.0.0.1:8767/embed.html 。用 HTTP 打开示例，自动高度通信需要明确的页面来源。

## 3. 接到公开 Wiki

这是 **网页＋Python 计算服务**，公开 Wiki 需要一个持续在线的 HTTPS 模型服务。静态 Wiki 文件托管不能执行 Python。

1. 把 `app/` 部署到支持 Python 的服务器。在该机建立虚拟环境并安装 requirements；保持 `server.py` 监听本机 127.0.0.1:8765，由 HTTPS 反向代理转发。当前是演示服务，可先单进程运行；报告暂存在进程内，重启后重新计算。
2. 采用独立域名的根路径，例如 `https://YOUR-MODEL-HOST/`。前端资源和 API 使用 `/api/…`、`/style.css` 等绝对路径，直接挂到子路径需要额外适配。
3. 将 `wiki/embed.html` 中的 iframe 地址改成 `https://YOUR-MODEL-HOST/?embed=1`，把 iframe、样式和脚本放进 Wiki 组件。React/Vue 中把事件监听放进挂载生命周期，卸载时移除监听即可。
4. 确认 Wiki 的内容安全策略允许这个 iframe 来源，模型服务允许 Wiki 域名嵌入；HTTPS Wiki 使用 HTTPS 模型地址。浏览器中验证计算、语言切换、下载和高度更新。

`?embed=1` 简化外层页头，保留语言选择，隐藏重复横幅和页脚。iframe 内前端和 API 同源，无需为 Wiki 开放跨域 API。高度消息校验发送窗口和来源，不读取 Wiki 页面数据。缺少自动高度脚本时仍可用固定高度 iframe 滚动查看。

## 模型与图件版本

当前交互计算：ODE r04 / 双通道 r01。底部展示的是用户指定的 **v7（ODE r07 / 双通道 r04）静态研究图**，页面已标版本；它们独立于当前交互计算。本次交付保留这一现状。

校准数据为模拟数据，风险等级采用西班牙设施番茄示例。默认样本的预测可超出 0–120 校准密度范围，页面保留条件模拟说明。手动读数直接进入双通道回归，ODE 图不会伪装成由读数反推的轨迹。

部署状态：本包供本地运行与接入，尚未部署公网服务。
