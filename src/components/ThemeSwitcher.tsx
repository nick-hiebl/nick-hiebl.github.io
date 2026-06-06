import { useState } from 'react'

import './themeSwitcher.css'

type Schemes = 'light' | 'dark' | 'auto'

export const getCurrentTheme = (): Schemes => {
    const theme = document.documentElement.style.getPropertyValue('color-scheme')

    if (theme === 'light' || theme === 'dark') {
        return theme
    }

    return 'auto'
}

export const getLightOrDarkMode = (): 'light' | 'dark' => {
    const theme = getCurrentTheme()

    if (theme === 'light' || theme === 'dark') {
        return theme
    }

    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const setPageTheme = (theme: 'light' | 'dark' | 'auto') => {
    const scheme = theme === 'auto' ? 'light dark' : theme

    document.documentElement.style.setProperty('color-scheme', scheme)
}

const THEMES = [
    {
        name: 'light',
        id: 'light',
        value: 'light' as const,
    },
    {
        name: 'dark',
        id: 'dark',
        value: 'dark' as const,
    },
    {
        name: 'auto',
        id: 'auto',
        value: 'auto' as const,
    },
]

export const ThemeSwitcher = () => {
    const [theme, setTheme] = useState<Schemes>(getCurrentTheme())

    return (
        <div className="button-group">
            {THEMES.map(({ name, id, value }) => (
                <button
                    key={id}
                    className="link"
                    style={theme === value ? { color: 'var(--accent)' } : undefined}
                    onClick={() => {
                        setTheme(value)
                        setPageTheme(value)

                        if (value === 'auto') {
                            localStorage.removeItem('color-theme')
                        } else {
                            localStorage.setItem('color-theme', value)
                        }
                    }}
                >
                    {name}
                </button>
            ))}
        </div>
    )
}
