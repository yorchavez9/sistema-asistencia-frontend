import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

const STORAGE_KEY = "theme"

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored || "system"
  })

  useEffect(() => {
    const root = document.documentElement
    const apply = (mode) => {
      if (mode === "dark") root.classList.add("dark")
      else root.classList.remove("dark")
    }

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      apply(mq.matches ? "dark" : "light")
      const handler = (e) => apply(e.matches ? "dark" : "light")
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }

    apply(theme)
  }, [theme])

  const setTheme = (t) => {
    localStorage.setItem(STORAGE_KEY, t)
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
