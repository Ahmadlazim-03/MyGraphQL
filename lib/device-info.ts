/**
 * Parse User Agent string to extract device information
 */
export function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown'
    }
  }

  // Detect Browser
  let browser = 'Unknown'
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome'
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge'
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera'
  }

  // Detect OS
  let os = 'Unknown'
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows 10/11'
  } else if (userAgent.includes('Windows NT 6.3')) {
    os = 'Windows 8.1'
  } else if (userAgent.includes('Windows NT 6.2')) {
    os = 'Windows 8'
  } else if (userAgent.includes('Windows NT 6.1')) {
    os = 'Windows 7'
  } else if (userAgent.includes('Windows')) {
    os = 'Windows'
  } else if (userAgent.includes('Mac OS X')) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/)
    os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('Android')) {
    const match = userAgent.match(/Android (\d+)/)
    os = match ? `Android ${match[1]}` : 'Android'
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS'
  }

  // Detect Device Type
  let device = 'Desktop'
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    device = 'Mobile'
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet'
  }

  return { browser, os, device }
}

/**
 * Get location info from IP address using free IP geolocation API
 */
export async function getLocationFromIP(ipAddress: string): Promise<{ country: string; city: string }> {
  // Skip for localhost/unknown
  if (!ipAddress || ipAddress === 'Unknown' || ipAddress.includes('127.0.0.1') || ipAddress.includes('::1')) {
    return { country: 'Local', city: 'Localhost' }
  }

  try {
    // Using ip-api.com (free, no API key needed, 45 req/min limit)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city`, {
      signal: AbortSignal.timeout(2000) // 2 second timeout
    })

    if (!response.ok) {
      throw new Error('Failed to fetch location')
    }

    const data = await response.json()

    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown'
      }
    }

    return { country: 'Unknown', city: 'Unknown' }
  } catch (error) {
    // Silently fail - don't break the app for location lookup
    return { country: 'Unknown', city: 'Unknown' }
  }
}

/**
 * Enhanced device info extraction with location
 */
export async function extractDeviceInfo(request: Request) {
  const userAgent = request.headers.get('user-agent')
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
                 || request.headers.get('x-real-ip')
                 || 'Unknown'

  const { browser, os, device } = parseUserAgent(userAgent)
  
  // Get location asynchronously (with timeout to avoid blocking)
  let country = 'Unknown'
  let city = 'Unknown'
  
  try {
    const location = await getLocationFromIP(ipAddress)
    country = location.country
    city = location.city
  } catch (error) {
    // Location lookup failed, use defaults
  }

  return {
    ipAddress,
    userAgent: userAgent || 'Unknown',
    browser,
    os,
    device,
    country,
    city
  }
}
