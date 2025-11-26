# ⚡ Supa Clicker

**An addictive incremental clicker game built for Supabase's 15th Launch Week Hackathon**

## 🚀 About the Project

**Supa Clicker** is a feature-rich incremental clicker game that showcases the power of Supabase's real-time capabilities. Built during the **15th Launch Week Hackathon**, this game combines addictive gameplay mechanics with modern web technologies to create an engaging **real-time multiplayer** experience.

Click the SUPA, earn power, buy upgrades, and compete with players worldwide in this highly polished clicker game that goes far beyond simple clicking!

### 🏗️ Modern Architecture
This project uses a **monorepo architecture** with:
- **Frontend App** (`apps/www`) - Next.js 15 application with React 19
- **WebSocket Server** (`apps/ws-server`) - Real-time game server handling all game logic
- **Shared Game Package** (`packages/game`) - Shared types and utilities

## ✨ Key Features

### 🎯 **Core Gameplay**
- **Satisfying Click Mechanics** - Every click matters with visual feedback and combo systems
- **Supabase/Retro Theme** - Retro-futuristic design with Supabase colors and elements
- **Real-time Progress** - WebSocket-based instant synchronization across all clients
- **Session Tracking** - Track your play sessions and statistics

### 🏆 **Advanced Systems**
- **Ultra-Rewarding Prestige System** - Exponential growth from 25x to 1.7 billion multiplier at level 50
- **Achievement System** - Unlock achievements for clicks, milestones, and special actions with real-time notifications
- **Live Leaderboard** - Real-time global rankings with multiple categories (total power, prestige level, achievements)
- **Advanced Anti-Cheat** - Server-side validation, rate limiting, and audit logging to ensure fair play

### 🎪 **Special Abilities**
- **Golden Click** - 1% chance for 100x multiplier
- **Lucky Streak** - 2% chance for 50x multiplier  
- **Combo System** - Build up to 10x multiplier with consecutive clicks
- **Time Boost** - Temporary power multipliers with upgradeable duration and strength
- **Auto-clickers** - From basic (1 CPS) to quantum (25 CPS) automation

### 🛍️ **Progression Systems**
- **Upgrades** - Enhance click power and unlock new abilities
- **Special Items** - Unique purchases that provide permanent bonuses
- **Bulk Buy** - Purchase multiple upgrades at once for efficient progression
- **Duck Walker** - Special animated ducks that provide bonus rewards

### 👤 **Social Features**
- **User Authentication** - Secure login via Supabase Auth with email/password
- **Profile System** - Customizable avatars and usernames with profile editing
- **Real-time Leaderboard** - Live updates via WebSocket connections
- **Cross-device Sync** - Your progress follows you everywhere through the cloud

## 🛠️ Tech Stack

### Frontend (`apps/www`)
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4, Radix UI components
- **Animations**: Framer Motion
- **State Management**: React Context + Custom Hooks
- **Real-time**: Socket.IO Client

### Backend (`apps/ws-server`)
- **Runtime**: Node.js with TypeScript
- **WebSocket**: Socket.IO Server
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + JWT validation
- **Validation**: Zod schemas

### Infrastructure
- **Database & Auth**: Supabase (PostgreSQL, Auth, Storage)
- **Frontend Hosting**: Vercel
- **WebSocket Server**: Custom deployment
- **Monorepo**: pnpm workspaces
- **Security**: Server-side validation, rate limiting, audit logging

## 🏗️ Architecture Highlights

### 🔌 **Real-time WebSocket Architecture**
- **Centralized Game Logic** - All game logic runs on the WebSocket server
- **Event-based System** - Clean event handlers for clicks, purchases, prestige
- **Instant Synchronization** - Zero-delay updates across all connected clients
- **Session Management** - Track active play sessions with automatic cleanup

### 🔒 **Security First**
- **Server-side Validation** - All actions validated on the WebSocket server
- **JWT Authentication** - Secure user authentication with token validation
- **Rate Limiting** - Prevent abuse with configurable rate limits per action
- **Audit Logging** - Track all game actions for anti-cheat analysis
- **Tolerance-based Anti-cheat** - Detect impossible actions while allowing normal gameplay

