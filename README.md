# ⚡ Supa Clicker

**An addictive incremental clicker game built for Supabase's 15th Launch Week Hackathon**

## 🚀 About the Project

**Supa Clicker** is a feature-rich incremental clicker game that showcases the power of Supabase's real-time capabilities. Built during the **15th Launch Week Hackathon**, this game combines addictive gameplay mechanics with modern web technologies to create an engaging multiplayer experience.

Click the SUPA, earn power, buy upgrades, and compete with players worldwide in this highly polished clicker game that goes far beyond simple clicking!

## ✨ Key Features

### 🎯 **Core Gameplay**
- **Satisfying Click Mechanics** - Every click matters with visual feedback and combo systems
- **Supabase/Retro Theme** - Retro-futuristic design with Supabase colors and elements
- **Real-time Progress** - Auto-save every 15 seconds with offline progress calculation

### 🏆 **Advanced Systems**
- **Ultra-Rewarding Prestige System** - Exponential growth from 25x to 1.7 billion multiplier at level 50
- **Achievement System** - Unlock achievements for clicks, milestones, and special actions
- **Leaderboard** - Compete globally with real-time rankings powered by Supabase
- **Anti-Cheat Protection** - Sophisticated validation to ensure fair play

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
- **User Authentication** - Secure login via Supabase Auth
- **Profile System** - Customizable avatars and usernames
- **Real-time Chat** - Communicate with other players (coming soon)
- **Cross-device Sync** - Your progress follows you everywhere

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **Animations**: Framer Motion
- **Backend**: Supabase (Database, Auth, Real-time, Functions and Storage)
- **Hosting**: Vercel
- **Security**: Crypto signatures, anti-cheat validation

## 🏗️ Architecture Highlights

### 🔒 **Security First**
- CSRF protection with crypto signatures
- Rate limiting on save operations
- Anti-cheat detection with tolerance-based validation
- Secure API endpoints with origin validation

### ⚡ **Performance Optimized**
- 60fps animations with optimized rendering
- Efficient state management with React Context
- Smart auto-save intervals to prevent data loss

### 🎨 **User Experience**
- Responsive design for mobile and desktop
- Dark/light theme support
- Smooth animations and visual feedback
- Intuitive UI with clear progression indicators

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
- Node.js 18+ 
- pnpm (recommended) or npm

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
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase project credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🏆 Hackathon Submission

This project was created for **Supabase's 15th Launch Week Hackathon**, showcasing:

- ✅ **Real-time multiplayer features** with live leaderboards
- ✅ **Advanced authentication** with user profiles  
- ✅ **Complex data relationships** between users, saves, and achievements
- ✅ **Real-time subscriptions** for leaderboard updates
- ✅ **Edge functions** for secure game validation
- ✅ **Storage integration** for user avatars

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase Team** for the amazing 15th Launch Week
- @BourezBastien, @SLcode777, Clemsouille for the feedbacks during the development of this project

---

**[🎮 Start Clicking Now!](https://supaclicker.vercel.app)** | **[📊 View Leaderboard](https://supaclicker.vercel.app)** | **[🏆 Unlock Achievements](https://supaclicker.vercel.app)**

*Built with ❤️ during Supabase Launch Week 15*
