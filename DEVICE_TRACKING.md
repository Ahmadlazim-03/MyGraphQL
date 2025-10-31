# Device & Location Tracking

## 🎯 Features Added

Dashboard monitoring sekarang melacak informasi lengkap tentang setiap request:

### 1. **Device Information**
- ✅ **Browser**: Chrome, Firefox, Edge, Safari, Opera
- ✅ **Operating System**: Windows 10/11, macOS, Linux, Android, iOS
- ✅ **Device Type**: Desktop, Mobile, Tablet

### 2. **Location Information**
- ✅ **Country**: Detected via IP geolocation
- ✅ **City**: City-level location tracking
- ✅ **Flag Icon**: Visual country indicator (🇮🇩, 🇺🇸, 🌍, 🏠)

### 3. **Additional Tracking**
- ✅ **IP Address**: Real client IP (with X-Forwarded-For support)
- ✅ **User Agent**: Full browser string
- ✅ **Timestamp**: Exact request time

## 📊 Dashboard Display

### Recent Requests Table Columns:
| Column | Description | Example |
|--------|-------------|---------|
| **Time** | Request timestamp | 4:37:54 PM |
| **Status** | HTTP status code | 200 (green), 500 (red) |
| **Duration** | Response time | 12ms (fast), 500ms (slow) |
| **Device** | Browser + Device Type | Chrome • Desktop |
|  | Operating System | Windows 10/11 |
| **Location** | Country flag + City | 🇮🇩 Jakarta |
| **IP Address** | Client IP | 114.79.xx.xx |
| **Operation** | GraphQL operation | TestQuery |

## 🔧 Implementation Details

### User Agent Parsing
```typescript
// lib/device-info.ts
export function parseUserAgent(userAgent: string | null) {
  // Detects:
  // - Browser: Chrome, Edge, Firefox, Safari, Opera
  // - OS: Windows 10/11, macOS, Linux, Android, iOS
  // - Device: Desktop, Mobile, Tablet
}
```

### IP Geolocation
```typescript
// Using ip-api.com (free tier)
export async function getLocationFromIP(ipAddress: string) {
  // Returns: { country, city }
  // Free tier: 45 requests/minute
  // Timeout: 2 seconds
}
```

### Complete Device Info Extraction
```typescript
export async function extractDeviceInfo(request: Request) {
  const ipAddress = request.headers.get('x-forwarded-for')
  const userAgent = request.headers.get('user-agent')
  
  const { browser, os, device } = parseUserAgent(userAgent)
  const { country, city } = await getLocationFromIP(ipAddress)
  
  return { ipAddress, userAgent, browser, os, device, country, city }
}
```

## 🌍 IP Geolocation API

### Provider: ip-api.com
- **Free Tier**: 45 requests/minute
- **No API Key**: Required
- **Data**: Country, City, Region, ISP
- **Timeout**: 2 seconds (non-blocking)
- **Fallback**: Returns 'Unknown' if lookup fails

### Special Cases:
- **Localhost** (127.0.0.1, ::1) → 🏠 Local • Localhost
- **Private IPs** → Location lookup skipped
- **Timeout/Error** → Defaults to 'Unknown'

## 📱 Supported Browsers

### Desktop:
- ✅ Chrome
- ✅ Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Mobile:
- ✅ Chrome Mobile
- ✅ Safari Mobile (iOS)
- ✅ Firefox Mobile
- ✅ Samsung Internet

### Operating Systems:
- ✅ Windows (7, 8, 10, 11)
- ✅ macOS (with version)
- ✅ Linux
- ✅ Android (with version)
- ✅ iOS

## 🎨 UI Enhancements

### Device Column:
```
Chrome • Desktop
Windows 10/11
```

### Location Column:
```
🇮🇩 Jakarta
🇺🇸 New York
🏠 Localhost
🌍 Unknown
```

### Country Flags:
- 🇮🇩 Indonesia
- 🇺🇸 United States
- 🏠 Local (localhost)
- 🌍 Other countries

## ⚡ Performance Considerations

### Non-Blocking Location Lookup:
```typescript
// Location lookup runs asynchronously
// Doesn't block main request processing
const location = await getLocationFromIP(ipAddress)
```

### Timeout Protection:
```typescript
fetch(url, {
  signal: AbortSignal.timeout(2000) // 2 second max
})
```

### Error Handling:
```typescript
try {
  const location = await getLocationFromIP(ip)
} catch (error) {
  // Silently fail with 'Unknown'
  // Doesn't break the app
}
```

## 🧪 Testing

### Test Script:
```bash
pnpm dlx tsx scripts/test-device-info.ts
```

### Manual Testing:
1. Open dashboard: http://localhost:3000/dashboard
2. Send GraphQL query from different devices/browsers
3. Check "Recent Requests" table
4. Verify Device, Location, and IP columns

### What Gets Tracked:
✅ External GraphQL queries (mahasiswa, alumni, etc.)
❌ Monitoring queries (monitoringMetrics, recentRequests, etc.)
❌ Internal dashboard polling

## 📊 Data Storage

### MongoDB Schema:
```javascript
{
  method: "POST",
  duration: 12,
  status: 200,
  query: "query { ... }",
  operationName: "GetUsers",
  timestamp: ISODate("2025-10-31T..."),
  
  // Device Info
  ipAddress: "114.79.xx.xx",
  userAgent: "Mozilla/5.0 ...",
  browser: "Chrome",
  os: "Windows 10/11",
  device: "Desktop",
  
  // Location Info
  country: "Indonesia",
  city: "Jakarta"
}
```

## 🔒 Privacy Considerations

### IP Addresses:
- Only last 2 octets shown in UI (for privacy)
- Full IP stored in database (for analytics)
- Consider GDPR compliance for EU users

### Geolocation:
- City-level accuracy (not precise)
- No personal identification
- Fallback to 'Unknown' if unavailable

### User Agent:
- Standard browser info only
- No fingerprinting techniques
- No tracking across sessions

## 🚀 Future Improvements

### 1. Advanced Analytics:
- Request distribution by country
- Popular browsers chart
- Device type breakdown

### 2. Better Geolocation:
- Paid API for higher accuracy (IPInfo, MaxMind)
- Region/ISP information
- Timezone detection

### 3. Enhanced Privacy:
- IP anonymization option
- GDPR compliance mode
- User consent tracking

### 4. Real-time Map:
- Live request map
- Geographic heatmap
- Request clustering

## 📈 Use Cases

### Security:
- Detect unusual geographic patterns
- Identify potential abuse
- Monitor access locations

### Analytics:
- Understand user demographics
- Optimize for popular devices
- Track browser compatibility

### Performance:
- Analyze latency by region
- Optimize CDN routing
- Device-specific optimizations

## ✅ Summary

Your GraphQL monitoring dashboard now has **complete visibility** into:
- 📱 What devices are accessing your API
- 🌍 Where requests are coming from
- 💻 Browser and OS information
- 📡 IP addresses and timestamps

All displayed in a beautiful, easy-to-read table format! 🎉
