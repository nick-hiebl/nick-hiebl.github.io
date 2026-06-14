import { useEffect, useState, type ReactNode } from 'react'

import './Menu.css'

type MenuProps = {
    isOpen: boolean
    onClose: () => void
    children: ReactNode
}

export const Menu = ({ children, isOpen, onClose }: MenuProps) => {
    useEffect(() => {
        if (isOpen) {
            const onEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose()
                }
            }

            document.addEventListener('keydown', onEscape)

            return () => {
                document.removeEventListener('keydown', onEscape)
            }
        }
    }, [isOpen, onClose])

    return (
        <div id="menu" data-isopen={isOpen}>
            <button id="close-menu-button" onClick={onClose}>✕</button>
            <div className="menu-content column-list">
                {children}
            </div>
        </div>
    )
}

type Props = {
    children: ReactNode | ((controls: { onClose: () => void }) => ReactNode)
}

export const MenuTrigger = ({ children }: Props) => {
    const [isMenuOpen, setMenuOpen] = useState(false)

    return (
        <>
            <button id="menu-trigger" onClick={() => setMenuOpen(current => !current)}>☰</button>
            <Menu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)}>
                {typeof children === 'function' ? (
                    children({ onClose: () => setMenuOpen(false) })
                ) : children}
            </Menu>
        </>
    )
}
