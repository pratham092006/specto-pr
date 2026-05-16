# 🧪 Mock Mode - Test Without API Keys!

## Current Status: ✅ MOCK MODE ENABLED

Your application is now running in **MOCK MODE** which means:

✅ **No API keys needed** - Works without any sign-up  
✅ **Test the UI** - See how the interface works  
✅ **Example code** - Generates demo/example code  
✅ **No GitHub PRs** - Won't create real pull requests  
✅ **Perfect for testing** - Try the workflow without limits  

---

## How to Use Mock Mode

### 1. Open the Application
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 2. Fill in the Form
- **Specification**: Enter any feature description (e.g., "Add a login page")
- **Repository URL**: Enter any GitHub URL (e.g., "https://github.com/user/repo")
- **GitHub Token**: Enter anything (e.g., "test123")

### 3. Generate PR
- Click "Generate Pull Request"
- Wait 5-10 seconds
- You'll see example/demo code generated

### 4. View Results
- See generated files in the "Files" tab
- View example PR description
- Check the DNA analysis
- Review the summary

---

## What Mock Mode Does

### ✅ Works:
- UI and all components
- Form validation
- Repository cloning (if URL is valid)
- DNA extraction (uses default patterns)
- Code generation (generates example code)
- Result display

### ❌ Doesn't Work:
- Real AI code generation
- Actual GitHub PR creation
- Custom code based on your repo
- Real API calls

---

## Example Test Data

Try these to test the application:

**Specification:**
```
Add a user authentication system with login and registration pages.
Include password hashing and JWT token generation.
Add middleware for protected routes.
```

**Repository URL:**
```
https://github.com/yourusername/test-repo
```

**GitHub Token:**
```
test_token_123
```

---

## Upgrade to Real Mode

When you're ready to use real APIs:

### Step 1: Get Groq API Key (FREE)
1. Visit: https://console.groq.com
2. Sign up (takes 1 minute)
3. Create API key
4. Copy the key (starts with `gsk_`)

### Step 2: Get GitHub Token
1. Visit: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: ✅ `repo`
4. Copy the token (starts with `ghp_`)

### Step 3: Update Configuration
Edit `backend/.env`:
```env
# Replace these lines:
OPENAI_API_KEY=
GITHUB_TOKEN=mock_token_for_testing

# With your real credentials:
OPENAI_API_KEY=gsk_your_actual_groq_key
GITHUB_TOKEN=ghp_your_actual_github_token
```

### Step 4: Restart Backend
```bash
# Press Ctrl+C in backend terminal
# Then restart:
npm run dev
```

You should see:
```
✓ Using OpenAI-compatible API
✓ GitHub integration enabled
```

---

## Troubleshooting Mock Mode

### "Cannot connect to backend"
- Check backend is running on port 3001
- Visit: http://localhost:3001/api/health

### "Form validation errors"
- Specification must be at least 50 characters
- Repository URL must be a valid GitHub URL format
- GitHub token must be at least 20 characters (in mock mode, any text works)

### "Generation takes too long"
- Mock mode should complete in 5-10 seconds
- Check backend terminal for errors
- Restart backend if needed

---

## Benefits of Mock Mode

✅ **No Sign-up Required** - Start testing immediately  
✅ **No API Limits** - Test as many times as you want  
✅ **Fast** - No external API calls  
✅ **Safe** - No real changes to GitHub  
✅ **Educational** - Learn how the system works  

---

## Next Steps

1. ✅ Test the UI in mock mode
2. 📖 Read the generated example code
3. 🎨 Customize the interface if needed
4. 🚀 When ready, upgrade to real APIs (2 minutes)

---

**Enjoy testing! 🎉**

*Mock mode is perfect for demos, development, and understanding the workflow.*