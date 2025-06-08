# Pocket Curator

Pocket Curator is a web application designed for art lovers and creators to quickly curate, display, and share their artwork. It leverages AI to analyze artworks, helping users deepen their understanding and connection to art. Additionally, it provides a feature to instantly visualize artwork on merchandise, offering a potential path to monetization.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fppz-pro%2Fpocket-curator)

## ✨ Key Features

- **AI-Powered Artwork Analysis**: Get deeper insights into your art with AI-driven analysis.
- **Instant Curation**: Quickly create and organize your personal art collections.
- **Easy Sharing**: Share your artworks and collections with a simple link.
- **Merchandise Mockups**: Instantly see your art on t-shirts, mugs, and more.
- **Open Source**: The project is open-source, allowing you to build and customize your own version.

## 🚀 Live Demo

You can try a live version of the app at [pocketcurator.art](https://www.pocketcurator.art/).

Please note that there are limitations on the number of exhibits you can create and artworks you can upload in the demo version to manage costs.

## 📂 Project Structure

The project is a Next.js application built with TypeScript, structured to be modular and scalable.

```
/
├── app/                  # Next.js App Router: contains all routes and pages
│   ├── (main)/           # Main app routes (e.g., collections, artwork)
│   ├── auth/             # Authentication pages (login, register)
│   └── api/              # API routes
├── components/           # Shared React components (UI, layout, etc.)
│   ├── ui/               # Shadcn UI components
│   └── ...
├── lib/                  # Helper functions, utilities, and core logic
│   ├── supabase-data.ts  # Supabase client and data fetching functions
│   ├── i18n.ts           # i18next configuration
│   └── ...
├── public/               # Static assets (images, fonts, locales)
├── sql_scripts/          # SQL schemas for database setup
├── styles/               # Global CSS styles
├── next.config.mjs       # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛠️ Getting Started: Build Your Own App

You can easily clone and deploy your own version of Pocket Curator.

### 1. Set up Supabase

- Create a new project on [Supabase](https://supabase.com/).
- In the SQL Editor, run the script from `sql_scripts/supabase_pocket_curator_schema.sql` to create the necessary tables.
- Go to the Storage section and create a new public bucket named `artwork`.

### 2. Configure Environment Variables

- Create a `.env.local` file in the root of your project by copying the `.env.example` file.
- Fill in the following Supabase variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
  ```
- You can find these keys in your Supabase project's API settings.

### 3. Run Locally

- Install dependencies:
  ```bash
  pnpm install
  ```
- Start the development server:
  ```bash
  pnpm dev
  ```

## 💡 My Thoughts on "Vibe Coding"

This app might not be a great "product," but it is definitely a good outcome of vibe coding.

The idea for this app sparked one weekend during a visit to an art gallery. I didn't deeply consider whether it could solve real user pain points or be monetized. It was purely out of curiosity and interest—I wanted to "build for fun" and immerse myself in the magic of vibe coding.

Over the next four weekends and some weekday evenings, I built it step by step. My background is in Data Science / Machine Learning and some backend development, primarily using Python. Before starting this project, I had never written a single line of TypeScript and knew almost nothing about how to build a web app from scratch.

Of course, I didn't write much actual TypeScript during development either—because most of the code was written for me by AI.

Throughout the entire building process, I used AI extensively, not just for code generation, but also for feature design, UI design, architecture, and even deployment (like configuring Supabase, Vercel, and Cloudflare). AI dramatically boosted my learning speed and execution efficiency.

It made me realize deeply: programmers may not be replaced by AI, but programmers who don't use AI will definitely be left behind.

During my vibe coding journey, I also gained a lot of valuable experience:

- A clear requirements document is extremely important. Unclear requests will only lead the AI to generate completely off-target code.
- Control the length of the conversation and the complexity of the task. Don't expect AI to build multiple different features with a single prompt. Focus on implementing one feature per conversation, then start a new chat to build the next one.
- AI makes mistakes, just like human programmers. You can modify the prompt to have the AI regenerate the code. You have to be patient with AI.
- Be adept at switching models in Cursor: use 'auto' for simple tasks, but a powerful model like Claude 4 is superior for complex requirements.
- Tools like V0 and Lovable are great for quickly building a POC, but you must return to Cursor for the fine-tuning stage.
- For UI design, you can directly have GPT-4o generate visual mockups, which is highly efficient.
- Most importantly: vibe coding has its limitations. Don't let it become so fun and addictive that you give up on learning the fundamentals of programming.

For me, vibe coding is the most addictive "computer game" I've ever played. I will continue to build more products. If you have any ideas or want to chat, feel free to contact me.
