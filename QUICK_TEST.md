# 🚀 Quick Test Commands - Device Tracking

## ✅ Test dari Windows (Device Anda Sendiri)

### Option 1: PowerShell Script (Recommended)
```powershell
.\test-local.ps1
```

### Option 2: Manual Commands
```powershell
# Login
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"ahmadlazim422@gmail.com\",\"password\":\"pembelajaranjarakjauh123\"}' `
  -c cookies.txt

# Send Query
curl -X POST http://localhost:3000/api/graphql `
  -H "Content-Type: application/json" `
  -b cookies.txt `
  -d '{\"query\":\"query { me { email } }\"}'

# Open Dashboard
start http://localhost:3000/dashboard
```

---

## 🍎 Test dari Mac Teman

### Setup di Windows (Anda):
```powershell
# 1. Cek IP Windows
ipconfig
# Catat IPv4 Address, contoh: 192.168.1.100

# 2. Start server dengan expose ke network
pnpm next dev -H 0.0.0.0

# 3. Allow firewall (jika perlu)
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

### Di Mac Teman:
```bash
# Download script
curl -O https://raw.githubusercontent.com/.../test-from-mac.sh

# Edit IP_SERVER (ganti dengan IP Windows Anda)
nano test-from-mac.sh
# Ubah: IP_SERVER="192.168.1.100"

# Jalankan
chmod +x test-from-mac.sh
./test-from-mac.sh
```

### Atau Manual (Mac):
```bash
IP="192.168.1.100"  # Ganti dengan IP Windows

# Login
curl -X POST http://$IP:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmadlazim422@gmail.com","password":"pembelajaranjarakjauh123"}' \
  -c cookies.txt

# Query
curl -X POST http://$IP:3000/api/graphql \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15" \
  -d '{"query":"query { me { email } }"}'

# Buka Dashboard
open http://$IP:3000/dashboard
```

---

## 🌐 Expected Results

### Request dari Windows (Local):
```
Device: Chrome • Desktop
OS: Windows 10/11
Location: 🏠 Localhost
IP: Unknown
```

### Request dari Mac (Network):
```
Device: Safari • Desktop
OS: macOS 10.15 (atau versi Mac teman)
Location: 🌍 Unknown (local network)
IP: 192.168.1.xxx (IP Mac)
```

---

## 🔧 Troubleshooting

### Mac tidak bisa connect:
```bash
# Test ping
ping 192.168.1.100

# Test port
telnet 192.168.1.100 3000
# atau
nc -zv 192.168.1.100 3000
```

### Dashboard tidak update:
```powershell
# Clear monitoring data
pnpm dlx tsx scripts/clear-monitoring.ts

# Restart server
# Ctrl+C, lalu pnpm dev
```

### Request tidak muncul:
- Toggle auto-refresh ON di dashboard
- Click tombol "Refresh" manual
- Pastikan query BUKAN monitoring query (me, monitoringMetrics, dll)

---

## 📱 Bonus: Test dari Mobile

### Via Browser:
```
http://192.168.1.100:3000/dashboard
```

Login → Lihat Recent Requests → Akan muncul:
- Device: Safari • Mobile (iOS) atau Chrome • Mobile (Android)
- OS: iOS 17 atau Android 14
- Location: Based on IP

---

## ✅ Checklist

- [ ] Server running: `pnpm dev` atau `pnpm next dev -H 0.0.0.0`
- [ ] Firewall allowed (jika perlu)
- [ ] Kedua device di WiFi yang sama
- [ ] IP Windows sudah dicatat
- [ ] Test dari Windows berhasil
- [ ] Test dari Mac berhasil
- [ ] Dashboard menampilkan device info berbeda

---

Selamat testing! 🎉
