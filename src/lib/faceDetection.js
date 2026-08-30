import * as faceapi from '@vladmandic/face-api'

let modelsLoaded = false

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
  ])
  modelsLoaded = true
}

const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })

export async function detectFace(videoElement) {
  if (!modelsLoaded) return null
  try {
    return await faceapi.detectSingleFace(videoElement, DETECTOR_OPTIONS) || null
  } catch {
    return null
  }
}

export async function detectFaceWithLandmarks(videoElement) {
  if (!modelsLoaded) return null
  try {
    return await faceapi.detectSingleFace(videoElement, DETECTOR_OPTIONS).withFaceLandmarks(true) || null
  } catch {
    return null
  }
}

function calcEAR(eye) {
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
  return (d(eye[1], eye[5]) + d(eye[2], eye[4])) / (2 * d(eye[0], eye[3]))
}

export function getEAR(landmarks) {
  const pts = landmarks.positions
  return (calcEAR(pts.slice(36, 42)) + calcEAR(pts.slice(42, 48))) / 2
}

export function getFaceStatus(detection, ovalBounds) {
  if (!detection) return 'no_face'

  const { cx, cy, rx, ry } = ovalBounds
  // Support both plain detection and detection-with-landmarks
  const box = detection.box ?? detection.detection?.box
  if (!box) return 'no_face'

  const faceCx = box.x + box.width / 2
  const faceCy = box.y + box.height / 2
  const fillRatio = box.height / (ry * 2)

  if (fillRatio > 1.1) return 'too_close'
  if (fillRatio < 0.40) return 'too_far'

  const dxNorm = Math.abs(faceCx - cx) / rx
  const dyNorm = Math.abs(faceCy - cy) / ry
  if (dxNorm > 0.25 || dyNorm > 0.25) {
    if (faceCy < cy - ry * 0.2) return 'move_down'
    if (faceCy > cy + ry * 0.2) return 'move_up'
    if (faceCx < cx - rx * 0.2) return 'move_right'
    if (faceCx > cx + rx * 0.2) return 'move_left'
    return 'not_centered'
  }

  const corners = [
    [box.x, box.y], [box.x + box.width, box.y],
    [box.x, box.y + box.height], [box.x + box.width, box.y + box.height],
  ]
  for (const [px, py] of corners) {
    const e = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2
    if (e > 1.05) return fillRatio > 0.9 ? 'too_close' : 'not_centered'
  }

  return 'aligned'
}
