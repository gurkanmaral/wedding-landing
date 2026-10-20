// 3D hot-air balloons (the only 3D in the Kapadokya template): lathe envelopes
// with patchwork, stripes or gores, wicker baskets and burners that flare.
import * as THREE from 'three'
import { makeCanvas, canvasTexture, seeded } from '../../shared/intro/core.js'

/* ---------------------------------------------------------- balloons */

// Palettes taken from real Göreme balloons: hot reds and yellows, rainbow
// stripes, purple and teal patchwork, a few pale ones for rhythm.
const SCHEMES = [
  ['#d7262e', '#f6b21b', '#f08a24', '#8c1d2a'],
  ['#e8433f', '#f7d046', '#3fa6d8', '#6c3d91', '#2fae66'],
  ['#f3c234', '#e2482f', '#f7efe2', '#2b6cb0'],
  ['#7a3c96', '#e8433f', '#f5a623', '#2a9d8f'],
  ['#ececec', '#b9bcc4', '#7d8594'],
  ['#ef6c7a', '#f9c784', '#fbe9d0', '#d9455f'],
  ['#1f6fb2', '#f2c14e', '#e85d3f', '#f7efe2'],
  ['#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#264653'],
]
const PATTERNS = ['zigzag', 'stripes', 'checker', 'gores', 'zigzag', 'stripes', 'plain', 'checker']

function envelopeTexture(renderer, scheme, pattern) {
  const [canvas, ctx] = makeCanvas(1024, 512)
  const gores = 16
  const gw = 1024 / gores
  const n = scheme.length
  if (pattern === 'stripes') {
    // horizontal bands of every colour, a broad one around the equator
    const rows = [0, 70, 120, 165, 205, 250, 300, 360, 420, 512]
    for (let i = 0; i < rows.length - 1; i += 1) {
      ctx.fillStyle = scheme[i % n]
      ctx.fillRect(0, rows[i], 1024, rows[i + 1] - rows[i] + 1)
    }
  } else if (pattern === 'zigzag' || pattern === 'checker') {
    // pixel patchwork: flame-stitch zigzags or a diamond checker
    const cell = 32
    for (let y = 0; y < 512; y += cell) {
      for (let x = 0; x < 1024; x += cell) {
        const i = x / cell
        const j = y / cell
        const k = pattern === 'zigzag' ? Math.floor((j + Math.abs((i % 8) - 4)) / 2) : (i + j + Math.floor(j / 3)) % 3
        ctx.fillStyle = scheme[((k % n) + n) % n]
        ctx.fillRect(x, y, cell + 1, cell + 1)
      }
    }
  } else {
    for (let g = 0; g < gores; g += 1) {
      ctx.fillStyle = pattern === 'plain' ? scheme[g % 2] : scheme[g % n]
      ctx.fillRect(g * gw, 0, gw + 1, 512)
    }
    if (pattern === 'plain') {
      ctx.fillStyle = scheme[2 % n]
      ctx.fillRect(0, 300, 1024, 40)
    }
  }
  // the mouth skirt is darker, then seams and gentle fabric shading
  ctx.fillStyle = 'rgba(30,20,20,0.35)'
  ctx.fillRect(0, 0, 1024, 26)
  ctx.strokeStyle = 'rgba(0,0,0,0.14)'
  ctx.lineWidth = 2
  for (let g = 0; g <= gores; g += 1) {
    ctx.beginPath()
    ctx.moveTo(g * gw, 0)
    ctx.lineTo(g * gw, 512)
    ctx.stroke()
  }
  const shade = ctx.createLinearGradient(0, 0, 0, 512)
  shade.addColorStop(0, 'rgba(0,0,0,0.3)')
  shade.addColorStop(0.15, 'rgba(0,0,0,0)')
  shade.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, 1024, 512)
  return canvasTexture(canvas, renderer)
}

// teardrop profile: narrow mouth, wide shoulder, round crown
const PROFILE = [
  [0.22, 0], [0.3, 0.12], [0.52, 0.45], [0.8, 0.9], [0.98, 1.35], [1.04, 1.7], [1.0, 2.0],
  [0.88, 2.28], [0.66, 2.5], [0.38, 2.64], [0.001, 2.7],
].map(([r, y]) => new THREE.Vector2(r, y))
// sample a smooth curve through the profile so the envelope has no facets
const SMOOTH_PROFILE = new THREE.SplineCurve(PROFILE).getPoints(48)

