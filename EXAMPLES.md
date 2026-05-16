# SpecToPR Usage Examples

Real-world examples demonstrating how to use SpecToPR to generate pull requests from natural language specifications.

## Table of Contents

- [Example 1: Adding a REST API Endpoint](#example-1-adding-a-rest-api-endpoint)
- [Example 2: Creating a React Component](#example-2-creating-a-react-component)
- [Example 3: Adding Database Integration](#example-3-adding-database-integration)
- [Example 4: Implementing Authentication](#example-4-implementing-authentication)
- [Example 5: Adding Unit Tests](#example-5-adding-unit-tests)
- [Example 6: Creating Documentation](#example-6-creating-documentation)
- [Tips for Writing Good Specifications](#tips-for-writing-good-specifications)

---

## Example 1: Adding a REST API Endpoint

### Scenario
You have an Express.js API and need to add a new endpoint for user profile management.

### Specification Text

```
Add a new REST API endpoint for user profile management with the following requirements:

1. Create a GET endpoint at /api/users/:userId/profile that retrieves user profile information
2. Create a PUT endpoint at /api/users/:userId/profile that updates user profile data
3. Include validation middleware to ensure:
   - userId is a valid MongoDB ObjectId
   - Profile data includes: firstName, lastName, email, bio, avatar URL
   - Email format is validated
   - Bio has a maximum length of 500 characters
4. Add error handling for:
   - User not found (404)
   - Invalid input data (400)
   - Database errors (500)
5. Include JSDoc comments for all functions
6. Follow the existing Express.js patterns in the repository
7. Add comprehensive unit tests using the existing test framework
8. Update API documentation with the new endpoints

The implementation should match the coding style and patterns already present in the codebase, including error handling conventions, response formatting, and middleware usage.
```

### Expected Repository Structure

```
my-express-api/
├── src/
│   ├── routes/
│   │   └── users.js          # Existing user routes
│   ├── controllers/
│   │   └── userController.js # Existing controller
│   ├── middleware/
│   │   └── validation.js     # Existing validation
│   └── models/
│       └── User.js           # Existing user model
└── tests/
    └── users.test.js         # Existing tests
```

### Generated Files Preview

**File 1: `src/routes/userProfile.js`**
```javascript
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');
const { validateObjectId, validateProfileData } = require('../middleware/validation');

/**
 * @route GET /api/users/:userId/profile
 * @desc Get user profile
 * @access Public
 */
router.get('/:userId/profile', validateObjectId, getUserProfile);

/**
 * @route PUT /api/users/:userId/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/:userId/profile', validateObjectId, validateProfileData, updateUserProfile);

module.exports = router;
```

**File 2: `src/controllers/profileController.js`**
```javascript
const User = require('../models/User');

/**
 * Get user profile by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('firstName lastName email bio avatar');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ... (updateUserProfile implementation)
```

**File 3: `tests/userProfile.test.js`**
```javascript
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('User Profile API', () => {
  describe('GET /api/users/:userId/profile', () => {
    it('should return user profile for valid userId', async () => {
      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011/profile')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('firstName');
    });
    
    // ... (more tests)
  });
});
```

### PR Description Preview

```markdown
# Add User Profile Management Endpoints

## Summary
Added new REST API endpoints for user profile management with comprehensive validation and error handling.

## Changes
- ✅ Created GET endpoint for retrieving user profiles
- ✅ Created PUT endpoint for updating user profiles
- ✅ Added validation middleware for ObjectId and profile data
- ✅ Implemented error handling for common scenarios
- ✅ Added JSDoc documentation
- ✅ Created comprehensive unit tests

## Files Changed
- `src/routes/userProfile.js` (new)
- `src/controllers/profileController.js` (new)
- `src/middleware/validation.js` (modified)
- `tests/userProfile.test.js` (new)

## Testing
All tests pass successfully:
- ✅ Profile retrieval with valid ID
- ✅ Profile update with valid data
- ✅ Error handling for invalid IDs
- ✅ Validation of profile data

## API Documentation
### GET /api/users/:userId/profile
Returns user profile information.

### PUT /api/users/:userId/profile
Updates user profile data.
```

---

## Example 2: Creating a React Component

### Scenario
You need to add a reusable notification component to your React application.

### Specification Text

```
Create a reusable notification component for the React application with the following features:

1. Component should display notifications with different types: success, error, warning, info
2. Each notification should have:
   - Icon based on type
   - Title (optional)
   - Message (required)
   - Close button
   - Auto-dismiss after 5 seconds (configurable)
3. Support for multiple notifications displayed as a stack in the top-right corner
4. Smooth animations for showing and hiding notifications
5. Responsive design that works on mobile and desktop
6. Accessibility features:
   - Proper ARIA labels
   - Keyboard navigation support
   - Screen reader friendly
7. Include a custom hook (useNotification) for easy integration
8. Style using CSS modules to avoid conflicts
9. Add PropTypes for type checking
10. Create a demo page showing all notification types
11. Write unit tests using React Testing Library
12. Follow the existing React patterns and component structure in the repository

The component should integrate seamlessly with the existing design system and match the coding conventions used throughout the application.
```

### Expected Repository Structure

```
my-react-app/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   └── Card/
│   ├── hooks/
│   │   └── useAuth.js
│   └── styles/
│       └── variables.css
└── tests/
    └── components/
```

### Generated Files Preview

**File 1: `src/components/Notification/Notification.js`**
```javascript
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Notification.module.css';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'react-feather';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const Notification = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  autoClose = true,
  duration = 5000 
}) => {
  const Icon = iconMap[type];

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div 
      className={`${styles.notification} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} size={24} />
      </div>
      <div className={styles.content}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <p className={styles.message}>{message}</p>
      </div>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

Notification.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  autoClose: PropTypes.bool,
  duration: PropTypes.number,
};

export default Notification;
```

**File 2: `src/hooks/useNotification.js`**
```javascript
import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};
```

**File 3: `src/components/Notification/Notification.module.css`**
```css
.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  min-width: 320px;
  max-width: 480px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  border-left: 4px solid #10b981;
}

/* ... (more styles) */
```

### PR Description Preview

```markdown
# Add Reusable Notification Component

## Summary
Created a fully-featured notification component with support for multiple types, auto-dismiss, and accessibility features.

## Features
- ✅ Four notification types (success, error, warning, info)
- ✅ Auto-dismiss with configurable duration
- ✅ Smooth animations
- ✅ Fully accessible (ARIA labels, keyboard navigation)
- ✅ Responsive design
- ✅ Custom hook for easy integration
- ✅ CSS modules for style isolation

## Usage Example
```javascript
import { useNotification } from './hooks/useNotification';

function App() {
  const { addNotification } = useNotification();
  
  const handleSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Your changes have been saved.'
    });
  };
  
  return <button onClick={handleSuccess}>Save</button>;
}
```

## Testing
All tests pass with 100% coverage.
```

---

## Example 3: Adding Database Integration

### Scenario
You need to add MongoDB integration to an existing Node.js application.

### Specification Text

```
Add MongoDB database integration to the Node.js application with the following requirements:

1. Set up MongoDB connection using Mongoose ODM
2. Create a database configuration module that:
   - Reads connection string from environment variables
   - Implements connection pooling
   - Handles connection errors gracefully
   - Provides connection status monitoring
   - Supports both development and production environments
3. Create a User model with the following schema:
   - username (String, required, unique, lowercase, trimmed)
   - email (String, required, unique, validated)
   - password (String, required, hashed with bcrypt)
   - firstName (String, required)
   - lastName (String, required)
   - createdAt (Date, default: now)
   - updatedAt (Date, auto-updated)
   - isActive (Boolean, default: true)
4. Add indexes for performance:
   - Unique index on email
   - Compound index on firstName and lastName
5. Implement pre-save hooks for:
   - Password hashing
   - Email normalization
   - Timestamp updates
6. Add instance methods:
   - comparePassword(candidatePassword)
   - getFullName()
   - toJSON() (exclude password from output)
7. Create a database seeding script for development
8. Add connection health check endpoint
9. Include comprehensive error handling
10. Update environment variables documentation
11. Add database migration strategy documentation
12. Follow the existing code structure and patterns

Ensure the implementation is production-ready with proper error handling, logging, and security best practices.
```

### Expected Repository Structure

```
my-node-app/
├── src/
│   ├── config/
│   │   └── server.js
│   ├── routes/
│   └── utils/
├── .env.example
└── package.json
```

### Generated Files Preview

**File 1: `src/config/database.js`**
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**File 2: `src/models/User.js`**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ firstName: 1, lastName: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Override toJSON to exclude password
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

**File 3: `scripts/seedDatabase.js`**
```javascript
const connectDB = require('../src/config/database');
const User = require('../src/models/User');

const seedUsers = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  },
  // ... more seed data
];

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Insert seed data
    await User.insertMany(seedUsers);
    console.log('Database seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
```

### PR Description Preview

```markdown
# Add MongoDB Database Integration

## Summary
Implemented complete MongoDB integration using Mongoose ODM with User model, connection management, and seeding scripts.

## Changes
- ✅ Database connection module with error handling
- ✅ User model with validation and hooks
- ✅ Password hashing with bcrypt
- ✅ Database indexes for performance
- ✅ Seeding script for development
- ✅ Health check endpoint
- ✅ Environment variable documentation

## Database Schema
### User Model
- username (unique, lowercase)
- email (unique, validated)
- password (hashed)
- firstName, lastName
- timestamps (auto-managed)
- isActive flag

## Setup Instructions
1. Add MongoDB URI to `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/myapp
   ```
2. Run database seeding:
   ```
   npm run seed
   ```

## Testing
- ✅ Connection establishment
- ✅ User CRUD operations
- ✅ Password hashing and comparison
- ✅ Validation rules
```

---

## Example 4: Implementing Authentication

### Scenario
Add JWT-based authentication to an Express.js API.

### Specification Text

```
Implement a complete JWT-based authentication system for the Express.js API with the following features:

1. User Registration:
   - Endpoint: POST /api/auth/register
   - Validate email format and password strength
   - Hash passwords using bcrypt
   - Create user in database
   - Return JWT token and user data
2. User Login:
   - Endpoint: POST /api/auth/login
   - Verify credentials
   - Generate JWT token with 24-hour expiration
   - Return token and user data
3. Token Refresh:
   - Endpoint: POST /api/auth/refresh
   - Accept refresh token
   - Generate new access token
   - Implement refresh token rotation
4. Logout:
   - Endpoint: POST /api/auth/logout
   - Invalidate refresh token
5. Authentication Middleware:
   - Verify JWT tokens
   - Attach user to request object
   - Handle expired tokens
   - Return appropriate error responses
6. Password Reset Flow:
   - Request reset: POST /api/auth/forgot-password
   - Reset password: POST /api/auth/reset-password/:token
   - Generate secure reset tokens
   - Send reset emails (mock for now)
7. Security Features:
   - Rate limiting on auth endpoints
   - Prevent brute force attacks
   - Secure token storage recommendations
   - CORS configuration
8. Environment Configuration:
   - JWT secret from environment
   - Token expiration times configurable
9. Comprehensive Tests:
   - Unit tests for all endpoints
   - Integration tests for auth flow
   - Security tests
10. Documentation:
    - API endpoint documentation
    - Authentication flow diagram
    - Security best practices

Follow the existing Express.js patterns, error handling conventions, and code structure in the repository.
```

### Generated Files Preview

**File 1: `src/routes/auth.js`**
```javascript
const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to auth routes
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }));

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
```

**File 2: `src/controllers/authController.js`**
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/tokenUtils');

exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ... (other controller methods)
```

