# Deploying to Vercel

Your Next.js project is now configured and ready to deploy to Vercel! Follow one of the methods below:

## Method 1: GitHub Integration (Easiest - Recommended)

This is the simplest way to connect your project to Vercel with automatic deployments:

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Setup Next.js project for Vercel"
   git push origin cursor/connect-project-to-vercel-ac48
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Select this repository
   - Vercel will auto-detect Next.js configuration
   - Click "Deploy"

3. **Automatic Deployments**:
   - Every push to your main branch will trigger a production deployment
   - Pull requests get preview deployments automatically

## Method 2: Vercel CLI

For direct deployment from your terminal:

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy to Preview**:
   ```bash
   cd /workspace
   vercel
   ```
   Follow the prompts to link your project.

3. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Method 3: Import from Git URL

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Paste your repository URL
4. Configure and deploy

## Project Configuration

Your project includes:
- ✅ `vercel.json` - Vercel build configuration
- ✅ `package.json` - Dependencies and scripts
- ✅ Next.js App Router setup
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling

## Environment Variables (if needed)

If you need environment variables:

1. **Via Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add your variables

2. **Via CLI**:
   ```bash
   vercel env add VARIABLE_NAME
   ```

3. **Local Development**:
   Create a `.env.local` file (already in .gitignore):
   ```
   NEXT_PUBLIC_API_URL=your_value_here
   ```

## Custom Domain

After deployment:
1. Go to your project dashboard on Vercel
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## What Happens on Deployment

1. Vercel installs dependencies (`npm install`)
2. Runs build command (`npm run build`)
3. Deploys the `.next` output directory
4. Provides you with a live URL

## Troubleshooting

- **Build fails**: Check build logs in Vercel dashboard
- **Environment variables**: Ensure all required variables are set
- **Custom configuration**: Edit `vercel.json` as needed

## Next Steps

1. Push your code to GitHub
2. Connect the repository to Vercel
3. Your app will be live at `https://your-project.vercel.app`

Happy deploying! 🚀
