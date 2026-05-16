# SpecToPR Frontend

React-based frontend for SpecToPR - AI-powered Pull Request generation system.

## Overview

This is the user interface for SpecToPR, providing an intuitive way to generate pull requests from natural language specifications. The frontend communicates with the backend API to analyze repositories, generate code, and create PRs automatically.

## Features

- **Clean, Modern UI**: Professional interface with gradient backgrounds and smooth animations
- **Specification Input**: Large textarea with character counter and validation
- **Repository Configuration**: GitHub URL and token inputs with validation
- **Real-time Feedback**: Loading states, error messages, and success indicators
- **Tabbed Results Display**:
  - Generated Files with syntax highlighting
  - PR Description with markdown rendering
  - Repository DNA as formatted JSON
  - Summary with statistics and PR link
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: Proper focus states, ARIA labels, and keyboard navigation

## Tech Stack

- **React 18.2**: Modern React with hooks
- **Axios**: HTTP client for API calls
- **React Tabs**: Tabbed interface component
- **React Markdown**: Markdown rendering for PR descriptions
- **React Syntax Highlighter**: Code syntax highlighting with VS Code Dark+ theme
- **PropTypes**: Runtime type checking

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── SpecInput.js        # Specification textarea
│   │   ├── SpecInput.css
│   │   ├── RepoInput.js        # Repository URL & token inputs
│   │   ├── RepoInput.css
│   │   ├── GenerateButton.js   # Submit button
│   │   ├── GenerateButton.css
│   │   ├── ResultsTabs.js      # Tabbed results display
│   │   ├── ResultsTabs.css
│   │   ├── ErrorDisplay.js     # Error message component
│   │   ├── ErrorDisplay.css
│   │   ├── LoadingSpinner.js   # Loading indicator
│   │   └── LoadingSpinner.css
│   ├── services/
│   │   └── api.js              # API client
│   ├── utils/
│   │   └── formatters.js       # Utility functions
│   ├── App.js                  # Main application component
│   ├── App.css                 # Main application styles
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies and scripts
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## Prerequisites

- Node.js 16+ and npm
- Backend API running on http://localhost:3001 (or configured URL)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm start
```

The application will open at http://localhost:3000

### Production Build

Create an optimized production build:

```bash
npm run build
```

The build output will be in the `build/` directory.

### Testing

Run tests (if configured):

```bash
npm test
```

## Usage

1. **Enter Specification**: Write a detailed description of the feature or changes you want (minimum 50 characters)

2. **Configure Repository**:
   - Enter the full GitHub repository URL (e.g., https://github.com/user/repo)
   - Provide a GitHub Personal Access Token with `repo` scope

3. **Generate PR**: Click the "Generate Pull Request" button

4. **View Results**: Once complete, explore the tabbed interface:
   - **Generated Files**: View all created/modified files with syntax highlighting
   - **PR Description**: See the formatted PR description
   - **Repository DNA**: Examine the extracted repository structure
   - **Summary**: View statistics and access the PR link

## Component Details

### SpecInput
- Textarea for specification input
- Character counter (minimum 50 characters)
- Visual validation feedback
- Placeholder with example

### RepoInput
- GitHub repository URL input with validation
- GitHub token input with show/hide toggle
- Help text with link to generate token
- Real-time validation feedback

### GenerateButton
- Animated submit button
- Loading state with spinner
- Disabled state when form is invalid
- Rocket icon animation

### ResultsTabs
- Four tabs: Files, Description, DNA, Summary
- File viewer with expand/collapse
- Syntax highlighting for code
- Markdown rendering for descriptions
- JSON pretty-printing for DNA
- Copy-to-clipboard functionality
- Direct link to created PR

### ErrorDisplay
- Prominent error messages
- Dismissible with animation
- Clear visual hierarchy

### LoadingSpinner
- Full-screen overlay
- Animated spinner
- Progress indicators
- Informative text

## API Integration

The frontend communicates with the backend via REST API:

**Endpoint**: `POST /api/generate-pr`

**Request**:
```json
{
  "specification": "Feature description...",
  "repositoryUrl": "https://github.com/user/repo",
  "githubToken": "ghp_..."
}
```

**Response**:
```json
{
  "prUrl": "https://github.com/user/repo/pull/123",
  "prNumber": 123,
  "filesGenerated": [
    {
      "path": "src/file.js",
      "content": "// code..."
    }
  ],
  "dna": { /* repository structure */ },
  "prDescription": "# PR Title\n\nDescription...",
  "summary": "Generated 3 files..."
}
```

## Styling

The application uses a modern design system:

- **Colors**: Blue primary (#2563eb), gradient backgrounds
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Animations**: Smooth transitions and micro-interactions
- **Shadows**: Layered shadows for depth
- **Responsive**: Mobile-first approach with breakpoints

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Backend Connection Issues

If you see "No response from server":
1. Ensure backend is running on the configured URL
2. Check CORS settings in backend
3. Verify network connectivity

### Build Errors

If build fails:
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Clear npm cache: `npm cache clean --force`

### Styling Issues

If styles don't load:
1. Check browser console for CSS errors
2. Clear browser cache
3. Verify all CSS files are imported correctly

## Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Use network tab to inspect API calls
- Test on different screen sizes
- Validate forms before submission

## Contributing

When contributing to the frontend:

1. Follow React best practices
2. Use functional components with hooks
3. Add PropTypes for type checking
4. Keep components small and focused
5. Write descriptive CSS class names
6. Test on multiple browsers
7. Ensure responsive design

## License

Part of the SpecToPR project.

## Support

For issues or questions, please refer to the main project documentation.