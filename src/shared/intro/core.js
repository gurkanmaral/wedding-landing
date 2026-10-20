// Shared plumbing for every intro scene: renderer, camera, render loop,
// resize handling and disposal. A scene module only builds its own objects.
import * as THREE from 'three'

export function createStage(host, { fov = 35, cameraZ = 10, antialias = true, toneMapping = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  if (toneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
  }
  host.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.05, 200)
  camera.position.set(0, 0, cameraZ)

  const disposables = []
  const frameHandlers = []
  const resizeHandlers = []
  const view = { width: 1, height: 1, aspect: 1 }

  const track = (item) => {
    disposables.push(item)
    return item
  }

  // World-space size of the viewport at a given distance from the camera.
  const visibleSize = (distance = camera.position.z) => {
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance
    return { width: h * camera.aspect, height: h }
  }

  const resize = () => {
    const width = host.clientWidth || window.innerWidth
    const height = host.clientHeight || window.innerHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    Object.assign(view, { width, height, aspect: width / height })
    resizeHandlers.forEach((fn) => fn(view))
  }

  let last = performance.now()
  let elapsed = 0
  let raf = 0
  let running = true
  let paused = false
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    if (!running || paused) return
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    elapsed += dt
    frameHandlers.forEach((fn) => fn(dt, elapsed))
    renderer.render(scene, camera)
  }

  const onVisibility = () => {
    running = document.visibilityState === 'visible'
    last = performance.now()
  }
  document.addEventListener('visibilitychange', onVisibility)
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()
  raf = requestAnimationFrame(frame)

  return {
    THREE,
    renderer,
    scene,
    camera,
    view,
    track,
    visibleSize,
    onFrame: (fn) => frameHandlers.push(fn),
    // pause rendering while the canvas is off screen
    setPaused(value) {
      paused = value
      last = performance.now()
    },
    onResize: (fn) => {
      resizeHandlers.push(fn)
      fn(view)
    },
    dispose() {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
      scene.traverse((object) => {
        object.geometry?.dispose?.()
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : []
        materials.forEach((material) => {
          Object.values(material).forEach((value) => value?.isTexture && value.dispose())
          material.dispose()
        })
      })
      disposables.forEach((item) => item?.dispose?.())
      renderer.dispose()
      renderer.forceContextLoss?.()
      renderer.domElement.remove()
    },
  }
}

// Canvas helper: returns [canvas, ctx] of the given pixel size.
export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return [canvas, canvas.getContext('2d')]
}

export function canvasTexture(canvas, renderer, { srgb = true, repeat = false } = {}) {
  const texture = new THREE.CanvasTexture(canvas)
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
  }
  return texture
}

// Deterministic random so textures look the same on every visit.
export function seeded(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Formats the event date in the template's language.
export function formatDate(template, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Date(`${template.date}T12:00:00`).toLocaleDateString(template.lang === 'tr' ? 'tr-TR' : 'en-GB', options)
}
