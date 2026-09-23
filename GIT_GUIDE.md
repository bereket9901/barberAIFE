# Git Guide - BarberAI Monorepo

## 📦 Repository Structure

This is a **monorepo** containing both frontend and backend in a single Git repository:

```
barberai/
├── backend/          # Node.js backend (committed to Git)
├── src/              # React frontend (committed to Git)
├── package.json      # Root package.json
└── README.md
```

## 🚀 Initial Setup

### 1. Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: BarberAI full-stack application"
```

### 2. Add Remote Repository

```bash
# GitHub
git remote add origin https://github.com/YOUR_USERNAME/barberai.git

# GitLab
git remote add origin https://gitlab.com/YOUR_USERNAME/barberai.git

# Bitbucket
git remote add origin https://bitbucket.org/YOUR_USERNAME/barberai.git
```

### 3. Push to Remote

```bash
git branch -M main
git push -u origin main
```

## 📝 Daily Workflow

### Making Changes

```bash
# 1. Check status
git status

# 2. Stage changes
git add .                    # Stage all changes
# OR
git add src/                 # Stage frontend only
git add backend/             # Stage backend only

# 3. Commit
git commit -m "feat: add payment processing"

# 4. Push
git push origin main
```

### Commit Message Convention

Use conventional commits:

```bash
# Features
git commit -m "feat: add real-time camera feeds"
git commit -m "feat(api): add transaction statistics endpoint"

# Bug fixes
git commit -m "fix: resolve session calculation error"
git commit -m "fix(ui): correct button alignment on mobile"

# Documentation
git commit -m "docs: update API documentation"

# Refactoring
git commit -m "refactor: simplify session controller"

# Styling
git commit -m "style: update dashboard color scheme"

# Testing
git commit -m "test: add unit tests for services API"
```

## 🔀 Branching Strategy

### Create Feature Branch

```bash
git checkout -b feature/payment-integration
# Make changes...
git add .
git commit -m "feat: integrate Telebirr payment API"
git push origin feature/payment-integration
```

### Create Bug Fix Branch

```bash
git checkout -b fix/session-calculation
# Make changes...
git add .
git commit -m "fix: correct total bill calculation"
git push origin fix/session-calculation
```

### Merge to Main

```bash
git checkout main
git merge feature/payment-integration
git push origin main
```

## 📂 What Gets Committed

### ✅ Committed (Tracked by Git)

- `src/` - All frontend source code
- `backend/src/` - All backend source code
- `backend/package.json` - Backend dependencies list
- `package.json` - Frontend dependencies list
- `README.md`, `INTEGRATION_GUIDE.md`, etc.
- Configuration files (tsconfig.json, vite.config.js, etc.)
- `src/lib/api.ts` - API client

### ❌ Not Committed (Ignored by Git)

- `node_modules/` - Dependencies (installed via `npm install`)
- `backend/node_modules/` - Backend dependencies
- `backend/data/*.db` - SQLite database files
- `dist/` - Build output
- `.env` files - Environment variables
- `*.log` - Log files

## 🔄 Syncing Changes

### Pull Latest Changes

```bash
git pull origin main
```

### After Pulling, Install Dependencies

```bash
# Install/update all dependencies
npm run install:all

# Or manually:
npm install
cd backend && npm install
```

## 📊 Common Git Commands

```bash
# Status
git status                           # Show working tree status
git log --oneline                    # Show commit history

# Staging
git add .                            # Stage all changes
git add src/App.tsx                  # Stage specific file
git add src/ backend/                # Stage specific directories

# Committing
git commit -m "message"              # Commit staged changes
git commit -am "message"             # Stage tracked files and commit

# Pushing
git push                             # Push to remote
git push origin feature-branch       # Push specific branch

# Pulling
git pull                             # Pull and merge
git pull --rebase                    # Pull with rebase

# Branches
git branch                           # List branches
git checkout -b new-branch           # Create and switch to branch
git checkout main                    # Switch to main branch
git branch -d feature-branch         # Delete branch

# Diff
git diff                             # Show unstaged changes
git diff --cached                    # Show staged changes
git diff main..feature               # Compare branches
```

## 🚨 Handling Conflicts

If you get merge conflicts:

```bash
# 1. See conflicting files
git status

# 2. Open files and resolve conflicts (look for <<<<<<< markers)

# 3. Stage resolved files
git add <resolved-file>

# 4. Complete the merge
git commit -m "merge: resolve conflicts"
```

## 📦 Deploying from Git

### Frontend (Vercel/Netlify)

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Backend (Railway/Render)

1. Connect your Git repository
2. Set root directory: `backend`
3. Set start command: `npm start`
4. Deploy!

## 🎯 Best Practices

### ✅ Do

- Commit frequently with meaningful messages
- Use feature branches for new features
- Pull before you start working
- Test both frontend and backend before committing
- Keep `.env` files out of Git
- Update README when adding features

### ❌ Don't

- Don't commit `node_modules/`
- Don't commit database files (`*.db`)
- Don't commit environment variables
- Don't commit build output (`dist/`)
- Don't force push to main branch
- Don't commit large files

## 📋 Example Workflow

```bash
# 1. Start your day
git checkout main
git pull origin main
npm run install:all

# 2. Create feature branch
git checkout -b feature/ai-confidence-scoring

# 3. Make changes...
# Edit files in src/ and/or backend/

# 4. Test your changes
npm run dev              # Frontend
npm run dev:backend      # Backend (separate terminal)

# 5. Stage and commit
git add .
git commit -m "feat: add AI confidence scoring with threshold warnings"

# 6. Push to remote
git push origin feature/ai-confidence-scoring

# 7. Create Pull Request on GitHub/GitLab

# 8. After merge, update your local main
git checkout main
git pull origin main
```

## 🔐 Security Notes

### Never Commit:
- API keys
- Database credentials
- `.env` files
- Private keys
- Payment API secrets

### Use Environment Variables:
```bash
# backend/.env (not committed)
PORT=3001
DATABASE_URL=sqlite:./data/barberai.db
TELEBIRR_API_KEY=your-secret-key
```

## 📞 Need Help?

```bash
# See what's changed
git status
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes temporarily
git stash
git stash pop
```

---

**Happy coding! 🚀**
