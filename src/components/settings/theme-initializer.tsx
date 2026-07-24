"use client"

import { useEffect } from "react"

type ThemePreference = "system" | "dark" | "light"

export function applyTheme(theme: ThemePreference) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark))
}

function ThemeInitializer() {
  useEffect(() => {
    const saved = window.localStorage.getItem("medos-theme") as ThemePreference | null
    const theme = saved ?? "dark"
    applyTheme(theme)

    if (theme !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => applyTheme("system")
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [])

  return null
}

export { ThemeInitializer, type ThemePreference }
