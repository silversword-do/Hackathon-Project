import { createContext, useContext, useState, useEffect } from 'react'

const FontContext = createContext()

const FONT_OPTIONS = [
  { value: 'default', label: 'Default', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { value: 'arial', label: 'Arial', family: 'Arial, sans-serif' },
  { value: 'times', label: 'Times New Roman', family: '"Times New Roman", Times, serif' },
  { value: 'courier', label: 'Courier New', family: '"Courier New", Courier, monospace' },
  { value: 'georgia', label: 'Georgia', family: 'Georgia, serif' },
  { value: 'verdana', label: 'Verdana', family: 'Verdana, sans-serif' },
  { value: 'comic', label: 'Comic Sans MS', family: '"Comic Sans MS", cursive' },
  { value: 'impact', label: 'Impact', family: 'Impact, sans-serif' }
]

export function FontProvider({ children }) {
  const [fontStyle, setFontStyle] = useState(() => {
    // Load font from localStorage or default to 'comic' (Comic Sans)
    const savedFont = localStorage.getItem('fontStyle')
    return savedFont || 'comic'
  })

  useEffect(() => {
    // Save font to localStorage
    localStorage.setItem('fontStyle', fontStyle)
    
    // Apply font to document
    const fontOption = FONT_OPTIONS.find(f => f.value === fontStyle) || FONT_OPTIONS[0]
    document.documentElement.style.setProperty('--app-font-family', fontOption.family)
  }, [fontStyle])

  const value = {
    fontStyle,
    setFontStyle,
    fontOptions: FONT_OPTIONS
  }

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>
}

export function useFont() {
  const context = useContext(FontContext)
  if (!context) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}

