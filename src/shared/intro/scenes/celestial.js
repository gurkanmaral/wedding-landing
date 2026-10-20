// Celestial: a full-screen night sky. Tapping sends a shooting star across it;
// the dust it sheds settles into the couple's names, then the sky rushes past.
import { gsap } from 'gsap'
import { createStage, makeCanvas, canvasTexture, seeded } from '../core.js'

export const fonts = () => [{ family: 'Great Vibes', google: 'Great+Vibes' }]

export const copy = {
  en: { prompt: 'Make a wish — tap the sky', open: 'Make a wish' },
  tr: { prompt: 'Bir dilek tut — gökyüzüne dokun', open: 'Dilek tut' },
}

function glowTexture(stage) {
  const [canvas, ctx] = makeCanvas(128, 128)
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.15, 'rgba(255,244,214,0.9)')
  g.addColorStop(0.45, 'rgba(231,189,103,0.25)')
  g.addColorStop(1, 'rgba(231,189,103,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return stage.track(canvasTexture(canvas, stage.renderer))
}

function nebulaTexture(stage) {
  const [canvas, ctx] = makeCanvas(1024, 512)
  const random = seeded(17)
  const colors = ['rgba(120,140,255,', 'rgba(190,150,255,', 'rgba(255,214,160,', 'rgba(140,200,255,']
  for (let i = 0; i < 260; i += 1) {
    const x = random() * 1024
    // keep the band along the middle with a soft falloff
    const y = 256 + (random() - 0.5) * 220 * random()
    const r = 20 + random() * 110
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const c = colors[i % colors.length]
    g.addColorStop(0, `${c}${0.05 + random() * 0.07})`)
    g.addColorStop(1, `${c}0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  for (let i = 0; i < 1800; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${random() * 0.5})`
    ctx.fillRect(random() * 1024, 256 + (random() - 0.5) * 260 * random(), 1, 1)
  }
  // feather every edge so the band never shows its rectangle
  ctx.globalCompositeOperation = 'destination-in'
  const fadeX = ctx.createLinearGradient(0, 0, 1024, 0)
  fadeX.addColorStop(0, 'rgba(0,0,0,0)')
  fadeX.addColorStop(0.25, 'rgba(0,0,0,1)')
  fadeX.addColorStop(0.75, 'rgba(0,0,0,1)')
  fadeX.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = fadeX
  ctx.fillRect(0, 0, 1024, 512)
  const fadeY = ctx.createLinearGradient(0, 0, 0, 512)
  fadeY.addColorStop(0, 'rgba(0,0,0,0)')
  fadeY.addColorStop(0.3, 'rgba(0,0,0,1)')
  fadeY.addColorStop(0.7, 'rgba(0,0,0,1)')
  fadeY.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = fadeY
  ctx.fillRect(0, 0, 1024, 512)
  return stage.track(canvasTexture(canvas, stage.renderer))
}

// Rasterise the names in script and sample points along the glyphs.
function namePoints(names, maxPoints) {
  const fontSize = 220
  const [, ctx] = makeCanvas(2400, 420)
  ctx.font = `${fontSize}px "Great Vibes", "Italianno", cursive`
  const width = Math.min(2300, ctx.measureText(names).width)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(names, 1200, 210, 2300)
  const { data } = ctx.getImageData(0, 0, 2400, 420)
  const points = []
  for (let y = 0; y < 420; y += 3) {
    for (let x = 0; x < 2400; x += 3) {
      if (data[(y * 2400 + x) * 4 + 3] > 140) points.push([x - 1200, 210 - y])
    }
  }
  const random = seeded(points.length)
  // shuffle then trim so density stays even
  for (let i = points.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[points[i], points[j]] = [points[j], points[i]]
  }
  return { points: points.slice(0, maxPoints), width }
}

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uWarp;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    // warp: stars stream toward the camera and wrap around
    p.z = mod(p.z + 60.0 + uWarp, 70.0) - 60.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aPhase) + aPhase * 30.0);
    vAlpha = twinkle * smoothstep(-60.0, -40.0, p.z);
    gl_PointSize = aSize * uPixelRatio * (24.0 / -mv.z) * (1.0 + uWarp * 0.03);
  }
`

const pointFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha);
  }
`

const dustVertex = /* glsl */ `
  attribute vec3 aStart;
  attribute float aDelay;
  attribute float aRand;
  uniform float uTime;
  uniform float uDur;
  uniform float uScatter;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vRand;
  void main() {
    float t = clamp((uTime - aDelay) / uDur, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 3.0);
    vec3 p = mix(aStart, position, e);
    // dust falls in a little arc before settling
    p.y -= sin(t * 3.14159) * (0.6 + aRand * 0.8);
    p.x += sin(uTime * 1.3 + aRand * 40.0) * 0.012 * e;
    p.y += cos(uTime * 1.1 + aRand * 30.0) * 0.012 * e;
    // scatter toward the camera on hand-off
    p.xy *= 1.0 + uScatter * (0.6 + aRand);
    p.z += uScatter * (4.0 + aRand * 10.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = smoothstep(0.0, 0.08, t) * (1.0 - uScatter);
    vRand = aRand;
    gl_PointSize = (2.2 + aRand * 2.6) * uPixelRatio * (10.0 / -mv.z) * (1.0 + (1.0 - e) * 1.5);
  }
`