**File 3: `src/middleware/auth.js`**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};
```

### PR Description Preview

```markdown
# Implement JWT-Based Authentication System

## Summary
Complete authentication system with registration, login, token refresh, password reset, and security features.

## Features
- ✅ User registration with validation
- ✅ Login with JWT token generation
- ✅ Token refresh mechanism
- ✅ Password reset flow
- ✅ Authentication middleware
- ✅ Rate limiting on auth endpoints
- ✅ Comprehensive error handling

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

## Security Features
- Password hashing with bcrypt (10 rounds)
- JWT tokens with 24-hour expiration
- Refresh token rotation
- Rate limiting (5 requests per 15 minutes)
- Secure token verification

## Environment Variables
Add to `.env`:
```
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Testing
All tests pass with 95% coverage.
```

---

## Example 5: Adding Unit Tests

### Scenario
Add comprehensive unit tests to an existing utility module.

### Specification Text

```
Add comprehensive unit tests for the existing utility functions in the utils/helpers.js module using Jest and the testing patterns already established in the repository. The tests should cover:

1. Test the formatDate function:
   - Valid date inputs in various formats
   - Invalid date inputs
   - Edge cases (null, undefined, empty string)
   - Different timezone handling
   - Custom format strings
2. Test the validateEmail function:
   - Valid email addresses
   - Invalid email formats
   - Edge cases (special characters, international domains)
   - Empty and null inputs
3. Test the calculatePercentage function:
   - Normal calculations
   - Division by zero
   - Negative numbers
   - Decimal precision
   - Rounding behavior
4. Test the debounce function:
   - Function is called after delay
   - Multiple rapid calls only trigger once
   - Cleanup on unmount
5. Test the deepClone function:
   - Simple objects
   - Nested objects
   - Arrays
   - Circular references
   - Special types (Date, RegExp)
6. Use proper test organization:
   - Describe blocks for each function
   - Clear test descriptions
   - Setup and teardown where needed
   - Mock timers for debounce tests
7. Achieve at least 95% code coverage
8. Follow the existing test structure and naming conventions
9. Add test utilities if needed
10. Update test documentation

Ensure tests are maintainable, readable, and follow Jest best practices.
```

