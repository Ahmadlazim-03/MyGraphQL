# Test GraphQL API dengan Device Tracking

## 🧪 Cara Testing dari Device Local

### 1️⃣ **Pastikan Server Running**
```powershell
# Di terminal pertama
pnpm dev
```

Server harus running di `http://localhost:3000`

---

### 2️⃣ **Test Login & Get Token**
```powershell
# Test login untuk mendapatkan auth token
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"ahmadlazim422@gmail.com\",\"password\":\"pembelajaranjarakjauh123\"}' `
  -c cookies.txt -v
```

**Expected Output:**
```
< Set-Cookie: auth_token=eyJhbGc....; HttpOnly; Path=/; SameSite=Lax
{"success":true,"message":"Login successful"}
```

---

### 3️⃣ **Test GraphQL Query dengan Device Info**
```powershell
# Send GraphQL query yang AKAN tercatat di monitoring
curl -X POST http://localhost:3000/api/graphql `
  -H "Content-Type: application/json" `
  -b cookies.txt `
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" `
  -d '{\"query\":\"query TestFromWindows { me { id email role } }\",\"operationName\":\"TestFromWindows\"}'
```

**Expected Output:**
```json
{"data":{"me":{"id":1,"email":"ahmadlazim422@gmail.com","role":"ADMIN"}}}
```

---

### 4️⃣ **Check Monitoring Dashboard**
```powershell
# Buka browser
start http://localhost:3000/dashboard
```

Atau manual: Buka browser → http://localhost:3000/dashboard

**Yang Harus Terlihat:**
- ✅ Request baru di tabel "Recent Requests"
- ✅ Device: **Chrome • Desktop**
- ✅ OS: **Windows 10/11**
- ✅ Location: **🏠 Localhost** (karena local)
- ✅ IP: **Unknown** atau **127.0.0.1**

---

## 🖥️ Testing dari Mac Teman Anda

### Option A: Server di Windows, Mac sebagai Client

#### 1. **Pastikan Keduanya di Network yang Sama** (WiFi/LAN)

#### 2. **Cek IP Address Windows Anda**
```powershell
# Di Windows
ipconfig

# Cari "IPv4 Address" di adapter WiFi/Ethernet
# Contoh: 192.168.1.100
```

#### 3. **Expose Server ke Network**

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0"
  }
}
```

Atau jalankan langsung:
```powershell
pnpm next dev -H 0.0.0.0
```

#### 4. **Dari Mac Teman, Jalankan:**
```bash
# Replace 192.168.1.100 dengan IP Windows Anda
IP_SERVER="192.168.1.100"

# Login
curl -X POST http://$IP_SERVER:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmadlazim422@gmail.com","password":"pembelajaranjarakjauh123"}' \
  -c cookies.txt

# Send GraphQL Query
curl -X POST http://$IP_SERVER:3000/api/graphql \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -d '{"query":"query TestFromMac { me { id email } }","operationName":"TestFromMac"}'
```

#### 5. **Cek Dashboard di Windows**
Buka: http://localhost:3000/dashboard

**Yang HARUS Terlihat:**
- ✅ Device: **Chrome • Desktop**
- ✅ OS: **macOS 10.15** (atau versi lain)
- ✅ Location: **🌍 Indonesia** (jika dapat detect IP)
- ✅ IP: **192.168.1.xxx** (IP local Mac)

---

### Option B: Gunakan ngrok (Untuk Test dari Internet)

#### 1. **Install ngrok**
```powershell
# Download dari https://ngrok.com/download
# Atau via chocolatey:
choco install ngrok
```

#### 2. **Expose Server**
```powershell
# Terminal 1: Start server
pnpm dev

# Terminal 2: Expose dengan ngrok
ngrok http 3000
```

**Output:**
```
Forwarding: https://xxxx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:3000
```

#### 3. **Share URL ke Teman**
Kirim URL ngrok (contoh: `https://a1b2-114-79-x-x.ngrok-free.app`)

#### 4. **Dari Mac Teman:**
```bash
# Ganti dengan URL ngrok Anda
NGROK_URL="https://a1b2-114-79-x-x.ngrok-free.app"

# Login
curl -X POST $NGROK_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmadlazim422@gmail.com","password":"pembelajaranjarakjauh123"}' \
  -c cookies.txt

# Send GraphQL Query
curl -X POST $NGROK_URL/api/graphql \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Safari/17.0" \
  -d '{"query":"query TestFromMac { me { id email } }","operationName":"TestFromMacSafari"}'
```

**Atau buka di Browser Mac:**
1. Buka: `https://xxxx.ngrok-free.app/dashboard`
2. Login dengan credentials
3. Refresh dashboard
4. Lihat info device & location

---

## 🎯 Yang Akan Terlihat di Dashboard

### Request dari Windows (Local):
```
Time: 4:37:54 PM
Status: 200
Duration: 12ms
Device: Chrome • Desktop
        Windows 10/11
Location: 🏠 Localhost
IP: Unknown
Operation: TestFromWindows
```

### Request dari Mac (Network/ngrok):
```
Time: 4:38:22 PM
Status: 200
Duration: 45ms
Device: Safari • Desktop
        macOS 10.15
Location: 🇮🇩 Jakarta (jika via ngrok)
          🌍 Unknown (jika local network)
IP: 192.168.1.105 (local) atau 114.79.x.x (ngrok)
Operation: TestFromMacSafari
```

---

## 📱 Bonus: Test dari Mobile

### Jika Teman Punya iPhone/Android:

#### Via Network Local:
```bash
# Di browser mobile, buka:
http://192.168.1.100:3000/dashboard
```

#### Via ngrok:
```bash
# Di browser mobile, buka:
https://xxxx.ngrok-free.app/dashboard
```

**Dashboard akan menampilkan:**
- Device: **Safari • Mobile** (iPhone)
- OS: **iOS 17**
- Location: **🇮🇩 Jakarta**

---

## ⚠️ Troubleshooting

### Windows Firewall Blocking:
```powershell
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

### Mac Can't Connect:
1. Pastikan kedua device di WiFi yang sama
2. Ping dari Mac: `ping 192.168.1.100`
3. Test port: `telnet 192.168.1.100 3000`

### Dashboard Tidak Update:
1. Clear monitoring: `pnpm dlx tsx scripts/clear-monitoring.ts`
2. Refresh browser (Ctrl+Shift+R)
3. Check auto-refresh toggle ON

---

## ✅ Quick Test (Simplified)

### Single Command Test:
```powershell
# Login dan langsung query
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"ahmadlazim422@gmail.com\",\"password\":\"pembelajaranjarakjauh123\"}' -c cookies.txt; curl -X POST http://localhost:3000/api/graphql -H "Content-Type: application/json" -b cookies.txt -d '{\"query\":\"query { me { email } }\"}'
```

Lalu buka dashboard: http://localhost:3000/dashboard

---

Pilih salah satu cara di atas sesuai kebutuhan! 🚀