const dustFragment = /* glsl */ `
  varying float vAlpha;
  varying float vRand;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 gold = vec3(1.0, 0.86, 0.55);
    vec3 white = vec3(1.0, 0.98, 0.94);
    gl_FragColor = vec4(mix(gold, white, vRand), a * vAlpha);
  }
`

const trailVertex = /* glsl */ `
  attribute float aAge;
  uniform float uPixelRatio;
  varying float vAge;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vAge = aAge;
    gl_PointSize = (1.0 - aAge) * 26.0 * uPixelRatio * (10.0 / -mv.z);
  }
`

const trailFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vAge;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * pow(1.0 - vAge, 1.6) * uOpacity;
    gl_FragColor = vec4(mix(vec3(1.0, 0.97, 0.88), vec3(0.9, 0.7, 0.35), vAge), a);
  }
`

export default function create(host, template, { onOpened, setCaption }) {
  const stage = createStage(host, { fov: 50, cameraZ: 10 })
  const { THREE, scene, camera, renderer } = stage
  const pixelRatio = renderer.getPixelRatio()
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }

  /* ------------------------------------------------------------ sky */
  const nebula = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 30),
    new THREE.MeshBasicMaterial({ map: nebulaTexture(stage), ...additive, opacity: 0.55 }),
  )
  nebula.position.z = -40
  nebula.rotation.z = -0.42
  scene.add(nebula)

  const starCount = small ? 1600 : 3200
  const starGeo = new THREE.BufferGeometry()
  const random = seeded(7)
  const pos = new Float32Array(starCount * 3)
  const size = new Float32Array(starCount)
  const phase = new Float32Array(starCount)
  for (let i = 0; i < starCount; i += 1) {
    pos[i * 3] = (random() - 0.5) * 90
    pos[i * 3 + 1] = (random() - 0.5) * 60
    pos[i * 3 + 2] = -60 + random() * 70
    size[i] = random() < 0.04 ? 4 + random() * 4 : 1 + random() * 2
    phase[i] = random()
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  const starMat = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: pointFragment,
    uniforms: { uTime: { value: 0 }, uWarp: { value: 0 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color('#fff8e8') } },
    ...additive,
  })
  scene.add(new THREE.Points(starGeo, starMat))

  /* --------------------------------------------------------- meteor */
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(stage), ...additive, opacity: 0 }))
  head.scale.setScalar(1.1)
  scene.add(head)

  const TRAIL = 70
  const trailGeo = new THREE.BufferGeometry()
  const trailPos = new Float32Array(TRAIL * 3)
  const trailAge = new Float32Array(TRAIL)
  for (let i = 0; i < TRAIL; i += 1) trailAge[i] = i / (TRAIL - 1)
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3))
  trailGeo.setAttribute('aAge', new THREE.BufferAttribute(trailAge, 1))
  const trailMat = new THREE.ShaderMaterial({
    vertexShader: trailVertex,
    fragmentShader: trailFragment,
    uniforms: { uPixelRatio: { value: pixelRatio }, uOpacity: { value: 0 } },
    ...additive,
  })
  const trail = new THREE.Points(trailGeo, trailMat)
  trail.frustumCulled = false
  scene.add(trail)
  const history = []

  /* ----------------------------------------------------------- names */
  const names = `${template.couple[0]} & ${template.couple[1]}`
  const { points, width: textWidth } = namePoints(names, small ? 2600 : 4200)
  const dustGeo = new THREE.BufferGeometry()
  const n = points.length
  const target = new Float32Array(n * 3)
  const start = new Float32Array(n * 3)
  const delay = new Float32Array(n)
  const rand = new Float32Array(n)
  dustGeo.setAttribute('position', new THREE.BufferAttribute(target, 3))
  dustGeo.setAttribute('aStart', new THREE.BufferAttribute(start, 3))
  dustGeo.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1))
  dustGeo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
  const dustMat = new THREE.ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    uniforms: {
      uTime: { value: -100 },
      uDur: { value: 1.5 },
      uScatter: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    ...additive,
  })
  const dust = new THREE.Points(dustGeo, dustMat)
  dust.frustumCulled = false
  dust.visible = false
  scene.add(dust)

  // meteor path, recomputed on resize so it always crosses the screen
  const METEOR_TIME = 1.5
  const path = { from: new THREE.Vector3(), to: new THREE.Vector3() }
  const pathAt = (u, out = new THREE.Vector3()) => out.lerpVectors(path.from, path.to, u)

  const layout = () => {
    const { width, height } = stage.visibleSize(10)
    const nameWidth = Math.min(width * 0.86, height * 1.6)
    const scale = nameWidth / Math.max(textWidth, 1)
    const nameY = height * 0.08
    path.from.set(-width * 0.62, nameY + height * 0.32, 0)
    path.to.set(width * 0.62, nameY - height * 0.02, 0)
    const r = seeded(3)
    for (let i = 0; i < n; i += 1) {
      const [x, y] = points[i]
      const tx = x * scale
      const ty = nameY + y * scale
      target.set([tx, ty, 0], i * 3)
      // each grain leaves the meteor as it passes over its x position
      const u = THREE.MathUtils.clamp((tx - path.from.x) / (path.to.x - path.from.x), 0, 1)
      const p = pathAt(u)
      start.set([p.x + (r() - 0.5) * 0.3, p.y + (r() - 0.5) * 0.3, (r() - 0.5) * 0.6], i * 3)
      delay[i] = u * METEOR_TIME * 0.9 + r() * 0.35
      rand[i] = r()
    }
    dustGeo.attributes.position.needsUpdate = true
    dustGeo.attributes.aStart.needsUpdate = true
    dustGeo.attributes.aDelay.needsUpdate = true
    dustGeo.attributes.aRand.needsUpdate = true
  }
  stage.onResize(layout)

  /* -------------------------------------------------------- backdrop */
  // The page hero's own night gradient (and its darker foot) settles over the
  // warp at the end; the page then brings its own stars and moon in on top.
  const backdrop = document.createElement('div')
  backdrop.setAttribute('aria-hidden', 'true')
  backdrop.style.cssText = [
    'position:absolute;left:0;top:0;bottom:0;width:100%;opacity:0;pointer-events:none',
    'background:linear-gradient(180deg,transparent 66%,oklch(0.10 0.03 268 / .56)),' +
      'radial-gradient(70% 46% at 50% 8%,oklch(0.42 0.06 268 / .22),transparent 72%),' +
      'radial-gradient(90% 60% at 50% 118%,oklch(0.30 0.06 300 / .32),transparent 64%),' +
      'linear-gradient(180deg,oklch(0.16 0.045 266),oklch(0.13 0.035 268))',
  ].join(';')
  host.appendChild(backdrop)
  // the page's hero is as wide as the viewport minus its scrollbar gutter
  stage.onResize(({ width }) => {
    backdrop.style.width = `${Math.min(width, document.documentElement.clientWidth || width)}px`
  })

  /* ------------------------------------------------------------ loop */
  const state = { px: 0, py: 0, meteor: -1, sequence: -1, warp: 0 }
  const headPos = new THREE.Vector3()
  stage.onFrame((dt, t) => {
    starMat.uniforms.uTime.value = t
    starMat.uniforms.uWarp.value = state.warp
    camera.position.x += (state.px * 0.6 - camera.position.x) * 0.04
    camera.position.y += (-state.py * 0.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0, -10)

    if (state.sequence >= 0) {
      state.sequence += dt
      dustMat.uniforms.uTime.value = state.sequence
    }
    if (state.meteor >= 0) {
      state.meteor += dt
      const u = Math.min(state.meteor / METEOR_TIME, 1.25)
      // ease-in so it accelerates like a real meteor
      pathAt(u * u * 0.4 + u * 0.6, headPos)
      head.position.copy(headPos)
      history.unshift(headPos.clone())
      if (history.length > TRAIL) history.pop()
      for (let i = 0; i < TRAIL; i += 1) {
        const p = history[Math.min(i, history.length - 1)]
        trailPos.set([p.x, p.y, p.z], i * 3)
      }
      trailGeo.attributes.position.needsUpdate = true
    }
  })

  /* ------------------------------------------------------------ open */
  let timeline = null
  const open = () => {
    if (timeline) return
    dust.visible = true
    state.meteor = 0
    state.sequence = 0
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(head.material, { opacity: 1, duration: 0.15 }, 0)
      .to(trailMat.uniforms.uOpacity, { value: 1, duration: 0.15 }, 0)
      .to(head.material, { opacity: 0, duration: 0.5 }, METEOR_TIME)
      .to(trailMat.uniforms.uOpacity, { value: 0, duration: 0.9 }, METEOR_TIME)
      .call(() => setCaption?.('date'), null, METEOR_TIME + 1.1)
      // hold on the names, then rush through the stars
      .to(state, { warp: 55, duration: 1.7, ease: 'power2.in' }, METEOR_TIME + 2.6)
      .to(dustMat.uniforms.uScatter, { value: 1, duration: 1.2, ease: 'power2.in' }, METEOR_TIME + 2.7)
      .call(() => setCaption?.(null), null, METEOR_TIME + 2.7)
      .to(nebula.material, { opacity: 0, duration: 1.2 }, METEOR_TIME + 2.7)
      .to(backdrop, { opacity: 1, duration: 1.2, ease: 'power1.in' }, METEOR_TIME + 3.0)
  }

  return {
    open,
    skip: () => (timeline ? timeline.progress(1) : onOpened?.()),
    setPointer: (x, y) => {
      state.px = x
      state.py = y
    },
    dispose: () => {
      timeline?.kill()
      stage.dispose()
      backdrop.remove()
    },
  }
}
