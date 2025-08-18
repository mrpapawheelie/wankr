# WANKR Project Structure

## 🏗️ Current Architecture

```
wankr/
├── frontend/              # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── layout/    # Reusable layout components
│   │   │   ├── Wallet/    # Wallet-related components
│   │   │   ├── ShameFeed/ # Live shame feed
│   │   │   ├── Leaderboard/ # Leaderboards
│   │   │   └── SendWankr/ # Send WANKR form
│   │   ├── theme/         # Centralized theming
│   │   ├── services/      # API services
│   │   ├── hooks/         # React hooks
│   │   └── utils/         # Utility functions
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── src/                   # Node.js + TypeScript Backend
│   ├── services/          # Business logic services
│   │   ├── handleResolutionService.ts
│   │   ├── duneService.ts
│   │   ├── leaderboardService.ts
│   │   ├── shameFeedService.ts
│   │   ├── register.ts
│   │   └── checkRegister.ts
│   └── server.ts          # Express server
├── contracts/             # Solidity smart contracts
├── package.json           # Backend dependencies + root scripts
└── README.md
```

## 🚀 Development Workflow

### **Quick Start**
```bash
# Install all dependencies (both frontend and backend)
npm run install:all

# Start both frontend and backend in development mode
npm run dev
```

### **Individual Commands**
```bash
# Backend only
npm run dev:server    # Start backend server
npm run build:server  # Build backend

# Frontend only
npm run dev:client    # Start frontend dev server
npm run build:client  # Build frontend

# Both together
npm run dev           # Start both servers
npm run build         # Build both
```

## 📁 Structure Benefits

### **✅ Why This Structure Works Well:**

1. **Clear Separation**: Frontend and backend are clearly separated
2. **Independent Development**: Can work on frontend/backend independently
3. **Standard Tools**: Uses standard tools (Vite for frontend, nodemon for backend)
4. **Easy Deployment**: Can deploy frontend and backend separately
5. **Convenient Scripts**: Root package.json provides easy commands

### **🔄 Alternative Structures (For Reference):**

#### **Option 1: Monorepo with Workspaces**
```
wankr/
├── packages/
│   ├── client/        # Frontend
│   └── server/        # Backend
└── package.json       # Root workspace
```
**Pros**: More professional, better for large teams
**Cons**: More complex setup, overkill for this project

#### **Option 2: Standard Full-Stack**
```
wankr/
├── client/            # Frontend
├── server/            # Backend
└── shared/            # Shared types
```
**Pros**: Very clear separation
**Cons**: More directories to navigate

## 🎯 Current Structure is Perfect Because:

1. **Simple & Clear**: Easy to understand and navigate
2. **Standard**: Follows common React/Node.js conventions
3. **Scalable**: Can easily add more features
4. **Deployable**: Frontend can be deployed to Vercel/Netlify, backend to any Node.js host
5. **Maintainable**: Clear separation of concerns

## 🔧 Development Tips

### **Frontend Development**
- Runs on `http://localhost:5173`
- Hot reload enabled
- Uses Vite for fast development

### **Backend Development**
- Runs on `http://localhost:3000`
- Auto-restart with nodemon
- TypeScript compilation

### **Full-Stack Development**
- Use `npm run dev` to start both
- Frontend proxies API calls to backend
- Shared environment variables

## 📦 Package Management

### **Root Level**
- `concurrently`: Run multiple commands
- Backend dependencies
- Development tools (ESLint, Prettier)

### **Frontend Level**
- React dependencies
- Vite build tools
- Frontend-specific packages

## 🚀 Deployment Ready

This structure is perfect for deployment:

- **Frontend**: Can be deployed to Vercel, Netlify, or any static host
- **Backend**: Can be deployed to Railway, Heroku, or any Node.js host
- **Smart Contracts**: Can be deployed to Base chain using Foundry

## ✅ Conclusion

The current structure is **professional, maintainable, and follows industry standards**. It's perfect for this project and can easily scale as needed. No changes required!
