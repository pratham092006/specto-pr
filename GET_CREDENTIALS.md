# How to Get IBM Bob API Credentials

## Overview
You need two sets of credentials to use SpecToPR:
1. **IBM Bob API credentials** (for AI code generation)
2. **GitHub Personal Access Token** (for repository access)

---

## 1. IBM Bob API Credentials

### Option A: IBM Bob Platform (Recommended)

1. **Visit IBM Bob Platform**
   - Go to the IBM Bob AI platform website
   - Sign in with your IBM ID or create a new account

2. **Navigate to API Settings**
   - Go to your account dashboard
   - Look for "API Keys" or "Developer Settings"

3. **Generate API Key**
   - Click "Create New API Key" or "Generate Key"
   - Give it a name: "SpecToPR Development"
   - Copy the generated key immediately

4. **Get API Endpoint URL**
   - The API endpoint should be displayed in your dashboard
   - Common formats:
     - `https://api.bob.ibm.com`
     - `https://bob-api.cloud.ibm.com`
     - `https://watsonx.ai/api/bob`

### Option B: Contact IBM Support

If you don't have access to the Bob platform:

1. **Email IBM Support**
   - Email: ibm-bob-support@ibm.com (or your organization's IBM contact)
   - Subject: "Request for IBM Bob API Access"
   - Include:
     - Your name and organization
     - Purpose: "SpecToPR Development"
     - Required access level

2. **Wait for Credentials**
   - IBM will provide:
     - API endpoint URL
     - API key
     - Usage limits and documentation

### Option C: Use Mock Mode (For Testing)

If you don't have Bob API credentials yet, you can test the app in mock mode:

1. **Leave BOB_API_KEY empty** in your `.env` file:
   ```env
   BOB_API_KEY=
   ```

2. **The app will use mock responses** for testing
   - DNA extraction will return default patterns
   - Code generation will return example files
   - You can test the UI and workflow

---

## 2. GitHub Personal Access Token

### Step-by-Step Guide

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - **Note**: Enter "SpecToPR Development"
   - **Expiration**: Select 90 days (or custom)

3. **Select Required Scopes**
   - ✅ **repo** (Full control of private repositories)
     - This automatically includes:
       - repo:status
       - repo_deployment
       - public_repo
       - repo:invite
       - security_events
   
   Optional but recommended:
   - ✅ **workflow** (Update GitHub Action workflows)

4. **Generate Token**
   - Click "Generate token" at the bottom
   - **IMPORTANT**: Copy the token immediately!
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again

5. **Save Token Securely**
   - Store in password manager
   - Add to backend `.env` file
   - Never commit to version control

### Token Security Best Practices

- ✅ Use separate tokens for different projects
- ✅ Set expiration dates
- ✅ Regenerate if compromised
- ✅ Use fine-grained tokens for production
- ❌ Never share tokens
- ❌ Never commit tokens to Git

---

## 3. Configure Your Environment

### Backend Configuration

Edit `backend/.env`:

```env
# IBM Bob API Configuration
BOB_API_URL=https://api.bob.ibm.com
BOB_API_KEY=your_actual_bob_api_key_here

# GitHub Configuration
GITHUB_TOKEN=ghp_your_actual_github_token_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Verify Configuration

```bash
# Test backend configuration
cd backend
node -e "require('dotenv').config(); console.log('Bob API:', process.env.BOB_API_KEY ? '✅ Configured' : '❌ Missing'); console.log('GitHub:', process.env.GITHUB_TOKEN ? '✅ Configured' : '❌ Missing');"
```

---

## 4. Testing Your Setup

### Test GitHub Token

```bash
# Test GitHub API access
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/user
```

Expected response: Your GitHub user information

### Test Bob API (if available)

```bash
# Test Bob API connection
curl -H "Authorization: Bearer YOUR_BOB_API_KEY" \
     -H "Content-Type: application/json" \
     YOUR_BOB_API_URL/health
```

### Test Full Application

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Open: http://localhost:3000
4. Try generating a simple PR

---

## 5. Troubleshooting

### "Cannot connect to Bob API"

**Possible causes:**
- Wrong API URL
- Invalid API key
- Network/firewall issues
- API service down

**Solutions:**
1. Verify API URL is correct
2. Check API key hasn't expired
3. Test with curl command above
4. Contact IBM support

### "GitHub token invalid"

**Possible causes:**
- Token expired
- Wrong scope selected
- Token revoked

**Solutions:**
1. Generate new token
2. Ensure `repo` scope is selected
3. Check token hasn't been revoked
4. Test with curl command above

### "Mock mode activated"

**This means:**
- BOB_API_KEY is not set or invalid
- App is using mock responses for testing

**To fix:**
- Add valid BOB_API_KEY to `.env`
- Restart backend server

---

## 6. Alternative: Use OpenAI API

If you can't get IBM Bob API access, you can modify the code to use OpenAI:

### Modify `backend/services/bobApiClient.js`

Change the API endpoint and format:

```javascript
const response = await axios.post(
  'https://api.openai.com/v1/chat/completions',
  {
    model: 'gpt-4',
    messages: [/* ... */]
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### Update `.env`

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

---

## 7. Getting Help

### IBM Bob Support
- Email: ibm-bob-support@ibm.com
- Documentation: Check IBM Cloud documentation
- Community: IBM Developer forums

### GitHub Support
- Documentation: https://docs.github.com/en/authentication
- Support: https://support.github.com

### SpecToPR Issues
- GitHub Issues: Open an issue in the repository
- Documentation: Check SETUP.md and README.md

---

## Quick Reference

### Required Credentials Checklist

- [ ] IBM Bob API URL
- [ ] IBM Bob API Key
- [ ] GitHub Personal Access Token (with `repo` scope)
- [ ] Both added to `backend/.env`
- [ ] Backend server restarted
- [ ] Configuration verified with test commands

### Environment File Template

```env
# backend/.env
BOB_API_URL=https://api.bob.ibm.com
BOB_API_KEY=your_bob_api_key_here
GITHUB_TOKEN=ghp_your_github_token_here
PORT=3001
NODE_ENV=development
```

---

**Need more help?** Check SETUP.md for detailed installation instructions.