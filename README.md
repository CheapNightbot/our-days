<div>
  <img src="public/wellbeing.svg" alt="wellbeing icon" width="36" height="36" align="left" />
  <h1>&nbsp;Our Days</h1>
</div>

A social mood tracking calendar where users can share their daily emotions with emojis! Built with React, Cloudflare Workers, and D1 database.

<img src="https://github.com/user-attachments/assets/5eac6543-d759-4cb7-8345-d0aa68541bd6" alt="Our Days Demo" width="960" height="540" /> 

## ✨ Features

- 📅 **Full-year calendar view** - See all 12 months at once
- 😊 **6 mood emojis** - Happy, Sad, Angry, Frustrated, Tired, Excited
- 👥 **Social reactions** - See how others felt on each day
- 🔒 **Anonymous** - No signup required! Uses secure token-based auth
- 📱 **Responsive** - Works on desktop and mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + TailwindCSS |
| Backend | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) |
| Deployment | Cloudflare Pages |

## 🚀 Quick Start

### Option 1: Local Development (Recommended for testing)

```bash
# Clone and setup locally
git clone https://github.com/CheapNightbot/our-days.git
cd our-days
npm run setup:local

# Start development server
npm run dev
```

Open [`http://localhost:5173`](http://localhost:5173) in your browser! 🎉

### Option 2: Production Setup (Deploy to Cloudflare)

```bash
# Clone and setup for production
git clone https://github.com/CheapNightbot/our-days.git
cd our-days
npm run setup

# Build & Deploy to Cloudflare
npm run build && npm run deploy
```

## 📚 Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run worker:dev` | Start Wrangler dev server (backend) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Database - Local

| Command | Description |
|---------|-------------|
| `npm run db:init:local` | Initialize local D1 database |
| `npm run db:reset:local` | Reset local database (deletes all local data) |
| `npm run setup:local` | Install deps + init local DB (first-time setup) |

### Database - Production

| Command | Description |
|---------|-------------|
| `npm run db:init` | Initialize production D1 database in Cloudflare |
| `npm run db:reset` | ⚠️ **Reset production database (DELETES ALL DATA!)** |
| `npm run setup` | Install deps + init production DB (first-time setup) |

### Deployment

| Command | Description |
|---------|-------------|
| `npm run deploy` | Deploy to Cloudflare Pages |

## 🔐 Privacy & Security

- **Anonymous authentication** - Uses random UUID tokens stored in browser cookies
- **Token hashing** - Tokens are SHA-256 hashed before storing in database
- **One reaction per user per day** - Prevents spam while allowing mood changes
- **No personal data collected** - Only emoji reactions and anonymous tokens

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (e.g. `git checkout -b feature/AmazingFeature`)
3. Commit your changes (e.g. `git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (e.g. `git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
