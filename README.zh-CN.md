# 袖珍策展人 (Pocket Curator)

“袖珍策展人” (Pocket Curator) 是一个为艺术爱好者和创作者打造的Web应用，旨在帮助他们快速策划、展示和分享自己的作品。它利用AI来分析作品，帮助用户加深对艺术的理解，拉近与艺术的距离。此外，它还提供了一个功能，可以即时将艺术作品呈现在商品上，生成效果图，为实现商业变现提供了可能。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fppz-pro%2Fpocket-curator)

## ✨ 主要功能

- **AI艺术品分析**：通过AI驱动的分析，深入了解您的艺术作品。
- **即时策展**：快速创建和整理您的个人艺术收藏。
- **轻松分享**：通过简单的链接分享您的作品和收藏。
- **商品效果图**：即时在T恤、马克杯等商品上预览您的艺术作品。
- **开源模板**：项目完全开源，您可以基于此构建和定制您自己的版本。

## 🚀线上体验

您可以在这里体验线上版本：[pocketcurator.art](https://www.pocketcurator.art/)

请注意，为了控制成本，线上版本对您能够创建的展览和上传的艺术品数量进行了一定的限制。

## 📂 项目结构

本项目是一个基于 Next.js 和 TypeScript 构建的应用，其结构设计旨在实现模块化和可扩展性。

```
/
├── app/                  # Next.js App Router: 包含所有路由和页面
│   ├── (main)/           # 主要应用路由 (例如 collections, artwork)
│   ├── auth/             # 认证页面 (登录, 注册)
│   └── api/              # API 路由
├── components/           #共享的 React 组件 (UI, 布局等)
│   ├── ui/               # Shadcn UI 组件
│   └── ...
├── lib/                  # 辅助函数、工具和核心逻辑
│   ├── supabase-data.ts  # Supabase 客户端和数据获取函数
│   ├── i18n.ts           # i18next 国际化配置
│   └── ...
├── public/               # 静态资源 (图片, 字体, 语言包)
├── sql_scripts/          # 用于数据库设置的 SQL 脚本
├── styles/               # 全局 CSS 样式
├── next.config.mjs       # Next.js 配置文件
└── tsconfig.json         # TypeScript 配置文件
```

## 🛠️ 如何使用：构建你自己的 APP

你可以轻松克隆并部署你自己的“袖珍策展人”。

### 1. 设置 Supabase

- 在 [Supabase](https://supabase.com/) 上创建一个新项目。
- 在 SQL 编辑器中，运行 `sql_scripts/supabase_pocket_curator_schema.sql` 脚本以创建所需的数据库表。
- 前往 Storage（存储）部分，创建一个名为 `artwork` 的公共存储桶 (bucket)。

### 2. 配置环境变量

- 复制 `.env.example` 文件，并在项目根目录创建一个 `.env.local` 文件。
- 填入以下 Supabase 变量：
  ```
  NEXT_PUBLIC_SUPABASE_URL=<你的SUPABASE_URL>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的SUPABASE_ANON_KEY>
  ```
- 您可以在 Supabase 项目的 API 设置中找到这些密钥。

### 3. 本地运行

- 安装依赖：
  ```bash
  pnpm install
  ```
- 启动开发服务器：
  ```bash
  pnpm dev
  ```

## 💡 关于 "Vibe Coding" 的感想

这个 App 或许不是一个好的“产品”，但它绝对是一个不错的 vibe coding 产物。

这个 App 的想法诞生于某个周末我在逛艺术馆时的一次灵感闪现。当时我并没有深入思考它是否能解决实际的用户痛点，是否能变现，仅仅是出于好奇和兴趣，想“build for fun”，也想沉浸式地体验一次 vibe coding 的魔力。

接下来的四个周末和一些工作日的晚上，我一步步将它构建出来。我本人的背景是 Data Science / Machine Learning，以及部分后端开发，主要使用 Python。在开始这个项目之前，我从未写过一行 TypeScript，也几乎不了解一个 Web App 应该如何从零构建。

当然，在开发过程中我也没有写太多真正的 TypeScript —— 因为大多数代码，都是 AI 帮我写的。

在整个打造过程中，我大量使用 AI，不仅用于代码生成，还用于功能设计、UI 设计、架构搭建，乃至上线部署（如 Supabase、Vercel、Cloudflare 等配置）。AI 极大地提升了我的学习速度和执行效率。

我深刻地感受到：程序员不一定会被 AI 取代，但不会使用 AI 的程序员，注定会被淘汰。

在 vibe coding 的过程中，我也积累了很多宝贵的经验：

- 一份清晰的需求文档极其重要，不清晰的要求只会让 AI 给出南辕北辙的代码；

- 控制聊天的长度和任务的复杂度，不要期望用一个 prompt 就让 AI 完成多个不同功能的构建，一次对话关注一个功能的实现，完成后创建新的对话窗口来实现下一个功能；

- AI 就像人类程序员一样会犯错，你可以修改 prompt 来让 AI 重新生成代码，一定要对 AI 有耐心；

- 要善于切换 Cursor 的模型：简单任务用 auto，复杂需求 Claude 4 更胜一筹；

- V0、Lovable 等工具适合快速搭建 POC，但微调阶段必须回到 Cursor；

- UI 设计可以直接让 GPT-4o 生成视觉图，效率非常高；

- 最重要的一点：vibe coding 有局限性。不要因为它好玩、上头，就放弃真正的编程学习。

对我而言，vibe coding 是我玩过最上头的“电脑游戏”。我会继续做更多产品。如果你也有想法，或者想交流什么，欢迎联系我。