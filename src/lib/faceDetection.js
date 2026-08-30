import * as faceapi from '@vladmandic/face-api'

let modelsLoaded = false

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  modelsLoaded = true
}

export async function detectFace(videoElement) {
  if (!modelsLoaded) return null
  try {
    const detection = await faceapi.detectSingleFace(
      videoElement,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
    )
    return detection || null
  } catch {
    return null
  }
}

export function getFaceStatus(detection, ovalBounds) {
  if (!detection) return 'no_face'

  const { cx, cy, rx, ry } = ovalBounds
  const box = detection.box
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
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x, box.y + box.height],
    [box.x + box.width, box.y + box.height],
  ]
  for (const [px, py] of corners) {
    const e = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2
    if (e > 1.05) {
      if (fillRatio > 0.9) return 'too_close'
      return 'not_centered'
    }
  }

  return 'aligned'
}

export function isFaceInsideOval(detection, ovalBounds) {
  return getFaceStatus(detection, ovalBounds) === 'aligned'
}