### Generated Files Preview

**File: `tests/utils/helpers.test.js`**
```javascript
const {
  formatDate,
  validateEmail,
  calculatePercentage,
  debounce,
  deepClone,
} = require('../../src/utils/helpers');

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format valid date string correctly', () => {
      const date = '2024-01-15';
      const result = formatDate(date, 'MM/DD/YYYY');
      expect(result).toBe('01/15/2024');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'YYYY-MM-DD');
      expect(result).toBe('2024-01-15');
    });

    it('should return null for invalid dates', () => {
      expect(formatDate('invalid-date')).toBeNull();
      expect(formatDate(null)).toBeNull();
      expect(formatDate(undefined)).toBeNull();
    });

    it('should use default format when not specified', () => {
      const date = '2024-01-15';
      const result = formatDate(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
      expect(calculatePercentage(25, 200)).toBe(12.5);
      expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 2);
    });

    it('should handle division by zero', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(calculatePercentage(-50, 100)).toBe(-50);
      expect(calculatePercentage(50, -100)).toBe(-50);
    });

    it('should round to specified decimal places', () => {
      expect(calculatePercentage(1, 3, 0)).toBe(33);
      expect(calculatePercentage(1, 3, 2)).toBe(33.33);
      expect(calculatePercentage(1, 3, 4)).toBe(33.3333);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should only call function once for multiple rapid calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(1000);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('deepClone', () => {
    it('should clone simple objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('should clone nested objects', () => {
      const obj = { a: { b: { c: 1 } } };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned.a).not.toBe(obj.a);
      expect(cloned.a.b).not.toBe(obj.a.b);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, [3, 4]];
      const cloned = deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15');
      const obj = { date };
      const cloned = deepClone(obj);

      expect(cloned.date).toEqual(date);
      expect(cloned.date).not.toBe(date);
    });

    it('should handle null and undefined', () => {
      expect(deepClone(null)).toBeNull();
      expect(deepClone(undefined)).toBeUndefined();
    });
  });
});
```

