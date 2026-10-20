// The original wax-sealed envelope, kept as a scene for templates that want it.
import { createEnvelopeScene } from '../envelopeScene.js'

export const fonts = (template) => [
  { family: template.intro.font, weight: template.intro.fontWeight, style: template.intro.fontStyle, google: template.intro.googleFont },
  { family: 'Italianno' },
]

export const copy = {
  en: { prompt: 'Tap the envelope', open: 'Open the invitation' },
  tr: { prompt: 'Zarfa dokunun', open: 'Davetiyeyi aç' },
}

export default function create(host, template, { onOpened }) {
  return createEnvelopeScene(host, template, { onOpened })
}
