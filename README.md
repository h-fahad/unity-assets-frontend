# Unity Assets Frontend

A modern Next.js frontend for Unity asset marketplace with subscription management, asset browsing, and admin panel.

## 🚀 Features

- **Modern UI** - Clean, responsive design with Tailwind CSS
- **User Authentication** - Login, register, and role-based access
- **Asset Browsing** - Search, filter, and view Unity assets
- **Subscription Management** - View plans, track downloads, manage subscriptions
- **Admin Panel** - Upload assets, manage users, create subscription plans
- **Download Tracking** - Real-time download limits and usage monitoring
- **Mobile Responsive** - Works seamlessly on all device sizes

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Backend API** - Unity Assets Backend must be running

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd unity-assets-next-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME="Unity Assets Marketplace"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important:** Make sure the backend API is running on `http://localhost:3001`

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 5. Build for Production

```bash
# Build the application
npm run build
# or
yarn build

# Start production server
npm run start
# or
yarn start
```

## 🎯 Usage Guide

### For Regular Users

1. **Register/Login**
   - Go to `/register` to create an account
   - Use `/signin` to login with existing credentials

2. **Browse Assets**
   - View all available Unity assets on the home page
   - Use filters to find specific asset types
   - Click on assets to view details

3. **Manage Subscriptions**
   - Visit `/packages` to view available plans
   - Subscribe to plans to unlock downloads
   - Track your daily download limits

4. **Download Assets**
   - Click download buttons on asset pages
   - Monitor your remaining downloads
   - Check download history in `/account`

### For Administrators

1. **Admin Access**
   - Login with admin credentials
   - Access admin-only routes automatically

2. **Upload Assets**
   - Go to `/admin/upload`
   - Fill in asset details
   - Upload thumbnail (image/video) and .unitypackage file
   - Submit to publish asset

3. **Manage Subscriptions**
   - Create new subscription plans
   - Set daily download limits
   - Assign subscriptions to users

## 📖 Pages & Routes

### Public Routes
- `/` - Home page with asset listing
- `/signin` - User login
- `/register` - User registration
- `/asset/[id]` - Individual asset details

### Protected Routes (Requires Authentication)
- `/account` - User profile and download history
- `/packages` - Available subscription plans

### Admin Routes (Admin Only)
- `/admin` - Admin dashboard
- `/admin/upload` - Asset upload form

## 🎨 UI Components

Built with modern React components and Tailwind CSS:

- **AssetCard** - Display asset information
- **DownloadButton** - Handle asset downloads with limit checking
- **Header** - Navigation with auth status
- **Footer** - Site footer with links
- **PlanCard** - Subscription plan display
- **AssetFilters** - Search and filter assets
- **Carousel** - Featured assets display

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Type checking
npm run type-check
```

## 🚨 Common Issues & Solutions

### 1. API Connection Issues

**Problem**: `Failed to fetch` or network errors

**Solutions**:
- Ensure backend is running on `http://localhost:3001`
- Check NEXT_PUBLIC_API_URL in `.env.local`
- Verify CORS is configured in backend
- Check browser network tab for detailed errors

### 2. Authentication Issues

**Problem**: User can't login or gets unauthorized errors

**Solutions**:
- Clear browser localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify backend auth endpoints are working
- Ensure user exists in database

### 3. Image Loading Issues

**Problem**: `Invalid src prop` or images not loading

**Solutions**:
- Update `next.config.ts` with allowed image domains
- Check if backend is serving static files correctly
- Verify image paths in database
- Test image URLs directly in browser

### 4. Build Errors

**Problem**: TypeScript or build errors

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Fix linting issues
npm run lint --fix
```

### 5. Styling Issues

**Problem**: Tailwind CSS not working or styles not applied

**Solutions**:
- Check `tailwind.config.js` configuration
- Ensure CSS imports are correct in `globals.css`
- Clear browser cache and hard refresh
- Verify class names are correct

### 6. State Management Issues

**Problem**: User state not persisting or updating

**Solutions**:
- Check Zustand store implementation
- Verify localStorage persistence
- Clear browser data and test fresh
- Check state updates in React DevTools

### 7. Route Protection Issues

**Problem**: Protected routes accessible without auth

**Solutions**:
- Verify authentication checks in components
- Check JWT token validation
- Ensure router redirects work correctly
- Test with different user roles

## 📱 Mobile Responsiveness

The application is designed to work on all screen sizes:

- **Desktop** - Full featured experience
- **Tablet** - Optimized layout with touch support
- **Mobile** - Compact design with easy navigation

Test responsiveness:
```bash
# Use Chrome DevTools device simulation
# Or test on actual devices
# Check common breakpoints: sm, md, lg, xl
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env.local` files
2. **API Keys**: Store sensitive data in environment variables
3. **Authentication**: Tokens stored in localStorage (consider httpOnly cookies for production)
4. **HTTPS**: Use HTTPS in production
5. **Content Security Policy**: Configure CSP headers

## 📁 Project Structure

```
unity-assets-next-app/
├── app/                        # Next.js app directory
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── signin/                # Auth pages
│   ├── register/
│   ├── account/               # User pages
│   ├── subscriptions/
│   ├── admin/                 # Admin pages
│   └── asset/[id]/            # Dynamic asset pages
├── components/                 # Reusable components
│   ├── ui/                    # UI primitives
│   ├── AssetCard.tsx
│   ├── Header.tsx
│   └── ...
├── lib/                       # Utilities
│   ├── auth.ts               # Auth helpers
│   ├── axios.ts              # API client
│   └── utils.ts              # General utilities
├── services/                  # API services
│   ├── assetService.ts
│   ├── userService.ts
│   └── subscriptionService.ts
├── store/                     # State management
│   └── useUserStore.ts
├── types/                     # TypeScript types
├── styles/                    # Global styles
├── public/                    # Static assets
├── next.config.ts             # Next.js configuration
└── README.md                  # This file
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms
- **Netlify**: Connect GitHub repo and deploy
- **Railway**: `railway login && railway deploy`
- **Docker**: Use provided Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
1. Check this README's troubleshooting section
2. Review the [Issues](../../issues) page
3. Create a new issue with detailed information

---

**Happy coding! 🚀**