### ⚡ **Performance Optimized**
- **60fps Animations** - Smooth animations with Framer Motion
- **Efficient State Management** - React Context with optimized re-renders
- **WebSocket Connection Pooling** - Efficient real-time communication
- **Monorepo Structure** - Shared types between frontend and backend

### 🎨 **User Experience**
- **Responsive Design** - Optimized for mobile and desktop
- **Theme Support** - Dark/light theme with next-themes
- **Real-time Notifications** - Achievement unlocks and game events
- **Progress Indicators** - Clear visual feedback for all actions

## 🎯 Game Mechanics Deep Dive

### Prestige System
The crown jewel of progression - completely rebalanced for maximum satisfaction:
- **Level 1-4**: 25x → 100x multiplier
- **Level 5-10**: 230x → 14.8k multiplier  
- **Level 20**: 45,978x multiplier
- **Level 50**: 1,705,980,608x multiplier (1.7 billion!)

### Achievement Categories
- **Click Milestones**: 1 to 1,000,000 clicks
- **Power Thresholds**: 1K to 1T power
- **PPS Achievements**: 10 to 100K power per second
- **Special Actions**: Golden clicks, combo streaks, prestige milestones

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+** (required)
- **pnpm 9+** (required for workspaces)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Steellgold/supa-clicker.git
   cd supa-clicker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file at the root:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # WebSocket Server
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   WS_PORT=3001

   # JWT Secret (for WebSocket authentication)
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the development servers**

   The monorepo script will start both the frontend and WebSocket server:
   ```bash
   pnpm dev
   ```

   This runs:
   - Frontend (Next.js) on [http://localhost:3000](http://localhost:3000)
   - WebSocket server on `http://localhost:3001`

### Individual Commands

If you need to run services separately:

```bash
# Build all apps
pnpm build:all

# Build individually
pnpm build:www      # Build frontend
pnpm build:socket   # Build WebSocket server

# Start production servers
pnpm start:www      # Start frontend
pnpm start:socket   # Start WebSocket server
```

## 🏆 Hackathon Submission

This project was created for **Supabase's 15th Launch Week Hackathon**, showcasing:

- ✅ **Real-time multiplayer** with WebSocket-powered instant synchronization
- ✅ **Advanced authentication** with Supabase Auth and JWT validation
- ✅ **Complex database schema** with users, game saves, achievements, and sessions
- ✅ **Live leaderboard** with real-time rankings across multiple categories
- ✅ **Server-side game logic** for secure, cheat-resistant gameplay
- ✅ **Storage integration** for user avatar uploads
- ✅ **Session tracking** to monitor active players and gameplay statistics
- ✅ **Achievement system** with unlock notifications and progress tracking

## 📁 Project Structure

```
supa-clicker/
├── apps/
│   ├── www/                    # Next.js frontend application
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities, hooks, and contexts
│   │   └── public/            # Static assets
│   │
│   └── ws-server/             # WebSocket game server
│       ├── events/            # WebSocket event handlers
│       ├── lib/               # Server utilities
│       ├── middleware/        # Authentication middleware
│       ├── schemas/           # Zod validation schemas
│       ├── services/          # Game logic services
│       └── utils/             # Helper utilities
│
└── packages/
    └── game/                  # Shared game types and utilities
        └── src/
            ├── types/         # TypeScript types
            └── utils/         # Shared utilities
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase Team** for the amazing 15th Launch Week and incredible platform
- [@BourezBastien](https://github.com/BourezBastien), [@SLcode777](https://github.com/SLcode777), Clemsouille for the valuable feedback during development
- The open-source community for the amazing tools and libraries

---

**[🎮 Start Clicking Now!](https://supaclicker.vercel.app)** | **[📊 View Leaderboard](https://supaclicker.vercel.app)** | **[🏆 Unlock Achievements](https://supaclicker.vercel.app)**

*Built with ❤️ during Supabase Launch Week 15*