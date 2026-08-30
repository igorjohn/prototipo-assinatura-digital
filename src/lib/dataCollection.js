async function sha256(text) {
  const encoded = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function getPlugins() {
  try {
    return Array.from(navigator.plugins || []).map(p => p.name).filter(Boolean)
  } catch {
    return []
  }
}

async function getBatteryInfo() {
  try {
    if (!navigator.getBattery) return null
    const battery = await navigator.getBattery()
    return {
      level: Math.round(battery.level * 100),
      charging: battery.charging,
    }
  } catch {
    return null
  }
}

async function getIpData() {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(6000) })
    const data = await res.json()
    return {
      ip: data.ip,
      ipVersion: data.version,
      city: data.city,
      region: data.region,
      regionCode: data.region_code,
      country: data.country_name,
      countryCode: data.country_code,
      postal: data.postal,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      utcOffset: data.utc_offset,
      org: data.org,
      asn: data.asn,
      isp: data.org,
    }
  } catch {
    return { ip: null, error: 'Não foi possível obter dados de IP' }
  }
}

export async function collectBrowserData(documentText) {
  const [documentHash, battery, ipData] = await Promise.all([
    sha256(documentText),
    getBatteryInfo(),
    getIpData(),
  ])

  const nav = navigator
  const scr = screen

  return {
    timestamp: new Date().toISOString(),
    documentHash,

    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    languages: Array.from(nav.languages || [nav.language]),
    cookiesEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    onLine: nav.onLine,
    deviceMemory: nav.deviceMemory ?? null,
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    pdfViewerEnabled: nav.pdfViewerEnabled ?? null,

    screenWidth: scr.width,
    screenHeight: scr.height,
    screenAvailWidth: scr.availWidth,
    screenAvailHeight: scr.availHeight,
    screenColorDepth: scr.colorDepth,
    screenPixelDepth: scr.pixelDepth,
    devicePixelRatio: window.devicePixelRatio,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,

    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),

    plugins: getPlugins(),
    battery,

    ...ipData,
  }
}
