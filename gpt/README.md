# 手绘剪纸开场道具：GPT 重画流程

- `给GPT/`：直接交给 ChatGPT 的东西（两批，每批 9 张图 + 一份提示词），看里面的「使用说明.txt」。
- `out/`：把 ChatGPT 画好的图下载到这里（文件名随意），然后在 website/ 下运行
  `python3 tools/scene-art/gpt_ingest.py`。
- `manifest.json`、`ref/`：导入工具用来认图和定位的数据，跟底图一一对应，不要改也不要删。

相关工具（tools/scene-art/）：
gpt_pack.py 生成本目录（底图已冻结，重新生成前要确认没有正在画的图）；
gpt_ingest.py 导入；gpt_selftest.py 不用 GPT 的自检；gpt_api.py 用 OpenAI API 全自动；
handcut.py 程序生成的手剪风格版本（GPT 没画的道具用它）；compose_atlas.py 写回图集。
