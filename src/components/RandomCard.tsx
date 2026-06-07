import { useEffect, useState } from 'react'

import './RandomCard.css'

type Props = {
    options: string[]
    id: string
}

export const createNums = (min: number, max: number) => {
    return new Array(max - min + 1).fill(0).map((_, index) => `${index + min} / ${max}`)
}

export const RandomCard = ({ options }: Props) => {
    const [value, setValue] = useState(options[0])
    const [isLooping, setLooping] = useState(false)

    useEffect(() => {
        if (!isLooping) {
            return
        }

        let stillGoing = true

        const update = () => {
            if (!stillGoing) {
                return
            }

            setValue(options[Math.floor(Math.random() * options.length)])

            requestAnimationFrame(update)
        }

        requestAnimationFrame(update)

        return () => {
            stillGoing = false
        }
    }, [isLooping])

    const chooseRandomValue = () => {
        setValue(options[Math.floor(Math.random() * options.length)])
    }

    return (
        <button
            className={isLooping ? 'random-card shake' : 'random-card'}
            onAnimationEnd={() => {
                setLooping(false)
                chooseRandomValue()
            }}
            onClick={() => {
                setLooping(true)
            }}
        >
            {value}
        </button>
    )
}
