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

export function isFaceInsideOval(detection, ovalBounds) {
  const { cx, cy, rx, ry } = ovalBounds
  const box = detection.box

  const faceCx = box.x + box.width / 2
  const faceCy = box.y + box.height / 2

  const dxNorm = Math.abs(faceCx - cx) / rx
  const dyNorm = Math.abs(faceCy - cy) / ry
  if (dxNorm > 0.25 || dyNorm > 0.25) return false

  const fillRatio = box.height / (ry * 2)
  if (fillRatio < 0.45 || fillRatio > 1.05) return false

  const corners = [
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x, box.y + box.height],
    [box.x + box.width, box.y + box.height],
  ]

  for (const [px, py] of corners) {
    const e = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2
    if (e > 1.05) return false
  }

  return true
}
