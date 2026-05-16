# SpecToPR Setup Guide

Complete installation and configuration guide for SpecToPR system.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Detailed Installation](#detailed-installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [API Credentials Setup](#api-credentials-setup)
- [Verification](#verification)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Recommended | Download |
|----------|----------------|-------------|----------|
| **Node.js** | 16.0.0 | 18.x or 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 8.0.0 | Latest | Included with Node.js |
| **Git** | 2.0.0 | Latest | [git-scm.com](https://git-scm.com/) |

### Required Accounts & Credentials

1. **GitHub Account** with:
   - Personal Access Token (PAT) with `repo` scope
   - Write access to target repositories

2. **IBM Bob API Access** with:
   - API endpoint URL
   - Valid API key

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for application + space for cloned repositories
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

## Quick Setup

For experienced developers who want to get started quickly:

```bash
# Clone repository
git clone https://github.com/yourusername/spectropr.git
cd spectropr

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
cp .env.example .env
npm start

# Open http://localhost:3000
```

⚠️ **Don't forget to configure environment variables!** See [Environment Configuration](#environment-configuration).

## Detailed Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/spectropr.git

# Navigate to project directory
cd spectropr

# Verify structure
ls -la
# You should see: backend/, frontend/, ARCHITECTURE.md, README.md, etc.
```

### Backend Setup

#### 1. Navigate to Backend Directory

```bash
cd backend
```

#### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `axios` - HTTP client
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing
- `simple-git` - Git operations
- And other dependencies listed in `package.json`

**Expected output:**
```
added 150 packages, and audited 151 packages in 15s
```

#### 3. Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Open in your editor
# Windows: notepad .env
# macOS: open -e .env
# Linux: nano .env
```

#### 4. Configure Backend Environment Variables

Edit `.env` file with your credentials:

```env
# Bob API Configuration
BOB_API_URL=https://api.bob.com
BOB_API_KEY=your_actual_bob_api_key_here

# GitHub Configuration
GITHUB_TOKEN=ghp_your_actual_github_token_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important Notes:**
- Replace `your_actual_bob_api_key_here` with your real Bob API key
- Replace `ghp_your_actual_github_token_here` with your GitHub token
- Never commit the `.env` file to version control
- Keep your tokens secure and private

#### 5. Verify Backend Installation

```bash
# Test that dependencies are installed
node -e "console.log('Node.js is working!')"

# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.BOB_API_KEY ? '✅ BOB_API_KEY loaded' : '❌ BOB_API_KEY missing')"
```

#### 6. Start Backend Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

**Expected output:**
```
Server running on port 3001
Bob API: Configured
GitHub API: Configured
```

✅ **Backend is now running!** Keep this terminal open.

### Frontend Setup

Open a **new terminal** window/tab for the frontend.

#### 1. Navigate to Frontend Directory

```bash
cd frontend
# Or from project root: cd spectropr/frontend
```

#### 2. Install Dependencies

```bash
npm install
```

This will install:
- `react` & `react-dom` - React framework
- `axios` - HTTP client
- `react-tabs` - Tabbed interface
- `react-markdown` - Markdown rendering
- `react-syntax-highlighter` - Code highlighting
- And other dependencies

**Expected output:**
```
added 1500 packages, and audited 1501 packages in 30s
```

#### 3. Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Open in your editor
# Windows: notepad .env
# macOS: open -e .env
# Linux: nano .env
```

#### 4. Configure Frontend Environment Variables

Edit `.env` file:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Application Settings
REACT_APP_NAME=SpecToPR
REACT_APP_VERSION=1.0.0
```

**Important Notes:**
- `REACT_APP_API_URL` must match your backend URL
- If backend runs on different port, update accordingly
- All React env vars must start with `REACT_APP_`

#### 5. Start Frontend Development Server

```bash
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view spectropr-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

✅ **Frontend is now running!** Your browser should automatically open to `http://localhost:3000`.

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOB_API_URL` | ✅ Yes | - | IBM Bob API endpoint URL |
| `BOB_API_KEY` | ✅ Yes | - | Your Bob API authentication key |
| `GITHUB_TOKEN` | ✅ Yes | - | GitHub Personal Access Token |
| `PORT` | ❌ No | 3001 | Backend server port |
| `NODE_ENV` | ❌ No | development | Environment (development/production) |
| `CORS_ORIGIN` | ❌ No | * | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | ❌ No | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ No | 100 | Max requests per window |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | ✅ Yes | - | Backend API URL |
| `REACT_APP_NAME` | ❌ No | SpecToPR | Application name |
| `REACT_APP_VERSION` | ❌ No | 1.0.0 | Application version |

## API Credentials Setup

### GitHub Personal Access Token

1. **Navigate to GitHub Settings**
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens)
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Give it a descriptive name: "SpecToPR Development"
   - Set expiration (recommend 90 days for development)

3. **Select Scopes**
   - ✅ `repo` - Full control of private repositories
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
   - ✅ `workflow` (optional) - If you want to modify GitHub Actions

4. **Generate and Copy Token**
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)
   - Token format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Add to Environment File**
   ```env
   GITHUB_TOKEN=ghp_your_copied_token_here
   ```

### IBM Bob API Credentials

1. **Obtain Bob API Access**
   - Contact your IBM representative or
   - Sign up at IBM Bob API portal
   - Request API credentials

2. **Get API Endpoint and Key**
   - API URL: Provided by IBM (e.g., `https://api.bob.com`)
   - API Key: Long alphanumeric string

3. **Add to Environment File**
   ```env
   BOB_API_URL=https://api.bob.com
   BOB_API_KEY=your_bob_api_key_here
   ```

## Verification

### Backend Verification

1. **Health Check**
   ```bash
   curl http://localhost:3001/api/health
   ```
   
   **Expected response:**
   ```json
   {
     "status": "ok",
     "timestamp": "2026-05-16T06:30:00.000Z",
     "configuration": {
       "bob": "configured",
       "github": "configured"
     }
   }
   ```

2. **Configuration Check**
   ```bash
   curl http://localhost:3001/api/config
   ```
   
   **Expected response:**
   ```json
   {
     "bob": {
       "configured": true,
       "url": "https://api.bob.com"
     },
     "github": {
       "configured": true
     }
   }
   ```

3. **Test Environment Variables**
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log('BOB_API_KEY:', process.env.BOB_API_KEY ? '✅ Set' : '❌ Missing'); console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Missing');"
   ```

### Frontend Verification

1. **Open Browser**
   - Navigate to `http://localhost:3000`
   - You should see the SpecToPR interface

2. **Check Console**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Should see: "SpecToPR Frontend Loaded"

3. **Test API Connection**
   - In browser console, run:
   ```javascript
   fetch('http://localhost:3001/api/health')
     .then(r => r.json())
     .then(d => console.log('Backend connected:', d))
   ```

### End-to-End Test

1. **Prepare Test Repository**
   - Use a test repository you have write access to
   - Or create a new test repository on GitHub

2. **Generate Test PR**
   - Open frontend at `http://localhost:3000`
   - Enter specification:
     ```
     Add a simple hello world function that returns "Hello, World!"
     ```
   - Enter repository URL: `https://github.com/yourusername/test-repo`
   - Enter GitHub token
   - Click "Generate Pull Request"

3. **Verify Success**
   - Wait for completion (30-60 seconds)
   - Check that PR was created on GitHub
   - Review generated files in the UI

## Platform-Specific Instructions

### Windows

#### Using PowerShell

```powershell
# Clone repository
git clone https://github.com/yourusername/spectropr.git
cd spectropr

# Backend setup
cd backend
npm install
Copy-Item .env.example .env
notepad .env  # Edit with your credentials
npm run dev

# Frontend setup (new PowerShell window)
cd frontend
npm install
Copy-Item .env.example .env
notepad .env
npm start
```

#### Using Command Prompt

```cmd
REM Clone repository
git clone https://github.com/yourusername/spectropr.git
cd spectropr

REM Backend setup
cd backend
npm install
copy .env.example .env
notepad .env
npm run dev

REM Frontend setup (new Command Prompt window)
cd frontend
npm install
copy .env.example .env
notepad .env
npm start
```

#### Common Windows Issues

**Issue: "npm is not recognized"**
- Solution: Add Node.js to PATH or reinstall Node.js with "Add to PATH" option

**Issue: Port already in use**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001
# Kill process (replace PID)
taskkill /PID <PID> /F
```

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js via Homebrew
brew install node

# Clone and setup
git clone https://github.com/yourusername/spectropr.git
cd spectropr

# Backend
cd backend
npm install
cp .env.example .env
open -e .env  # Opens in TextEdit
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
open -e .env
npm start
```

#### Common macOS Issues

**Issue: Permission denied**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

**Issue: Port already in use**
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Clone and setup
git clone https://github.com/yourusername/spectropr.git
cd spectropr

# Backend
cd backend
npm install
cp .env.example .env
nano .env  # Or use your preferred editor
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
nano .env
npm start
```

#### Common Linux Issues

**Issue: EACCES permission errors**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Issue: Port already in use**
```bash
# Find and kill process
sudo lsof -ti:3001 | xargs kill -9
```

## Troubleshooting

### Backend Issues

#### "BOB_API_KEY is not set"

**Symptoms:**
- Backend fails to start
- Error message about missing API key

**Solutions:**
1. Verify `.env` file exists in `backend/` directory
2. Check `.env` contains `BOB_API_KEY=your_key`
3. Ensure no spaces around `=` sign
4. Restart backend server after editing `.env`

```bash
# Verify environment file
cd backend
cat .env  # Linux/macOS
type .env  # Windows

# Test loading
node -e "require('dotenv').config(); console.log(process.env.BOB_API_KEY)"
```

#### "Cannot connect to Bob API"

**Symptoms:**
- Backend starts but API calls fail
- Timeout errors

**Solutions:**
1. Verify `BOB_API_URL` is correct
2. Check internet connection
3. Test API endpoint:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" https://api.bob.com/health
   ```
4. Check firewall settings

#### "GitHub token invalid"

**Symptoms:**
- "Bad credentials" error
- 401 Unauthorized responses

**Solutions:**
1. Verify token hasn't expired
2. Check token has `repo` scope
3. Regenerate token if necessary
4. Test token:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```

#### "Port 3001 already in use"

**Symptoms:**
- `EADDRINUSE` error
- Backend won't start

**Solutions:**
1. Change port in `.env`: `PORT=3002`
2. Or kill process using port:
   ```bash
   # Linux/macOS
   lsof -ti:3001 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

### Frontend Issues

#### "Cannot connect to backend"

**Symptoms:**
- "Network Error" in browser
- API calls fail

**Solutions:**
1. Verify backend is running on correct port
2. Check `REACT_APP_API_URL` in frontend `.env`
3. Test backend health:
   ```bash
   curl http://localhost:3001/api/health
   ```
4. Check browser console for CORS errors
5. Verify backend CORS settings allow frontend origin

#### "Module not found" errors

**Symptoms:**
- Build fails
- Import errors

**Solutions:**
1. Delete `node_modules/` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```

#### "Port 3000 already in use"

**Symptoms:**
- Frontend won't start
- Port conflict message

**Solutions:**
1. Kill process using port 3000
2. Or start on different port:
   ```bash
   PORT=3001 npm start  # Linux/macOS
   set PORT=3001 && npm start  # Windows
   ```

### Common Setup Issues

#### Dependencies won't install

**Solutions:**
1. Update npm:
   ```bash
   npm install -g npm@latest
   ```
2. Clear cache:
   ```bash
   npm cache clean --force
   ```
3. Delete lock file and retry:
   ```bash
   rm package-lock.json
   npm install
   ```

#### Git clone fails

**Solutions:**
1. Check internet connection
2. Verify Git is installed: `git --version`
3. Try HTTPS instead of SSH or vice versa
4. Check repository URL is correct

#### Environment variables not loading

**Solutions:**
1. Ensure `.env` file is in correct directory
2. Check file is named exactly `.env` (not `.env.txt`)
3. Restart server after editing `.env`
4. Verify no syntax errors in `.env` file

## Next Steps

✅ **Setup Complete!** You're ready to use SpecToPR.

**Recommended next steps:**

1. 📖 Read [EXAMPLES.md](EXAMPLES.md) for usage examples
2. 🔧 Review [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
3. 🚀 Try generating your first PR
4. 📊 Monitor logs for any issues

**Need help?**
- Check [Troubleshooting](#troubleshooting) section above
- Review [README.md](README.md) for overview
- Open an issue on GitHub

---

**Happy coding! 🎉**