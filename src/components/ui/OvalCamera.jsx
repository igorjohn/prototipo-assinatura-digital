import { useRef, useEffect, useState, useCallback } from 'react'
import { loadFaceDetectionModels, detectFace, isFaceInsideOval } from '../../lib/faceDetection'

const STATUS = {
  LOADING_MODELS: 'loading_models',
  CAMERA_ERROR: 'camera_error',
  NO_FACE: 'no_face',
  MISALIGNED: 'misaligned',
  ALIGNED: 'aligned',
}

const OVAL_RATIO = 0.72
const OVAL_ASPECT = 1.32

const STATUS_COLORS = {
  [STATUS.LOADING_MODELS]: '#6b7280',
  [STATUS.CAMERA_ERROR]: '#e02424',
  [STATUS.NO_FACE]: '#e02424',
  [STATUS.MISALIGNED]: '#d97706',
  [STATUS.ALIGNED]: '#0e9f6e',
}

const STATUS_MESSAGES = {
  [STATUS.LOADING_MODELS]: '⏳ Carregando detecção de rosto...',
  [STATUS.CAMERA_ERROR]: '❌ Erro ao acessar câmera. Verifique as permissões.',
  [STATUS.NO_FACE]: '👤 Posicione seu rosto na moldura oval',
  [STATUS.MISALIGNED]: '⚠️ Centralize seu rosto dentro da moldura',
  [STATUS.ALIGNED]: '✅ Ótimo! Aguarde...',
}

function drawOverlay(ctx, w, h, status) {
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2
  const rx = (w * OVAL_RATIO) / 2
  const ry = rx * OVAL_ASPECT

  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(0, 0, w, h)

  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,1)'
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  const color = STATUS_COLORS[status] || '#6b7280'
  ctx.strokeStyle = color
  ctx.lineWidth = 3.5
  ctx.shadowColor = color
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.shadowBlur = 0

  return { cx, cy, rx, ry }
}

export function OvalCamera({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const isDetectingRef = useRef(false)
  const countdownTimerRef = useRef(null)
  const countdownValueRef = useRef(null)

  const [status, setStatus] = useState(STATUS.LOADING_MODELS)
  const [countdown, setCountdown] = useState(null)
  const [modelsReady, setModelsReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    loadFaceDetectionModels()
      .then(() => setModelsReady(true))
      .catch(() => setStatus(STATUS.CAMERA_ERROR))
  }, [])

  useEffect(() => {
    let stream = null
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch {
        setStatus(STATUS.CAMERA_ERROR)
      }
    }
    startCamera()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!modelsReady || !cameraReady) return
    setStatus(STATUS.NO_FACE)

    async function loop() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.paused || video.ended) {
        animFrameRef.current = requestAnimationFrame(loop)
        return
      }
      const { videoWidth: w, videoHeight: h } = video
      if (!w || !h) {
        animFrameRef.current = requestAnimationFrame(loop)
        return
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')

      if (!isDetectingRef.current) {
        isDetectingRef.current = true
        detectFace(video).then(detection => {
          isDetectingRef.current = false
          let newStatus = STATUS.NO_FACE
          if (detection) {
            const ovalBounds = {
              cx: w / 2, cy: h / 2,
              rx: (w * OVAL_RATIO) / 2,
              ry: (w * OVAL_RATIO * OVAL_ASPECT) / 2,
            }
            newStatus = isFaceInsideOval(detection, ovalBounds) ? STATUS.ALIGNED : STATUS.MISALIGNED
          }
          setStatus(newStatus)
        })
      }

      drawOverlay(ctx, w, h, status)
      animFrameRef.current = requestAnimationFrame(loop)
    }

    loop()
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [modelsReady, cameraReady])

  useEffect(() => {
    if (status === STATUS.ALIGNED) {
      if (!countdownTimerRef.current) {
        countdownValueRef.current = 3
        setCountdown(3)
        countdownTimerRef.current = setInterval(() => {
          countdownValueRef.current -= 1
          setCountdown(countdownValueRef.current)
          if (countdownValueRef.current <= 0) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
            capturePhoto()
          }
        }, 1000)
      }
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
        setCountdown(null)
      }
    }
  }, [status])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const cap = document.createElement('canvas')
    cap.width = video.videoWidth
    cap.height = video.videoHeight
    const ctx = cap.getContext('2d')
    ctx.drawImage(video, 0, 0)
    onCapture(cap.toDataURL('image/jpeg', 0.85))
  }, [onCapture])

  return (
    <div>
      <div className="camera-container">
        <video ref={videoRef} className="camera-video" muted playsInline />
        <canvas ref={canvasRef} className="camera-canvas" />

        {(status === STATUS.LOADING_MODELS || (!modelsReady && !cameraReady)) && (
          <div className="camera-loading">
            <div className="spinner" />
            <span>Iniciando câmera e modelos de IA...</span>
          </div>
        )}

        {countdown !== null && countdown > 0 && (
          <div className="camera-countdown">{countdown}</div>
        )}

        <div className="camera-status-bar" style={{ background: `rgba(0,0,0,0.7)` }}>
          <span style={{ fontSize: 13 }}>{STATUS_MESSAGES[status] || ''}</span>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 0 }}>
        <span>💡</span>
        <span>Posicione seu rosto centralizado na moldura. A captura é automática quando a moldura ficar verde.</span>
      </div>
    </div>
  )
}
