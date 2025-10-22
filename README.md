# Vercel Project

This is a Next.js project configured for deployment on Vercel.

## Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Push this repository to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and configure everything
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Local Development

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/public` - Static assets
- `vercel.json` - Vercel configuration

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
