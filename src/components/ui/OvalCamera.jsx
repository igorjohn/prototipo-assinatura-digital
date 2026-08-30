import { useRef, useEffect, useState, useCallback } from 'react'
import { loadFaceDetectionModels, detectFace, detectFaceWithLandmarks, getFaceStatus, getHeadAngles } from '@/lib/faceDetection'
import { IconLoader2 } from '@tabler/icons-react'

const OVAL_RATIO = 0.72
const OVAL_ASPECT = 1.32
const ALIGNED_HOLD_MS = 1200
const BRIGHTNESS_DARK = 28
const BRIGHTNESS_DIM = 50
const BRIGHTNESS_SAMPLE_EVERY = 20

const CHALLENGE_TYPES = ['turn', 'nod']
const CHALLENGE_MSG = {
  turn: 'Vire a cabeça lentamente para um lado',
  nod: 'Acene com a cabeça para baixo',
}
const YAW_THRESHOLD = 0.11
const NOD_RATIO = 0.16

function sampleBrightness(video) {
  try {
    const offscreen = document.createElement('canvas')
    offscreen.width = 64; offscreen.height = 64
    offscreen.getContext('2d').drawImage(video, 0, 0, 64, 64)
    const { data } = offscreen.getContext('2d').getImageData(0, 0, 64, 64)
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    return sum / (data.length / 4)
  } catch { return 255 }
}

function drawOverlay(ctx, w, h, color) {
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2, cy = h / 2
  const rx = (w * OVAL_RATIO) / 2, ry = rx * OVAL_ASPECT
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,1)'
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
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