### PR Description Preview

```markdown
# Add Comprehensive Unit Tests for Utility Functions

## Summary
Added complete test coverage for all utility functions in `utils/helpers.js` using Jest.

## Test Coverage
- ✅ formatDate: 12 test cases
- ✅ validateEmail: 8 test cases
- ✅ calculatePercentage: 8 test cases
- ✅ debounce: 6 test cases
- ✅ deepClone: 10 test cases

## Coverage Report
- Statements: 98%
- Branches: 96%
- Functions: 100%
- Lines: 98%

## Test Organization
- Clear describe blocks for each function
- Descriptive test names
- Proper setup/teardown for timer mocks
- Edge case coverage

## Running Tests
```bash
npm test utils/helpers.test.js
npm run test:coverage
```
```

---

## Example 6: Creating Documentation

### Scenario
Create comprehensive API documentation for an existing REST API.

### Specification Text

```
Create comprehensive API documentation for the existing REST API endpoints in the project. The documentation should include:

1. Overview section with:
   - API base URL
   - Authentication requirements
   - Rate limiting information
   - Response format standards
   - Error handling conventions
2. For each endpoint, document:
   - HTTP method and path
   - Description and purpose
   - Authentication requirements
   - Request parameters (path, query, body)
   - Request examples with curl and JavaScript
   - Response format and status codes
   - Error responses
   - Example responses (success and error)
3. Authentication section:
   - How to obtain tokens
   - Token format and usage
   - Token expiration and refresh
4. Error codes reference:
   - Standard error codes used
   - Error response format
   - Common error scenarios
5. Code examples:
   - JavaScript/Node.js
   - Python
   - cURL commands
6. Pagination documentation:
   - How pagination works
   - Query parameters
   - Response format
7. Filtering and sorting:
   - Available filters
   - Sort options
   - Query syntax
8. Webhooks (if applicable):
   - Available webhook events
   - Payload format
   - Security considerations
9. Changelog:
   - API version history
   - Breaking changes
   - Deprecation notices
10. Use Markdown format with proper formatting, code blocks, tables, and examples

Follow documentation best practices and ensure the documentation is beginner-friendly while being comprehensive for advanced users.
```

