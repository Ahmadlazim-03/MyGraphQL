# 🚀 Deploy to Vercel - Step by Step Guide

## Prerequisites
- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] PostgreSQL database (Railway/Vercel Postgres/Supabase)
- [ ] MongoDB database (MongoDB Atlas/Railway)

---

## 📋 Deployment Steps

### 1️⃣ Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/MyGraphQL.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Import to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Project"**
3. Select your GitHub repository: `MyGraphQL`
4. Click **"Import"**

---

### 3️⃣ Configure Environment Variables

In Vercel dashboard, add these environment variables:

#### Required Variables:

| Variable | Value | Where to get |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `MONGODB_URI` | `mongodb://...` | Your MongoDB connection string |
| `JWT_SECRET` | Random secret (min 32 chars) | Generate with script below |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel domain |
| `NODE_ENV` | `production` | Just type "production" |

#### Generate JWT Secret:
```bash
# Run this in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use as `JWT_SECRET`

---

### 4️⃣ Deploy Settings

**Framework Preset:** Next.js
**Build Command:** `prisma generate && next build`
**Output Directory:** `.next`
**Install Command:** `pnpm install`
**Root Directory:** `./`

---

### 5️⃣ Deploy!

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at: `https://your-app.vercel.app`

---

## 🔧 Post-Deployment Setup

### 1. Run Database Migrations

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy --schema ./prisma/schema.prisma
```

### 2. Create Initial User

Access your app and create first admin user via API:

```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmadlazim422@gmail.com","password":"pembelajaranjarakjauh123"}'
```

Or update `user-credentials.json` manually in Vercel console.

---

## 🌍 Custom Domain (Optional)

1. Go to Vercel Project → **Settings** → **Domains**
2. Add your custom domain: `api.yourdomain.com`
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## 📊 Monitoring

### Vercel Analytics
Already included via `@vercel/analytics`

### Database Monitoring
- PostgreSQL: Use Railway/Vercel dashboard
- MongoDB: Use MongoDB Atlas dashboard

### GraphQL Monitoring
Access at: `https://your-app.vercel.app/dashboard`

---

## ⚙️ Environment Variables Reference

### Production Setup:

```env
# PostgreSQL (Example: Railway)
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:1234/railway"

# MongoDB (Example: MongoDB Atlas)
MONGODB_URI="mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/graphql?retryWrites=true&w=majority"

# JWT Secret (IMPORTANT: Generate new for production!)
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

# App URL (Your Vercel domain)
NEXT_PUBLIC_APP_URL="https://my-graphql.vercel.app"

# Environment
NODE_ENV="production"
```

---

## 🔒 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong passwords for databases
- [ ] Enable MongoDB IP whitelist (Atlas)
- [ ] Update CORS settings if needed
- [ ] Change default user credentials
- [ ] Enable HTTPS only
- [ ] Set secure cookie options in production

---

## 🐛 Troubleshooting

### Build Fails with Prisma Error
**Solution:** Make sure `DATABASE_URL` is set in Vercel environment variables

### MongoDB Connection Error
**Solution:** Whitelist Vercel IPs in MongoDB Atlas Network Access:
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (or specific Vercel IPs)

### JWT Verification Fails
**Solution:** Ensure `JWT_SECRET` is exactly the same across all environments

### "Cannot find module" Error
**Solution:** Run `pnpm install` locally and push updated `pnpm-lock.yaml`

### Middleware Errors
**Solution:** Middleware runs in Edge Runtime - ensure no Node.js-specific APIs

---

## 🔄 Redeploy

### Automatic (Recommended)
Push to GitHub main branch:
```bash
git add .
git commit -m "Update features"
git push origin main
```
Vercel auto-deploys!

### Manual
```bash
vercel --prod
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

---

## ✅ Deployment Complete!

Your GraphQL API is now live at:
- **Dashboard:** https://your-app.vercel.app/dashboard
- **GraphQL API:** https://your-app.vercel.app/api/graphql
- **Health Check:** https://your-app.vercel.app/api/status

Happy coding! 🎉
