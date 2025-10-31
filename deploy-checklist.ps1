Write-Host "Vercel Deployment Checklist" -ForegroundColor Cyan
Write-Host "==========================`n" -ForegroundColor Cyan

Write-Host "Files created for Vercel deployment:" -ForegroundColor Green
Write-Host "  - vercel.json" -ForegroundColor White
Write-Host "  - .vercelignore" -ForegroundColor White
Write-Host "  - .env.example" -ForegroundColor White
Write-Host "  - DEPLOY_VERCEL.md`n" -ForegroundColor White

Write-Host "Before deploying to Vercel:`n" -ForegroundColor Yellow

Write-Host "1. Commit and Push to GitHub:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m `"Ready for Vercel deployment`"" -ForegroundColor White
Write-Host "   git push origin main`n" -ForegroundColor White

Write-Host "2. Prepare Environment Variables:" -ForegroundColor Cyan
Write-Host "   You will need these in Vercel:" -ForegroundColor White
Write-Host "   - DATABASE_URL (PostgreSQL)" -ForegroundColor White
Write-Host "   - MONGODB_URI (MongoDB)" -ForegroundColor White
Write-Host "   - JWT_SECRET (Generate new!)" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_APP_URL (Your Vercel URL)`n" -ForegroundColor White

Write-Host "3. Deploy to Vercel:" -ForegroundColor Cyan
Write-Host "   a. Go to: https://vercel.com/new" -ForegroundColor White
Write-Host "   b. Import your GitHub repository" -ForegroundColor White
Write-Host "   c. Add environment variables" -ForegroundColor White
Write-Host "   d. Click Deploy!`n" -ForegroundColor White

Write-Host "Full instructions: Read DEPLOY_VERCEL.md`n" -ForegroundColor Green

Write-Host "Generate JWT Secret:" -ForegroundColor Yellow
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "   $secret" -ForegroundColor Green
Write-Host "   (Copy this for Vercel JWT_SECRET)`n" -ForegroundColor Gray

Write-Host "Your app is ready for deployment!" -ForegroundColor Green