### Generated Files Preview

**File: `docs/API.md`**
```markdown
# API Documentation

## Overview

Base URL: `https://api.example.com/v1`

### Authentication
All API requests require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Rate Limiting
- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Endpoints

### Users

#### Get All Users
Retrieve a paginated list of users.

**Endpoint:** `GET /api/users`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| sort | string | No | Sort field (default: createdAt) |
| order | string | No | Sort order: asc or desc (default: desc) |
| search | string | No | Search in name and email |

**Example Request:**
```bash
curl -X GET "https://api.example.com/v1/api/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Create User
Create a new user account.

**Endpoint:** `POST /api/users`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- username: 3-30 characters, alphanumeric and underscore only
- email: Valid email format
- password: Minimum 8 characters, must include uppercase, lowercase, and number
- firstName/lastName: Required, 1-50 characters

**Example Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "User created successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists",
    "field": "email"
  }
}
```

## Authentication

### Login
Obtain JWT tokens for API access.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com"
    }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Code Examples

### JavaScript (Node.js)
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.example.com/v1',
  headers: {
    'Authorization': `Bearer ${YOUR_TOKEN}`
  }
});

// Get users
const users = await api.get('/api/users', {
  params: { page: 1, limit: 20 }
});

console.log(users.data);
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {YOUR_TOKEN}'
}

response = requests.get(
    'https://api.example.com/v1/api/users',
    headers=headers,
    params={'page': 1, 'limit': 20}
)

users = response.json()
print(users)
```

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- User management endpoints
- Authentication system
- Rate limiting implementation
```

---

## Tips for Writing Good Specifications

### 1. Be Specific and Detailed
❌ **Bad:** "Add a login feature"
✅ **Good:** "Add a login feature with email/password authentication, JWT tokens, password reset functionality, and rate limiting"

### 2. Include Context
- Mention existing patterns to follow
- Reference similar features in the codebase
- Specify the tech stack if relevant

### 3. Define Requirements Clearly
Use numbered lists or bullet points:
- What should be created
- How it should behave
- What edge cases to handle
- What tests to include

### 4. Specify File Locations
❌ **Bad:** "Add a new component"
✅ **Good:** "Add a new component in `src/components/` following the existing component structure"

### 5. Include Examples
Provide examples of:
- Input data
- Expected output
- API request/response formats
- UI behavior

### 6. Mention Testing Requirements
- Unit tests
- Integration tests
- Edge cases to cover
- Expected coverage percentage

### 7. Specify Documentation Needs
- Code comments
- API documentation
- README updates
- Usage examples

### 8. Define Success Criteria
What does "done" look like?
- All tests pass
- Code follows style guide
- Documentation is complete
- Feature works as described

### 9. Consider Edge Cases
Mention how to handle:
- Invalid input
- Error conditions
- Empty states
- Loading states
- Permission issues

### 10. Keep It Focused
- One feature per specification
- Break large features into smaller specs
- Avoid mixing unrelated changes

### Example Template

```
[Feature Name]

Context:
- Current state of the codebase
- Why this feature is needed
- Related existing features

Requirements:
1. [Specific requirement 1]
2. [Specific requirement 2]
3. [Specific requirement 3]

Technical Details:
- File locations
- Technologies to use
- Patterns to follow

Testing:
- Test cases to cover
- Expected coverage

Documentation:
- What to document
- Where to add docs

Success Criteria:
- [ ] Requirement 1 met
- [ ] Tests pass
- [ ] Documentation complete
```

---

## Best Practices Summary

1. **Length**: 100-500 words is ideal; too short lacks detail, too long becomes unfocused
2. **Structure**: Use headings, lists, and formatting for clarity
3. **Specificity**: Be explicit about requirements and expectations
4. **Context**: Reference existing code patterns and conventions
5. **Completeness**: Include testing, documentation, and error handling
6. **Clarity**: Write for someone unfamiliar with your mental model
7. **Examples**: Provide concrete examples of inputs and outputs
8. **Validation**: Specify validation rules and edge cases
9. **Integration**: Explain how the feature fits into existing code
10. **Review**: Read your spec as if you're implementing it—is everything clear?

---

**Ready to generate your first PR?** Use these examples as templates and adapt them to your specific needs!