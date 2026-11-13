/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const supportedLocales = ['en', 'tr']

function detectLocale() {
  const query = new URLSearchParams(window.location.search).get('lang')?.toLowerCase()
  if (supportedLocales.includes(query)) return query
  const saved = window.localStorage.getItem('e-invitation-locale')
  if (supportedLocales.includes(saved)) return saved
  return navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale)

  const setLocale = (nextLocale) => {
    if (!supportedLocales.includes(nextLocale)) return
    setLocaleState(nextLocale)
    window.localStorage.setItem('e-invitation-locale', nextLocale)
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}

export function LanguageSwitch({ className = '' }) {
  const { locale, setLocale } = useI18n()
  return (
    <div className={`lp-language ${className}`.trim()} aria-label={locale === 'tr' ? 'Dil seçin' : 'Choose language'}>
      {supportedLocales.map((code) => (
        <button key={code} type="button" aria-pressed={locale === code} onClick={() => setLocale(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
