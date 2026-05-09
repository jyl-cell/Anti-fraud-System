# 🛡️ 智慧常青 (Evergreen Guardian)
### —— 老年人防诈骗全栈守护系统 | Senior Anti-Fraud Full-Stack System

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **“让技术有温度，为长辈筑盾牌。”**
> 
> 智慧常青是一款基于 **Next.js + Node.js** 开发的适老化防诈骗综合守护平台。项目通过前后端分离的架构，实现了高性能的交互响应与模块化的反诈业务逻辑，旨在为老年人提供一个安全、易用、具有情感连接的数字避风港。

---

## 🌟 核心功能 (Core Features)

* **👵 极致适老化体验**：基于 Next.js 构建响应式前端，全局超大字号、高对比度设计，支持全流程语音合成辅助（TTS）。
* **🛡️ 模块化反诈矩阵**：
  * **智慧首页**：一键拍照求助、风险快速核查。
  * **反诈剧场**：流媒体视频学习，答题互动获取积分。
  * **情景闯关**：沉浸式模拟真实诈骗交互逻辑。
  * **守护圈子**：基于邻里互助的社区动态系统。
* **🛠️ 后端逻辑支撑**：独立的 `anti-fraud` 路由模块，涵盖鉴权、商城、游戏、视频等核心业务逻辑。
* **🎁 积分激励闭环**：通过前端交互触发后端积分存缴，支持实物兑换与子女端确认。

---

## 🏗️ 系统架构 (System Architecture)

项目采用 **Modern Web Full-Stack** 架构，前端负责交互反馈，后端处理业务模型。

### 目录结构 (Project Structure)
```text
my-website/
├── 📁 app/                # Next.js App Router (前端表现层)
│   ├── 📄 page.tsx        # 核心交互逻辑与多状态页面渲染
│   ├── 📄 layout.tsx      # 全局布局与样式配置
│   ├── 📄 voice.ts        # 语音交互工具类 (封装 Web Speech API)
│   ├── 📄 api.ts          # 前端接口请求统一封装
│   └── 📄 globals.css     # 适老化全局样式 (24px+ 字体规范)
├── 📁 anti-fraud/         # 后端业务逻辑层 (Node.js)
│   ├── 📁 routes/         # 模块化路由模块
│   │   ├── 📄 home.js     # 首页业务：相机调用逻辑、数据下发
│   │   ├── 📄 game.js     # 闯关游戏：逻辑校验与关卡控制
│   │   ├── 📄 mall.js     # 商城系统：积分核销、商品管理
│   │   └── 📄 video.js    # 视频资源与观看逻辑处理
│   └── 📄 app.js          # 后端服务入口与中间件配置
├── 📁 public/             # 静态资源（图标、反诈示例图片/视频）
└── 📄 config.js           # 全局环境配置
```
## 🚀 快速开始 (Quick Start)

### 环境要求
* **Node.js**: 18.x 或更高版本
* **浏览器**: 建议使用最新版 **Chrome** 或 **Edge** (需开启摄像头访问权限以支持求助功能)

### 本地部署

1.  **克隆仓库**
    ```bash
    git clone [https://github.com/your-username/evergreen-guardian.git](https://github.com/your-username/evergreen-guardian.git)
    cd evergreen-guardian
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```

4.  **访问应用**
    在浏览器地址栏输入：`http://localhost:3000`

---

## 📄 开源协议 (License)

本项目采用 [MIT License](https://opensource.org/licenses/MIT) 开源。
