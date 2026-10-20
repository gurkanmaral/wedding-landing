// Kapadokya: the painted dawn valley with real 3D balloons. Tapping fires the
// burner of the couple's balloon; it lifts off with a banner carrying their
// names while the painted valley sinks away below.
import * as THREE from 'three'
import { gsap } from 'gsap'
import { createStage, makeCanvas, canvasTexture } from '../core.js'
import { buildBalloon, buildBalloonSky, flameTexture } from '../../../templates/kapadokya/balloons.js'
import { paintLandscape } from '../../../templates/kapadokya/landscape.js'

export const fonts = () => [{ family: 'Great Vibes', google: 'Great+Vibes' }]

export const copy = {
  en: { prompt: 'Light the burner — tap to lift off' },
  tr: { prompt: 'Brülörü yak — havalanmak için dokunun' },
}

function bannerTexture(renderer, names) {
  const [canvas, ctx] = makeCanvas(1024, 360)
  ctx.fillStyle = '#f7efe2'
  ctx.fillRect(0, 0, 1024, 360)
  for (let y = 0; y < 360; y += 4) {
    ctx.fillStyle = `rgba(120,90,60,${y % 8 ? 0.03 : 0.06})`
    ctx.fillRect(0, y, 1024, 1)
  }
  ctx.strokeStyle = '#b8573c'
  ctx.lineWidth = 6
  ctx.strokeRect(22, 22, 980, 316)
  ctx.lineWidth = 2
  ctx.strokeRect(36, 36, 952, 288)
  ctx.fillStyle = '#3a2e2a'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = 150
  ctx.font = `${size}px "Great Vibes", cursive`
  while (ctx.measureText(names).width > 900 && size > 60) {
    size -= 6
    ctx.font = `${size}px "Great Vibes", cursive`
  }
  ctx.fillText(names, 512, 190)
  return canvasTexture(canvas, renderer)
}

export default function create(host, template, { onOpened, setCaption }) {
  // painted layers + sky, built as DOM inside the host
  const root = document.createElement('div')
  root.className = 'kap-intro'
  root.innerHTML = `
    <div class="kap-intro__sky"></div>
    <div class="kap-intro__sun"></div>
    <canvas class="kap-intro__layer"></canvas>
    <div class="kap-intro__layer"></div>
    <canvas class="kap-intro__layer"></canvas>
    <style>
      .kap-intro { position:absolute; inset:0; overflow:hidden; }
      .kap-intro__sky { position:absolute; inset:-40% 0 0; background:linear-gradient(180deg,#2f3156 0%,#474a6e 30%,#8e6e8c 52%,#df9c86 68%,#f6c9a6 78%,#f8dcc0 100%); }
      .kap-intro__sun { position:absolute; left:28%; top:42%; width:min(60vw,560px); aspect-ratio:1; transform:translate(-50%,-50%); border-radius:50%;
        background:radial-gradient(circle,#fff7e2 0%,#ffe2b0 14%,rgb(255 205 150 / .45) 34%,transparent 68%); }
      .kap-intro__layer { position:absolute; inset:0; width:100%; height:100%; }
    </style>
  `
  host.appendChild(root)
  const [sky, sun, back, balloonHost, front] = root.children
  paintLandscape(back, front, { width: root.clientWidth, height: root.clientHeight, dpr: Math.min(window.devicePixelRatio || 1, 2) })

  const stage = createStage(balloonHost, { fov: 40, cameraZ: 30 })
  const { renderer, scene, camera } = stage
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const balloonSky = buildBalloonSky(stage, { count: small ? 10 : 18, seed: 23 })

  const hero = buildBalloon(renderer, ['#b8573c', '#f7efe2', '#c9a227'], 'band', flameTexture(renderer))
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 0.74),
    new THREE.MeshStandardMaterial({
      map: stage.track(bannerTexture(renderer, `${template.couple[0]} & ${template.couple[1]}`)),
      side: THREE.DoubleSide,
      roughness: 0.85,
      transparent: true,
      opacity: 0,
    }),
  )
  banner.position.set(0, -1.25, 0.2)
  const ropes = new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.15, -0.75, 0.17),
      new THREE.Vector3(-1.0, -0.88, 0.2),
      new THREE.Vector3(0.15, -0.75, 0.17),
      new THREE.Vector3(1.0, -0.88, 0.2),
    ]),
    new THREE.LineBasicMaterial({ color: '#3b2b20', transparent: true, opacity: 0 }),
  )
  hero.group.add(banner, ropes)
  scene.add(hero.group)

  const rig = { lift: 0, burn: 0, sink: 0, base: new THREE.Vector3() }
  stage.onResize((view) => {
    balloonSky.place()
    const portrait = view.aspect < 0.9
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - 12)
    hero.group.scale.setScalar(portrait ? 2.1 : 2.6)
    rig.base.set(portrait ? 0 : h * view.aspect * 0.18, -h * 0.28, 12)
  })

  let px = 0
  stage.onFrame((dt, t) => {
    balloonSky.update(dt, t)
    hero.group.position.set(rig.base.x + Math.sin(t * 0.3) * 0.15 + px * 0.3, rig.base.y + Math.sin(t * 0.9) * 0.12 + rig.lift, rig.base.z)
    hero.group.rotation.y = Math.sin(t * 0.25) * 0.15
    const flicker = 0.75 + Math.sin(t * 37) * 0.15 + Math.sin(t * 53) * 0.1
    hero.flame.material.opacity = rig.burn * flicker
    hero.flame.scale.set(0.3 + rig.burn * 0.15, 0.6 + rig.burn * 0.5 * flicker, 1)
    hero.envelope.material.emissiveIntensity = rig.burn * 0.35 * flicker
    // the valley sinks as we climb; far layers move less (parallax)
    const H = root.clientHeight
    back.style.transform = `translateY(${rig.sink * H * 0.35}px)`
    front.style.transform = `translateY(${rig.sink * H * 0.75}px)`
    sun.style.transform = `translate(-50%, calc(-50% + ${rig.sink * H * 0.25}px))`
    sky.style.transform = `translateY(${rig.sink * H * 0.15}px)`
    balloonHost.style.transform = `translateY(${rig.sink * H * 0.22}px)`
  })

  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(rig, { burn: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .to(rig, { lift: 2.2, duration: 4.6, ease: 'power1.inOut' }, 0.3)
      .to(rig, { sink: 1, duration: 4.6, ease: 'power2.inOut' }, 0.4)
      .to([banner.material, ropes.material], { opacity: 1, duration: 0.8 }, 1)
      .call(() => setCaption?.('date', 'top'), null, 1.8)
      .to(rig, { burn: 0.25, duration: 0.6 }, 2.8)
      .call(() => setCaption?.(null), null, 4.6)
  }

  return {
    open,
    skip: () => (timeline ? timeline.progress(1) : onOpened?.()),
    setPointer: (x) => {
      px = x
    },
    dispose: () => {
      timeline?.kill()
      stage.dispose()
      root.remove()
    },
  }
}