function flameTexture(renderer) {
  const [canvas, ctx] = makeCanvas(64, 128)
  const g = ctx.createRadialGradient(32, 96, 2, 32, 80, 60)
  g.addColorStop(0, 'rgba(255,255,230,1)')
  g.addColorStop(0.25, 'rgba(255,190,80,0.9)')
  g.addColorStop(0.6, 'rgba(255,110,30,0.35)')
  g.addColorStop(1, 'rgba(255,80,20,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 128)
  return canvasTexture(canvas, renderer)
}

export function buildBalloon(renderer, scheme, pattern, flameMap) {
  const group = new THREE.Group()
  const envelope = new THREE.Mesh(
    new THREE.LatheGeometry(SMOOTH_PROFILE, 64),
    new THREE.MeshStandardMaterial({
      map: envelopeTexture(renderer, scheme, pattern),
      roughness: 0.55,
      side: THREE.DoubleSide,
      emissive: new THREE.Color('#ff9a40'),
      emissiveIntensity: 0,
    }),
  )
  envelope.castShadow = true
  group.add(envelope)

  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.26, 0.34),
    new THREE.MeshStandardMaterial({ color: '#7b5838', roughness: 0.9 }),
  )
  basket.position.y = -0.62
  group.add(basket)

  const ropes = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(
      [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].flatMap(([x, z]) => [
        new THREE.Vector3(x, -0.5, z),
        new THREE.Vector3(x * 1.4, 0.02, z * 1.4),
      ]),
    ),
    new THREE.LineBasicMaterial({ color: '#3b2b20', transparent: true, opacity: 0.7 }),
  )
  group.add(ropes)

  const flame = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: flameMap, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
  )
  flame.scale.set(0.3, 0.6, 1)
  flame.position.y = -0.2
  group.add(flame)

  return { group, envelope, flame }
}


export { SCHEMES, PATTERNS, flameTexture }

// A sky full of balloons for a transparent stage laid over the illustration.
export function buildBalloonSky(stage, { count = 22, seed = 19 } = {}) {
  const { scene, renderer, camera } = stage
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  scene.add(new THREE.HemisphereLight('#e4f0ff', '#c9b39a', 1.5))
  const sun = new THREE.DirectionalLight('#fff4e2', 2.6)
  sun.position.set(-20, 18, 14)
  scene.add(sun)

  const flameMap = flameTexture(renderer)
  const random = seeded(seed)
  const balloons = []
  for (let i = 0; i < count; i += 1) {
    const b = buildBalloon(renderer, SCHEMES[i % SCHEMES.length], PATTERNS[(i * 3) % PATTERNS.length], flameMap)
    const z = -10 - random() * 70
    b.group.position.set(0, 0, z)
    b.group.rotation.y = random() * Math.PI * 2
    const size = 1.2 + random() * 0.8
    b.group.scale.setScalar(size)
    scene.add(b.group)
    balloons.push({ ...b, u: random(), v: random(), z, size, phase: random() * 10 })
  }

  // keep balloons spread over the upper part of the frame at any aspect ratio
  const place = () => {
    for (const b of balloons) {
      const distance = camera.position.z - b.z
      const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance
      const w = h * camera.aspect
      // on tall screens keep the middle column clear for the names
      const u = camera.aspect < 0.9 ? (b.u < 0.5 ? b.u * 0.28 : 0.86 + (b.u - 0.5) * 0.28) : b.u
      b.base = new THREE.Vector3((u - 0.5) * w * 1.05, h * (0.04 + b.v * 0.42), b.z)
      // a phone frame is narrow: smaller balloons keep the names readable
      b.group.scale.setScalar(camera.aspect < 0.9 ? b.size * 0.5 : b.size)
    }
  }

  // Motion follows the wall clock, not the stage's own timer, so the intro and
  // the page hero show every balloon in the same place at the same moment.
  const spin = balloons.map((b) => b.group.rotation.y)
  const update = (dt, stageTime, frozen = false) => {
    const t = frozen ? 0 : performance.now() / 1000
    balloons.forEach((b, i) => {
      if (!b.base) return
      b.group.position.set(b.base.x + Math.sin(t * 0.07 + b.phase) * 0.8, b.base.y + Math.sin(t * 0.3 + b.phase) * 0.35, b.base.z)
      b.group.rotation.y = spin[i] + t * 0.04
      const fire = Math.max(0, Math.sin(t * 0.6 + b.phase * 3) - 0.86) * 6
      b.flame.material.opacity = Math.min(1, fire)
      b.envelope.material.emissiveIntensity = fire * 0.12
    })
  }

  return { balloons, place, update, flameMap }
}