const STATUS_COLOR = {
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

const STATUS_MSG = {
  loading_models: 'Carregando detecção de rosto...',
  camera_error:   'Erro ao acessar a câmera',
  no_face:        'Posicione seu rosto dentro da moldura',
  too_close:      'Afaste-se um pouco',
  too_far:        'Aproxime-se um pouco mais',
  move_up:        'Suba o rosto',
  move_down:      'Desça o rosto',
  move_left:      'Mova para a direita',
  move_right:     'Mova para a esquerda',
  not_centered:   'Centralize seu rosto',
  misaligned:     'Centralize seu rosto',
  aligned:        'Posição perfeita — aguarde...',
}

export function OvalCamera({ onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const isDetectingRef = useRef(false)
  const alignedSinceRef = useRef(null)

  // Challenge refs
  const phaseRef = useRef('positioning')
  const challengeRef = useRef(null)
  const motionDetectedRef = useRef(false)
  const baseFaceCenterYRef = useRef(null)
  const overlayColorRef = useRef('#6b7280')
  const overlayMsgRef = useRef('')
  const frameCountRef = useRef(0)

  // Guarda o shot capturado quando o rosto ficou alinhado
  const alignedSelfieRef = useRef(null)

  const [status, setStatus] = useState('loading_models')
  const [modelsReady, setModelsReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [phase, setPhase] = useState('positioning')
  const [challenge, setChallenge] = useState(null)
  const [bottomMsg, setBottomMsg] = useState('')
  const [brightnessLevel, setBrightnessLevel] = useState('ok')

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
      } catch { setStatus('camera_error') }
    }
    startCamera()
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [])

  // Captura o frame atual como base64 (lê sempre o ref mais recente)
  function snapFrame() {
    const video = videoRef.current
    if (!video) return null
    const cap = document.createElement('canvas')
    cap.width = video.videoWidth
    cap.height = video.videoHeight
    cap.getContext('2d').drawImage(video, 0, 0)
    return cap.toDataURL('image/jpeg', 0.85)
  }

  // Chamado ao concluir o desafio — entrega ambos os shots ao pai
  const capturePhoto = useCallback(() => {
    onCapture({
      selfieBase64: snapFrame(),
      selfieAlignedBase64: alignedSelfieRef.current,
    })
  }, [onCapture])

  useEffect(() => {
    if (!modelsReady || !cameraReady) return
    setStatus('no_face')
    overlayColorRef.current = STATUS_COLOR.no_face
    overlayMsgRef.current = STATUS_MSG.no_face
    setBottomMsg(STATUS_MSG.no_face)

    async function loop() {
      if (phaseRef.current === 'done') return

      const video = videoRef.current, canvas = canvasRef.current
      if (!video || !canvas || video.paused || video.ended) {
        animFrameRef.current = requestAnimationFrame(loop)
        return
      }
      const { videoWidth: w, videoHeight: h } = video
      if (!w || !h) { animFrameRef.current = requestAnimationFrame(loop); return }

      canvas.width = w; canvas.height = h
      drawOverlay(canvas.getContext('2d'), w, h, overlayColorRef.current)

      if (!isDetectingRef.current) {
        isDetectingRef.current = true
        const ovalBounds = { cx: w/2, cy: h/2, rx: (w*OVAL_RATIO)/2, ry: (w*OVAL_RATIO*OVAL_ASPECT)/2 }

        frameCountRef.current++
        if (frameCountRef.current % BRIGHTNESS_SAMPLE_EVERY === 0 && phaseRef.current === 'positioning') {
          const lum = sampleBrightness(video)
          const lvl = lum < BRIGHTNESS_DARK ? 'dark' : lum < BRIGHTNESS_DIM ? 'dim' : 'ok'
          setBrightnessLevel(lvl)
        }

        if (phaseRef.current === 'positioning') {
          detectFace(video).then(detection => {
            isDetectingRef.current = false
            const fs = getFaceStatus(detection, ovalBounds)
            setStatus(fs)
            overlayColorRef.current = STATUS_COLOR[fs] ?? '#6b7280'
            const msg = STATUS_MSG[fs] ?? ''
            overlayMsgRef.current = msg
            setBottomMsg(msg)

            if (fs === 'aligned') {
              if (!alignedSinceRef.current) alignedSinceRef.current = Date.now()
              if (Date.now() - alignedSinceRef.current >= ALIGNED_HOLD_MS) {
                // Shot 1: rosto bem posicionado, antes do desafio
                alignedSelfieRef.current = snapFrame()

                const type = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)]
                const ch = { type }
                challengeRef.current = ch
                motionDetectedRef.current = false
                baseFaceCenterYRef.current = null
                phaseRef.current = 'challenge'
                overlayColorRef.current = '#0e9f6e'
                const label = CHALLENGE_MSG[type]
                overlayMsgRef.current = label
                setBottomMsg(label)
                setChallenge(ch)
                setPhase('challenge')
                alignedSinceRef.current = null
              }
            } else {
              alignedSinceRef.current = null
            }
          })
        } else if (phaseRef.current === 'challenge') {
          detectFaceWithLandmarks(video).then(result => {
            isDetectingRef.current = false
            const ch = challengeRef.current

            if (!result?.landmarks) {
              overlayColorRef.current = '#d97706'
              const msg = 'Reposicione seu rosto na moldura'
              overlayMsgRef.current = msg
              setBottomMsg(msg)
              return
            }

            overlayColorRef.current = '#0e9f6e'
            const { yaw } = getHeadAngles(result.landmarks)
            const box = result.detection.box
            const centerY = box.y + box.height / 2

            let detected = false
            if (ch.type === 'turn') detected = Math.abs(yaw) > YAW_THRESHOLD
            else if (ch.type === 'nod') {
              if (baseFaceCenterYRef.current === null) {
                baseFaceCenterYRef.current = centerY
              } else {
                detected = (centerY - baseFaceCenterYRef.current) / box.height > NOD_RATIO
              }
            }

            if (detected) {
              phaseRef.current = 'done'
              const msg = 'Verificado! Capturando...'
              overlayMsgRef.current = msg
              setBottomMsg(msg)
              setPhase('done')
              // Shot 2: após o desafio de movimento
              setTimeout(() => capturePhoto(), 600)
              return
            }

            const label = CHALLENGE_MSG[ch.type]
            overlayMsgRef.current = label
            setBottomMsg(label)
          })
        }
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [modelsReady, cameraReady, capturePhoto])

  const isLoading = status === 'loading_models' || !modelsReady || !cameraReady

  return (
    <div className="space-y-3">
      <div className="camera-container">
        <video ref={videoRef} className="camera-video" muted playsInline />
        <canvas ref={canvasRef} className="camera-canvas" />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3 text-white text-sm">
            <IconLoader2 size={24} className="animate-spin" />
            <span>Iniciando câmera e modelos de IA...</span>
          </div>
        )}

        {phase === 'positioning' && brightnessLevel !== 'ok' && (
          <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none z-10">
            <div className="bg-amber-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {brightnessLevel === 'dark' ? '⚠ Ambiente muito escuro — acenda uma luz' : '⚠ Pouca iluminação'}
            </div>
          </div>
        )}

        {phase === 'challenge' && (
          <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none z-10">
            <div className="bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Verificação de vivacidade
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-black/65 text-white text-[13px] font-medium text-center">
          {bottomMsg}
        </div>
      </div>

      {phase === 'positioning' && (
        <p className="text-[12px] text-muted-foreground text-center px-2">
          Centralize o rosto na moldura. Um desafio de segurança aparecerá em seguida.
        </p>
      )}
      {phase === 'challenge' && (
        <p className="text-[12px] text-center px-2 font-medium" style={{ color: '#0e9f6e' }}>
          {CHALLENGE_MSG[challenge?.type]}
        </p>
      )}
    </div>
  )
}
