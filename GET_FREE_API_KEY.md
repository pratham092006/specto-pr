# Get Your FREE API Key in 2 Minutes! 🚀

## Quick Steps to Get Groq API Key (100% FREE)

### Step 1: Visit Groq Console
1. Open your browser
2. Go to: **https://console.groq.com**
3. Click "Sign Up" or "Get Started"

### Step 2: Sign Up (30 seconds)
- Sign up with Google, GitHub, or Email
- No credit card required!
- Completely free

### Step 3: Create API Key
1. After login, you'll see the dashboard
2. Click on "API Keys" in the left sidebar
3. Click "Create API Key"
4. Give it a name: **SpecToPR**
5. Click "Create"
6. **COPY THE KEY** (starts with `gsk_`)

### Step 4: Add to Your Project
1. Open `backend/.env` file
2. Find this line:
   ```env
   OPENAI_API_KEY=gsk_your_groq_api_key_here
   ```
3. Replace `gsk_your_groq_api_key_here` with your actual key
4. Save the file

### Step 5: Get GitHub Token
1. Go to: **https://github.com/settings/tokens**
2. Click "Generate new token (classic)"
3. Name: **SpecToPR**
4. Check: ✅ **repo** (Full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (starts with `ghp_`)
7. Add to `backend/.env`:
   ```env
   GITHUB_TOKEN=ghp_your_github_token_here
   ```

### Step 6: Restart Backend
```bash
# In the backend terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

You should see:
```
✓ Using OpenAI-compatible API
✓ All environment variables configured
```

### Step 7: Test It!
1. Open http://localhost:3000
2. Enter a specification
3. Enter your repository URL
4. Paste your GitHub token
5. Click "Generate Pull Request"
6. Wait 30-60 seconds
7. Check your GitHub repo for the new PR! 🎉

---

## Your .env File Should Look Like This:

```env
# API Configuration - Using Groq (Free)
USE_OPENAI=true
OPENAI_API_URL=https://api.groq.com/openai/v1
OPENAI_API_KEY=gsk_abc123xyz789...  # Your actual Groq key

# GitHub Configuration
GITHUB_TOKEN=ghp_abc123xyz789...  # Your actual GitHub token

# Server Configuration
PORT=3001
NODE_ENV=development
```

---

## Troubleshooting

### "API key invalid"
- Make sure you copied the entire key
- Check for extra spaces
- Restart the backend server

### "GitHub token invalid"
- Ensure you selected the `repo` scope
- Check the token hasn't expired
- Generate a new token if needed

### Still not working?
- Check both keys are in `backend/.env`
- Restart the backend server (Ctrl+C then `npm run dev`)
- Check the terminal for error messages

---

## Why Groq?

✅ **100% FREE** - No credit card required  
✅ **Fast** - Faster than OpenAI  
✅ **Easy** - OpenAI-compatible API  
✅ **Generous limits** - Plenty for development  
✅ **Great models** - llama3-70b, mixtral-8x7b  

---

## Alternative Free Options

### 1. Together AI ($25 free credits)
- Website: https://api.together.xyz
- Sign up and get $25 free credits
- Update .env:
  ```env
  OPENAI_API_URL=https://api.together.xyz/v1
  OPENAI_API_KEY=your_together_key
  ```

### 2. Hugging Face (Free with limits)
- Website: https://huggingface.co
- Free inference API
- Requires code modifications

---

## Need Help?

1. Check the terminal output for errors
2. Verify both API key and GitHub token are set
3. Make sure you restarted the backend
4. Open an issue on GitHub if still stuck

---

**Ready to generate your first PR? Let's go! 🚀**