// 3D hot-air balloons (the only 3D in the Kapadokya template): lathe envelopes
// with painted gores, wicker baskets and burners that flare.
import * as THREE from 'three'
import { makeCanvas, canvasTexture, seeded } from '../../shared/intro/core.js'

/* ---------------------------------------------------------- balloons */

const SCHEMES = [
  ['#d9483b', '#f3d36b', '#2f5d8a'],
  ['#2e3a6e', '#f2e8dc', '#e07a5f'],
  ['#f2a541', '#c0392b', '#f7efe2'],
  ['#3d8b6e', '#f3d36b', '#c0392b'],
  ['#8e44ad', '#f39c12', '#f7efe2'],
  ['#e9e1d0', '#c0392b', '#1f3a5f'],
  ['#1f6fb2', '#f7efe2', '#f3d36b'],
]

function envelopeTexture(renderer, scheme, pattern) {
  const [canvas, ctx] = makeCanvas(1024, 512)
  const gores = 16
  for (let g = 0; g < gores; g += 1) {
    ctx.fillStyle = scheme[g % (pattern === 'pair' ? 2 : 3)]
    ctx.fillRect((g * 1024) / gores, 0, 1024 / gores + 1, 512)
  }
  if (pattern === 'band') {
    ctx.fillStyle = scheme[2]
    ctx.fillRect(0, 300, 1024, 46)
    ctx.fillStyle = scheme[1]
    ctx.fillRect(0, 346, 1024, 14)
  }
  if (pattern === 'chevron') {
    ctx.fillStyle = scheme[1]
    for (let g = 0; g < gores; g += 1) {
      const x = (g * 1024) / gores
      ctx.beginPath()
      ctx.moveTo(x, 240)
      ctx.lineTo(x + 32, 200)
      ctx.lineTo(x + 64, 240)
      ctx.lineTo(x + 64, 270)
      ctx.lineTo(x + 32, 230)
      ctx.lineTo(x, 270)
      ctx.fill()
    }
  }
  // seams and a soft fabric shading toward the mouth
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'
  ctx.lineWidth = 2
  for (let g = 0; g <= gores; g += 1) {
    ctx.beginPath()
    ctx.moveTo((g * 1024) / gores, 0)
    ctx.lineTo((g * 1024) / gores, 512)
    ctx.stroke()
  }
  const shade = ctx.createLinearGradient(0, 0, 0, 512)
  shade.addColorStop(0, 'rgba(0,0,0,0.35)')
  shade.addColorStop(0.18, 'rgba(0,0,0,0)')
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
      roughness: 0.6,
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


export { SCHEMES, flameTexture }

// A sky full of balloons for a transparent stage laid over the illustration.
export function buildBalloonSky(stage, { count = 22, seed = 19 } = {}) {
  const { scene, renderer, camera } = stage
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  scene.add(new THREE.HemisphereLight('#ffe9dc', '#b98c70', 1.25))
  const sun = new THREE.DirectionalLight('#ffd6ab', 2.4)
  sun.position.set(-30, 8, 10)
  scene.add(sun)

  const flameMap = flameTexture(renderer)
  const random = seeded(seed)
  const balloons = []
  for (let i = 0; i < count; i += 1) {
    const b = buildBalloon(renderer, SCHEMES[i % SCHEMES.length], ['plain', 'band', 'chevron', 'pair'][i % 4], flameMap)
    const z = -10 - random() * 70
    b.group.position.set(0, 0, z)
    b.group.rotation.y = random() * Math.PI * 2
    b.group.scale.setScalar(1.2 + random() * 0.8)
    scene.add(b.group)
    balloons.push({ ...b, u: random(), v: random(), z, phase: random() * 10 })
  }

  // keep balloons spread over the upper part of the frame at any aspect ratio
  const place = () => {
    for (const b of balloons) {
      const distance = camera.position.z - b.z
      const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance
      const w = h * camera.aspect
      // on tall screens keep the middle column clear for the names
      const u = camera.aspect < 0.9 ? (b.u < 0.5 ? b.u * 0.56 : 0.44 + b.u * 0.56) : b.u
      b.base = new THREE.Vector3((u - 0.5) * w * 1.05, h * (0.04 + b.v * 0.42), b.z)
    }
  }

  const update = (dt, t) => {
    for (const b of balloons) {
      if (!b.base) continue
      b.group.position.set(b.base.x + Math.sin(t * 0.07 + b.phase) * 0.8, b.base.y + Math.sin(t * 0.3 + b.phase) * 0.35, b.base.z)
      b.group.rotation.y += dt * 0.04
      const fire = Math.max(0, Math.sin(t * 0.6 + b.phase * 3) - 0.86) * 6
      b.flame.material.opacity = Math.min(1, fire)
      b.envelope.material.emissiveIntensity = fire * 0.12
    }
  }

  return { balloons, place, update, flameMap }
}
