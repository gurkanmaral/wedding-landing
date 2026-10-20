import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  cardTexture,
  flapTexture,
  linerTexture,
  particleTexture,
  pocketTexture,
  sealTextures,
  shadowTexture,
} from './textures.js'

const W = 3.2 // envelope width (world units)
const H = 2.1 // envelope height
const NOTCH = 0.55 // depth of the pocket's V, as a fraction of H from the top
const FLAP = 0.62 // flap length as a fraction of H
const FOV = 32

// ShapeGeometry UVs are in shape space; remap them to 0..1 over the envelope.
function shapeGeometry(points, width, height, originY = -height / 2) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
  const geometry = new THREE.ShapeGeometry(shape)
  const uv = geometry.attributes.uv
  const pos = geometry.attributes.position
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, (pos.getX(i) + width / 2) / width, (pos.getY(i) - originY) / height)
  }
  return geometry
}

function paperMaterial(map, extra = {}) {
  return new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0, ...extra })
}

function waxSealGeometry(radius) {
  const geometry = new THREE.CylinderGeometry(radius, radius * 1.02, 0.08, 72, 1)
  const pos = geometry.attributes.position
  // lumpy, hand-poured edge
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const a = Math.atan2(z, x)
    const r = Math.hypot(x, z)
    if (r < radius * 0.5) continue
    const wobble = 1 + Math.sin(a * 7) * 0.035 + Math.sin(a * 13 + 1.3) * 0.02 + Math.sin(a * 3 + 0.4) * 0.03
    pos.setX(i, Math.cos(a) * r * wobble)
    pos.setZ(i, Math.sin(a) * r * wobble)
  }
  geometry.computeVertexNormals()
  geometry.rotateX(Math.PI / 2)
  // planar UVs on the camera-facing cap so the monogram reads upright
  const normal = geometry.attributes.normal
  const uv = geometry.attributes.uv
  for (let i = 0; i < pos.count; i += 1) {
    if (normal.getZ(i) > 0.9) uv.setXY(i, pos.getX(i) / (2 * radius) + 0.5, pos.getY(i) / (2 * radius) + 0.5)
  }
  return geometry
}

function createParticles(renderer, intro, count) {
  const type = intro.particles
  const texture = particleTexture(renderer, type)
  const glowing = type === 'stars' || type === 'dust'
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: glowing ? THREE.AdditiveBlending : THREE.NormalBlending,
    opacity: glowing ? 0.95 : 0.92,
  })
  const geometry = new THREE.PlaneGeometry(1, 1)
  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.frustumCulled = false
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  const colors = intro.particleColors.map((c) => new THREE.Color(c))
  const items = []
  const random = Math.random
  for (let i = 0; i < count; i += 1) {
    const p = {
      x: (random() - 0.5) * 14,
      y: (random() - 0.5) * 9,
      z: -4 + random() * 6.5,
      size: glowing ? 0.05 + random() * 0.14 : 0.12 + random() * 0.16,
      speed: glowing ? 0.02 + random() * 0.05 : 0.25 + random() * 0.35,
      sway: 0.3 + random() * 0.8,
      phase: random() * Math.PI * 2,
      spin: (random() - 0.5) * 2.4,
      tilt: random() * Math.PI,
      rx: 0,
      ry: 0,
      rz: random() * Math.PI * 2,
    }
    if (type === 'confetti') p.size *= 0.7
    items.push(p)
    mesh.setColorAt(i, colors[i % colors.length])
  }
  mesh.instanceColor.needsUpdate = true

  const dummy = new THREE.Object3D()
  const update = (dt, t, burst) => {
    for (let i = 0; i < count; i += 1) {
      const p = items[i]
      if (glowing) {
        p.y += p.speed * dt * (1 + burst * 6)
        p.x += Math.sin(t * 0.3 + p.phase) * 0.002
        if (p.y > 5) p.y = -5
      } else {
        p.y -= p.speed * dt * (1 + burst * 2.5)
        p.x += Math.sin(t * p.sway + p.phase) * dt * 0.35 + burst * dt * (p.x > 0 ? 1.5 : -1.5)
        p.rx += p.spin * dt
        p.ry += p.spin * 0.7 * dt
        p.rz += p.spin * 0.4 * dt
        if (p.y < -5.2) {
          p.y = 5.2
          p.x = (random() - 0.5) * 14
        }
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rx + p.tilt, p.ry, p.rz)
      const twinkle = glowing ? 0.65 + Math.sin(t * 2.2 + p.phase * 3) * 0.35 : 1
      dummy.scale.setScalar(p.size * twinkle)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }
  return { mesh, update }
}

/**
 * Builds the envelope scene inside `host`. Returns controls for the React
 * wrapper. `onOpened` fires once the card fills the screen.
 */
