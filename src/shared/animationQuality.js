// Keep animated canvases crisp without asking phones and lower-power devices
// to shade four physical pixels for every CSS pixel on every frame.
export function animationPixelRatio(max = 2) {
  const dpr = window.devicePixelRatio || 1
  const compact = Math.min(window.innerWidth, window.innerHeight) < 700
  const coarse = window.matchMedia?.('(pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency || 8
  const memory = navigator.deviceMemory || 8
  const constrained = cores <= 4 || memory <= 4
  const deviceCap = constrained ? 1.25 : compact && coarse ? 1.5 : max
  return Math.min(dpr, max, deviceCap)
}

// Frame-rate independent exponential smoothing. A rate of 4.7 is close to a
// 0.075 lerp at 60 Hz, but behaves the same on 90/120 Hz screens and after a
// temporarily delayed frame.
export function frameBlend(rate, dt) {
  return 1 - Math.exp(-rate * Math.min(Math.max(dt, 0), 0.05))
}
