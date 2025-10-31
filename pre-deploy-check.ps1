# Pre-Deployment Checklist Script
Write-Host "🚀 Vercel Deployment Pre-Flight Check" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Check 1: Node modules
Write-Host "1️⃣  Checking node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules missing - run: pnpm install" -ForegroundColor Red
    $errors++
}

# Check 2: Prisma Client
Write-Host "`n2️⃣  Checking Prisma..." -ForegroundColor Yellow
if (Test-Path "node_modules/.prisma/client") {
    Write-Host "   ✅ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Prisma Client not generated - will be generated on build" -ForegroundColor Yellow
    $warnings++
}

# Check 3: Environment files
Write-Host "`n3️⃣  Checking environment files..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local exists" -ForegroundColor Green
    
    # Check required env vars
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "DATABASE_URL") {
        Write-Host "   ✅ DATABASE_URL found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ DATABASE_URL missing" -ForegroundColor Red
        $errors++
    }
    
    if ($envContent -match "MONGODB_URI") {
        Write-Host "   ✅ MONGODB_URI found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MONGODB_URI missing" -ForegroundColor Red
        $errors++
    }
    
    if ($envContent -match "JWT_SECRET") {
        Write-Host "   ✅ JWT_SECRET found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ JWT_SECRET missing" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   ❌ .env.local missing" -ForegroundColor Red
    $errors++
}

# Check 4: Build test
Write-Host "`n4️⃣  Testing build..." -ForegroundColor Yellow
Write-Host "   Running: pnpm build" -ForegroundColor Gray
try {
    $buildOutput = pnpm build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Build failed" -ForegroundColor Red
        Write-Host "   Error: $buildOutput" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ❌ Build error: $_" -ForegroundColor Red
    $errors++
}

# Check 5: Git status
Write-Host "`n5️⃣  Checking Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✅ Git repository initialized" -ForegroundColor Green
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "   ⚠️  Uncommitted changes detected" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "   ✅ Working tree clean" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  Not a git repository - run: git init" -ForegroundColor Yellow
    $warnings++
}

# Check 6: Required files
Write-Host "`n6️⃣  Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "next.config.mjs",
    "tsconfig.json",
    "prisma/schema.prisma",
    "vercel.json",
    ".env.example"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing" -ForegroundColor Red
        $errors++
    }
}

# Check 7: user-credentials.json
Write-Host "`n7️⃣  Checking user credentials..." -ForegroundColor Yellow
if (Test-Path "user-credentials.json") {
    Write-Host "   ✅ user-credentials.json exists" -ForegroundColor Green
    Write-Host "   💡 Remember to set initial credentials in Vercel" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  user-credentials.json missing - will use defaults" -ForegroundColor Yellow
    $warnings++
}

# Summary
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

if ($errors -gt 0) {
    Write-Host "Errors:   $errors" -ForegroundColor Red
} else {
    Write-Host "Errors:   $errors" -ForegroundColor Green
}

if ($warnings -gt 0) {
    Write-Host "Warnings: $warnings" -ForegroundColor Yellow
} else {
    Write-Host "Warnings: $warnings" -ForegroundColor Green
}

Write-Host ""

if ($errors -eq 0) {
    Write-Host "✅ Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Push to GitHub: git push origin main" -ForegroundColor White
    Write-Host "2. Go to https://vercel.com/new" -ForegroundColor White
    Write-Host "3. Import your repository" -ForegroundColor White
    Write-Host "4. Add environment variables (see DEPLOY_VERCEL.md)" -ForegroundColor White
    Write-Host "5. Deploy!" -ForegroundColor White
} else {
    Write-Host "❌ Fix errors before deploying" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Run this script again after fixes" -ForegroundColor Cyan
}

Write-Host ""
