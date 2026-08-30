import FingerprintJS from '@fingerprintjs/fingerprintjs'

async function sha256(text) {
  const encoded = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 60
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.font = '11pt Arial'
    ctx.fillText('Assinador Digital 🔐 !#$%', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.font = '18pt Arial'
    ctx.fillText('Assinador Digital 🔐 !#$%', 4, 45)
    return canvas.toDataURL()
  } catch {
    return null
  }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return { vendor: null, renderer: null }
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    return {
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    }
  } catch {
    return { vendor: null, renderer: null }
  }
}

async function getAudioFingerprint() {
  try {
    const ctx = new OfflineAudioContext(1, 44100, 44100)
    const oscillator = ctx.createOscillator()
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.setValueAtTime(-50, ctx.currentTime)
    compressor.knee.setValueAtTime(40, ctx.currentTime)
    compressor.ratio.setValueAtTime(12, ctx.currentTime)
    compressor.attack.setValueAtTime(0, ctx.currentTime)
    compressor.release.setValueAtTime(0.25, ctx.currentTime)
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(10000, ctx.currentTime)
    oscillator.connect(compressor)
    compressor.connect(ctx.destination)
    oscillator.start(0)
    const buffer = await ctx.startRendering()
    const data = buffer.getChannelData(0)
    let sum = 0
    for (let i = 4500; i < 5000; i++) {
      sum += Math.abs(data[i])
    }
    return sum.toFixed(10)
  } catch {
    return null
  }
}

export async function collectFingerprint() {
  const [fpAgent, canvasData, audio] = await Promise.all([
    FingerprintJS.load().then(fp => fp.get()),
    Promise.resolve(getCanvasFingerprint()),
    getAudioFingerprint(),
  ])

  const webgl = getWebGLInfo()
  const canvasHash = canvasData ? await sha256(canvasData) : null

  return {
    visitorId: fpAgent.visitorId,
    canvasHash,
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    audioFingerprint: audio,
  }
}
