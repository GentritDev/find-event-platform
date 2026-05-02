import { createContext, useContext, useState, useCallback } from 'react'
import translations from './translations'

const I18nContext = createContext(null)

const DEFAULT_LANG = 'en'

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || DEFAULT_LANG
  })

  const switchLang = useCallback((newLang) => {
    setLang(newLang)
    localStorage.setItem('lang', newLang)
  }, [])

  const t = useCallback(
    (key) => {
      const keys = key.split('.')
      let value = translations[lang]
      for (const k of keys) {
        if (value == null) return key
        value = value[k]
      }
      return value ?? key
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
