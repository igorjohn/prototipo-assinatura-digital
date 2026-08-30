import { useRef, useEffect, useState, useCallback } from 'react'
import { loadFaceDetectionModels, detectFace, getFaceStatus } from '../../lib/faceDetection'

const OVAL_RATIO = 0.72
const OVAL_ASPECT = 1.32

const STATUS_COLORS = {
  loading_models: '#6b7280',
  camera_error:   '#e02424',
  no_face:        '#e02424',
  too_close:      '#d97706',
  too_far:        '#d97706',
  move_up:        '#d97706',
  move_down:      '#d97706',
  move_left:      '#d97706',
  move_right:     '#d97706',
  not_centered:   '#d97706',
  misaligned:     '#d97706',
  aligned:        '#0e9f6e',
}

const STATUS_MESSAGES = {
  loading_models: '⏳ Carregando detecção de rosto...',
  camera_error:   '❌ Erro ao acessar a câmera. Verifique as permissões.',
  no_face:        '👤 Posicione seu rosto dentro da moldura',
  too_close:      '↔️ Afaste-se um pouco da câmera',
  too_far:        '🔍 Aproxime-se um pouco mais da câmera',
  move_up:        '⬆️ Suba o rosto um pouco',
  move_down:      '⬇️ Desça o rosto um pouco',
  move_left:      '➡️ Mova o rosto para a direita',
  move_right:     '⬅️ Mova o rosto para a esquerda',
  not_centered:   '🎯 Centralize seu rosto na moldura',
  misaligned:     '🎯 Centralize seu rosto na moldura',
  aligned:        '✅ Perfeito! Segure assim...',
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

  const [status, setStatus] = useState('loading_models')
  const [countdown, setCountdown] = useState(null)
  const [modelsReady, setModelsReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    loadFaceDetectionModels()
      .then(() => setModelsReady(true))
      .catch(() => setStatus('camera_error'))
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
        setStatus('camera_error')
      }
    }
    startCamera()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!modelsReady || !cameraReady) return
    setStatus('no_face')

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
          const ovalBounds = {
            cx: w / 2, cy: h / 2,
            rx: (w * OVAL_RATIO) / 2,
            ry: (w * OVAL_RATIO * OVAL_ASPECT) / 2,
          }
          setStatus(getFaceStatus(detection, ovalBounds))
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
    if (status === 'aligned') {
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

        {(status === 'loading_models' || (!modelsReady && !cameraReady)) && (
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