export function createEnvelopeScene(host, template, { onOpened, particleCount, address: showAddress = true } = {}) {
  const { intro, couple, place, lang } = template
  const dateLabel = new Date(`${template.date}T12:00:00`).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60)
  camera.position.set(0, 0, 9)

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d0c4, 1.6))
  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(-3, 4, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xffffff, 0.5)
  rim.position.set(4, -2, 3)
  scene.add(rim)

  const disposables = []
  const track = (...items) => {
    disposables.push(...items)
    return items[0]
  }

  /* ---------------------------------------------------------- envelope */
  const root = new THREE.Group() // pointer tilt + float
  const envelope = new THREE.Group() // everything except the card
  root.add(envelope)
  scene.add(root)

  const liner = track(linerTexture(renderer, intro))
  const address = showAddress ? (lang === 'tr' ? 'Sevgili misafirimize' : 'To our dearest guest') : ''

  // back panel: liner on the inside, paper outside
  const backGeo = track(new THREE.PlaneGeometry(W, H))
  const backInside = new THREE.Mesh(backGeo, track(paperMaterial(liner)))
  const backOutside = new THREE.Mesh(backGeo, track(paperMaterial(track(flapTexture(renderer, intro)), { side: THREE.BackSide })))
  envelope.add(backInside, backOutside)

  // card sits between back and pocket
  const cardW = W * 0.9
  const cardH = H * 0.86
  const card = new THREE.Mesh(
    track(new THREE.PlaneGeometry(cardW, cardH)),
    track(
      new THREE.MeshStandardMaterial({
        map: track(cardTexture(renderer, intro, { width: cardW, height: cardH, couple, dateLabel, place, lang })),
        roughness: 0.8,
      }),
    ),
  )
  card.position.set(0, -0.02, 0.012)
  root.add(card)

  // front pocket with a V opening at the top
  const notchY = H / 2 - H * NOTCH
  const pocketGeo = track(
    shapeGeometry(
      [
        [-W / 2, -H / 2],
        [W / 2, -H / 2],
        [W / 2, H / 2],
        [0, notchY],
        [-W / 2, H / 2],
      ],
      W,
      H,
    ),
  )
  const pocket = new THREE.Mesh(
    pocketGeo,
    track(paperMaterial(track(pocketTexture(renderer, intro, { width: W, height: H, notch: NOTCH, address })))),
  )
  pocket.position.z = 0.024
  envelope.add(pocket)

  // flap hinged on the top edge
  const flap = new THREE.Group()
  flap.position.set(0, H / 2, 0.036)
  const flapGeo = track(
    shapeGeometry(
      [
        [-W / 2, 0],
        [W / 2, 0],
        [0, -H * FLAP],
      ],
      W,
      H * FLAP,
      -H * FLAP,
    ),
  )
  const flapOuter = new THREE.Mesh(flapGeo, track(paperMaterial(track(flapTexture(renderer, intro)))))
  const flapInner = new THREE.Mesh(flapGeo, track(paperMaterial(liner, { side: THREE.BackSide })))
  flap.add(flapOuter, flapInner)
  envelope.add(flap)

  // wax seal on the flap tip
  const { map: sealMap, bumpMap: sealBump } = sealTextures(renderer, intro, couple)
  track(sealMap, sealBump)
  const sealGeo = track(waxSealGeometry(0.34))
  const sealSide = track(new THREE.MeshStandardMaterial({ color: intro.seal, roughness: 0.38, metalness: 0.05 }))
  const sealFace = track(
    new THREE.MeshStandardMaterial({ map: sealMap, bumpMap: sealBump, bumpScale: 2.2, roughness: 0.32, metalness: 0.05 }),
  )
  const seal = new THREE.Mesh(sealGeo, [sealSide, sealFace, sealSide])
  seal.position.set(0, -H * FLAP + 0.4, 0.05)
  flap.add(seal)

  // soft drop shadow on the backdrop
  const shadow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(W * 1.5, H * 1.6)),
    track(
      new THREE.MeshBasicMaterial({ map: track(shadowTexture(renderer)), transparent: true, depthWrite: false, opacity: 0.32 }),
    ),
  )
  shadow.position.set(0.12, -0.22, -0.9)
  envelope.add(shadow)

  /* --------------------------------------------------------- particles */
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const particles = createParticles(renderer, intro, particleCount ?? (small ? 36 : 70))
  track(particles.mesh.geometry, particles.mesh.material, particles.mesh.material.map)
  scene.add(particles.mesh)

  /* ------------------------------------------------------------ layout */
  const view = { w: 1, h: 1 }
  let baseZ = 9
  const resize = () => {
    const width = host.clientWidth || window.innerWidth
    const height = host.clientHeight || window.innerHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // keep the envelope comfortably inside the viewport on any aspect ratio
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const zForWidth = (W * (camera.aspect < 0.8 ? 1.2 : 1.45)) / (2 * tan * camera.aspect)
    const zForHeight = (H * 2.1) / (2 * tan)
    baseZ = Math.max(zForWidth, zForHeight)
    if (!state.opening) camera.position.z = baseZ
    camera.updateProjectionMatrix()
    view.h = 2 * tan * baseZ
    view.w = view.h * camera.aspect
    // lift the envelope a touch so the button below has room
    if (!state.opening) root.position.y = view.h * 0.04
  }

  /* ------------------------------------------------------------- state */
  const state = { opening: false, burst: 0, pointerX: 0, pointerY: 0, intro: 0 }
  resize()

  // entrance: the envelope drifts in from below and settles
  envelope.position.y = -0.6
  envelope.rotation.x = -0.35
  card.position.y = -0.62
  card.rotation.x = -0.35
  const entrance = gsap.timeline()
  entrance
    .to(state, { intro: 1, duration: 1.6, ease: 'power3.out' }, 0)
    .to([envelope.position, card.position], { y: (i) => (i ? -0.02 : 0), duration: 1.6, ease: 'power3.out' }, 0)
    .to([envelope.rotation, card.rotation], { x: 0, duration: 1.8, ease: 'power3.out' }, 0)

  /* -------------------------------------------------------------- loop */
  const clock = new THREE.Clock()
  let raf = 0
  let running = true
  const frame = () => {
    raf = requestAnimationFrame(frame)
    if (!running) return
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    if (!state.opening) {
      root.rotation.y += (state.pointerX * 0.32 - root.rotation.y) * 0.06
      root.rotation.x += (-state.pointerY * 0.22 - root.rotation.x) * 0.06
      root.rotation.z = Math.sin(t * 0.6) * 0.015
      root.position.y = view.h * 0.04 + Math.sin(t * 0.9) * 0.05
    }
    state.burst *= 0.96
    particles.update(dt, t, state.burst)
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  const onVisibility = () => {
    running = document.visibilityState === 'visible'
    clock.getDelta()
  }
  document.addEventListener('visibilitychange', onVisibility)
  const observer = new ResizeObserver(resize)
  observer.observe(host)

  /* -------------------------------------------------------------- open */
  let timeline = null
  const open = () => {
    if (state.opening) return
    state.opening = true
    entrance.progress(1).kill()
    state.burst = 1

    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      // settle the tilt
      .to(root.rotation, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(root.position, { y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      // break the seal
      .to(seal.scale, { x: 1.18, y: 1.18, z: 1.18, duration: 0.16, ease: 'power2.out' }, 0.05)
      .to(seal.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.32, ease: 'back.in(2)' }, 0.21)
      .to(seal.rotation, { z: 0.9, duration: 0.48, ease: 'power2.in' }, 0.05)
      // swing the flap open; once past vertical it tucks behind the card
      .to(
        flap.rotation,
        {
          x: Math.PI,
          duration: 0.95,
          ease: 'power2.inOut',
          onUpdate: () => {
            flap.position.z = flap.rotation.x > Math.PI / 2 ? -0.004 : 0.036
          },
        },
        0.4,
      )
      // slide the card out
      .to(card.position, { y: H * 0.78, duration: 0.95, ease: 'power3.out' }, 1.15)
      // drop the envelope away and bring the card to the camera
      .to(envelope.position, { y: -view.h * 1.1, duration: 1.0, ease: 'power3.in' }, 1.95)
      .to(envelope.rotation, { x: -0.5, duration: 1.0, ease: 'power2.in' }, 1.95)
      .to(card.position, { y: 0, z: 0.6, duration: 1.0, ease: 'power3.inOut' }, 2.0)
      .to(card.rotation, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' }, 2.0)
      .to(
        camera.position,
        {
          // dolly in until the card covers the viewport
          z: () => {
            const fitH = cardH / (2 * tan)
            const fitW = cardW / (2 * tan * camera.aspect)
            return Math.min(fitH, fitW) * 0.92 + 0.6
          },
          duration: 1.05,
          ease: 'power3.inOut',
        },
        2.4,
      )
  }

  const skip = () => {
    if (timeline) timeline.progress(1)
    else onOpened?.()
  }

  const setPointer = (x, y) => {
    state.pointerX = x
    state.pointerY = y
  }

  const dispose = () => {
    cancelAnimationFrame(raf)
    entrance.kill()
    timeline?.kill()
    document.removeEventListener('visibilitychange', onVisibility)
    observer.disconnect()
    disposables.forEach((item) => item?.dispose?.())
    renderer.dispose()
    renderer.domElement.remove()
  }

  return { open, skip, setPointer, dispose }
}
