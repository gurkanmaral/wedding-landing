// Kapadokya: the painted Göreme valley with real 3D balloons. Tapping fires
// the burner of the big balloon in front; it climbs out of the top of the
// frame and leaves exactly the view the page opens on, so the intro dissolves
// straight into the hero.
import * as THREE from 'three'
import { gsap } from 'gsap'
import { createStage } from '../core.js'
import { buildBalloon, buildBalloonSky, flameTexture } from '../../../templates/kapadokya/balloons.js'
import { paintLandscape } from '../../../templates/kapadokya/landscape.js'

export const fonts = () => []

export const copy = {
  en: { prompt: 'Light the burner — tap to lift off' },
  tr: { prompt: 'Brülörü yak — havalanmak için dokunun' },
}

export default function create(host, template, { onOpened, setCaption }) {
  // painted layers + sky, built as DOM inside the host
  const root = document.createElement('div')
  root.className = 'kap-intro'
  root.innerHTML = `
    <canvas class="kap-intro__layer kap-intro__sky"></canvas>
    <canvas class="kap-intro__layer"></canvas>
    <div class="kap-intro__layer"></div>
    <canvas class="kap-intro__layer"></canvas>
    <style>
      .kap-intro { position:absolute; inset:0; overflow:hidden; background:#62cfe6; }
      .kap-intro__layer { position:absolute; inset:0; width:100%; height:100%; }
      /* same overscan as the page hero's parallax layers, so the frames line up */
      .kap-intro > :nth-child(1) { transform: scale(1.01); }
      .kap-intro > :nth-child(2) { transform: scale(1.02); }
      .kap-intro > :nth-child(4) { transform: scale(1.03); }
    </style>
  `
  host.appendChild(root)
  const [sky, back, balloonHost, front] = root.children
  paintLandscape(back, front, { width: root.clientWidth, height: root.clientHeight, dpr: Math.min(window.devicePixelRatio || 1, 2), sky })

  const stage = createStage(balloonHost, { fov: 40, cameraZ: 30 })
  const { renderer, scene, camera } = stage
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  // the same sky as the page hero (KapadokyaHero), so the handover is seamless
  const balloonSky = buildBalloonSky(stage, { count: small ? 12 : 22 })

  const hero = buildBalloon(renderer, ['#d7262e', '#f6b21b', '#f08a24', '#8c1d2a'], 'zigzag', flameTexture(renderer))
  scene.add(hero.group)

  const rig = { lift: 0, burn: 0, drift: 0, base: new THREE.Vector3() }
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
    hero.group.position.set(rig.base.x + Math.sin(t * 0.3) * 0.15 + px * 0.3 + rig.drift, rig.base.y + Math.sin(t * 0.9) * 0.12 + rig.lift, rig.base.z)
    hero.group.rotation.y = Math.sin(t * 0.25) * 0.15
    const flicker = 0.75 + Math.sin(t * 37) * 0.15 + Math.sin(t * 53) * 0.1
    hero.flame.material.opacity = rig.burn * flicker
    hero.flame.scale.set(0.3 + rig.burn * 0.15, 0.6 + rig.burn * 0.5 * flicker, 1)
    hero.envelope.material.emissiveIntensity = rig.burn * 0.35 * flicker
  })

  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(rig, { burn: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .call(() => setCaption?.('date', 'top'), null, 0.6)
      .to(rig, { lift: 9, duration: 3.6, ease: 'power2.in' }, 0.35)
      .to(rig, { drift: 1.5, duration: 3.6, ease: 'sine.inOut' }, 0.35)
      .to(rig, { burn: 0.4, duration: 0.8 }, 1.6)
      .call(() => setCaption?.(null), null, 3.2)
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
