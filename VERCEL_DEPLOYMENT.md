# 🚀 Vercel Deployment Guide for Unity Assets Frontend

## Prerequisites

1. **GitHub Repository**: Your frontend code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
3. **Backend URL**: Your Render backend URL (https://unity-assets-backend.onrender.com)

## Step 1: Prepare Your Frontend

### 1.1 Update Environment Variables

Create a `.env.local` file in your frontend root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://unity-assets-backend.onrender.com

# Optional: Analytics (if using)
# NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Stripe (if using payments)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 1.2 Update API Service Configuration

Make sure your `services/api.ts` (or similar) uses the environment variable:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your GitHub repository** (unity-assets-next-app)
5. **Configure the project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd unity-assets-next-app
   vercel
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. **Go to Settings → Environment Variables**
2. **Add the following variables**:

```
NEXT_PUBLIC_API_URL=https://unity-assets-backend.onrender.com
```

## Step 4: Configure Build Settings

### Build Configuration

Your `package.json` already has the correct scripts:
- ✅ `build`: `next build`
- ✅ `start`: `next start`
- ✅ `dev`: `next dev --turbopack`

### Vercel Configuration (Optional)

Create a `vercel.json` file in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

## Step 5: Deploy and Test

1. **Click "Deploy"** in Vercel
2. **Wait for build to complete**
3. **Test your application**:
   - Visit your Vercel URL
   - Test login with admin credentials:
     - Email: `admin@unityassets.com`
     - Password: `Admin@123`
   - Test admin panel access

## Step 6: Custom Domain (Optional)

1. **Go to Settings → Domains**
2. **Add your custom domain**
3. **Update CORS in backend**:
   - Update `CORS_ORIGIN` in Render to include your Vercel domain

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **API Connection Issues**:
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check CORS configuration in backend
   - Test API endpoints directly

3. **Environment Variables**:
   - Make sure all `NEXT_PUBLIC_*` variables are set
   - Redeploy after adding new variables

### Useful Commands:

```bash
# Test build locally
npm run build

# Test production build
npm run start

# Check environment variables
echo $NEXT_PUBLIC_API_URL
```

## Performance Optimization

1. **Enable Vercel Analytics** (free tier)
2. **Configure caching headers**
3. **Optimize images** with Next.js Image component
4. **Enable compression**

## Monitoring

- Use Vercel's built-in analytics
- Monitor build times and performance
- Set up alerts for build failures

## Security

1. **Environment Variables**: Never commit sensitive data
2. **API Keys**: Use `NEXT_PUBLIC_` prefix only for client-side variables
3. **CORS**: Configure properly in backend

## Next Steps After Deployment

1. **Test all features**:
   - User registration/login
   - Admin panel access
   - Asset upload/download
   - Payment integration (if applicable)

2. **Update backend CORS**:
   - Add your Vercel domain to `CORS_ORIGIN`

3. **Set up monitoring**:
   - Vercel Analytics
   - Error tracking

4. **Optimize performance**:
   - Image optimization
   - Code splitting
   - Caching strategies 