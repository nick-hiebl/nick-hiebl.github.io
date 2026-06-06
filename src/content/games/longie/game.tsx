import { useRef, useState, type CSSProperties } from 'react'

import { getLightOrDarkMode } from '../../../components/ThemeSwitcher.tsx'

import { getDailyConfig, type GameConfig } from './randomisation.ts'

import './style.css'

type DistanceText = 'Cold' | 'Boiling' | 'Hot' | 'Warm' | '🎉🎉🎉'

const DISTANCE_COLORS: Record<DistanceText, string> = {
    '🎉🎉🎉': 'light-dark(#94f9ad, #00b000)',
    Cold: 'light-dark(#99bbff, #1155cc)',
    Boiling: 'light-dark(#ff7777, #cc0000)',
    Hot: 'light-dark(#ffaa66, #c66600)',
    Warm: 'light-dark(#cccccc, #555555)',
}

const DISTANCE_TEXT_COLORS: Record<DistanceText, string> = {
    '🎉🎉🎉': 'light-dark(black, black)',
    Cold: 'light-dark(black, white)',
    Boiling: 'light-dark(black, white)',
    Hot: 'light-dark(black, white)',
    Warm: 'light-dark(black, white)',
}

type DistanceColor = '#94f9ad' | '#ff7777' | '#ffaa66' | '#cccccc' | '#99bbff'

type Rating = {
    value: number
    direction: '⬆️' | '⬇️' | '🎉'
    distanceText: `${'⬆️' | '⬇️'} ${DistanceText}` | '🎉🎉🎉'
    distanceValue: DistanceText
}

const rateDistance = (value: number, target: number): Rating => {
    const difference = value - target

    if (difference === 0) {
        return {
            value,
            direction: '🎉',
            distanceText: '🎉🎉🎉',
            distanceValue: '🎉🎉🎉',
        }
    }

    const direction = difference < 0 ? '⬆️' : '⬇️'

    const absDistance = Math.abs(difference)

    let distanceText: DistanceText = 'Cold'
    let distanceColor: DistanceColor = '#99bbff'

    if (absDistance <= 3) {
        distanceText = 'Boiling'
        distanceColor = '#ff7777'
    } else if (absDistance <= 8) {
        distanceText = 'Hot'
        distanceColor = '#ffaa66'
    } else if (absDistance <= 12) {
        distanceText = 'Warm'
        distanceColor = '#cccccc'
    }

    return {
        value,
        direction,
        distanceText: `${direction} ${distanceText}`,
        distanceValue: distanceText,
    }
}

const createCopyText = (guesses: Rating[]): string => {
    return `#Longie #${dayNumber} ${guesses.length}/${MAX_GUESSES}
${guesses.map(guess => guess.direction).join('')}
https://site.jumpoy.com/games/longie/`
}

const drawCanvas = (canvas: HTMLCanvasElement | null, config: GameConfig) => {
    if (!canvas) {
        return
    }

    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return
    }

    const midpoint = Math.floor(canvas.width / 2)
    const lightOrDark = getLightOrDarkMode()
    ctx.fillStyle = lightOrDark === 'light' ? 'black' : 'white'

    const refLength = 100
    const refLeft = midpoint - Math.ceil(refLength / 2)

    ctx.fillRect(refLeft, 40, refLength, 1)
    ctx.fillRect(refLeft, 40, 1, 4)
    ctx.fillRect(refLeft + refLength - 1, 40, 1, 4)

    ctx.fillStyle = 'red'

    const length = config.length
    const realLeft = midpoint - Math.ceil(length / 2)

    ctx.fillRect(realLeft, 60, length, 6)
}

const Guess = (props: Rating) => {
    const isCorrect = props.distanceValue === '🎉🎉🎉'
    const isDarkMode = getLightOrDarkMode() === 'dark'

    return (
        <li
            className={isCorrect ? 'guess correct' : 'guess'}
            style={{
                backgroundColor: DISTANCE_COLORS[props.distanceValue],
                color: DISTANCE_TEXT_COLORS[props.distanceValue],
            }}
        >
            {props.value}
            {': '}
            <span className={isDarkMode && isCorrect ? 'emoji-deglare' : undefined}>
                {props.distanceText}
            </span>
        </li>
    )
}

const FIRST_DATE = new Date('2026-02-13')
FIRST_DATE.setHours(0, 0, 0, 0)
const DAY_MILLISECONDS = 24 * 60 * 60 * 1000

const MAX_GUESSES = 8

const currentDate = new Date()

const dayNumber = Math.floor((currentDate.valueOf() - FIRST_DATE.valueOf()) / DAY_MILLISECONDS) + 1

const CONFETTI_ARRANGEMENT = new Array(10).fill(0)
    .map(() => {
        const angle = Math.random() * 2 * Math.PI
        const radius = Math.random() * 32 + 16

        return {
            x: Math.sin(angle) * radius,
            y: Math.cos(angle) * radius,
        }
    })

const ConfettiBlast = () => (
    <div id="confetti-target">
        {CONFETTI_ARRANGEMENT.map((pos, index) => (
            <div
                key={index}
                className="confetti"
                style={{ '--target-x': `${pos.x}px`, '--target-y': `${pos.y}px` } as CSSProperties}
            >
                🎉
            </div>
        ))}
    </div>
)

const PostGuessList = ({ guesses }: { guesses: Rating[] }) => (
    <ul className="post-guess-list">
        {guesses.map((guess, index) => (
            <li key={index} style={{ position: 'relative' }}>
                {guess.direction === '🎉' && <ConfettiBlast />}
                <div
                    className="post-guess"
                    style={{ animationDelay: `${index * 120}ms` }}
                >
                    {guess.direction}
                </div>
            </li>
        ))}
    </ul>
)

export const Game = () => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [inputText, setInputText] = useState('')
    const [config] = useState(getDailyConfig(new Date()))
    const [isDone, setDone] = useState(false)
    const [copies, setCopies] = useState(0)

    const [guesses, setGuesses] = useState<Rating[]>([])

    const lightOrDark = getLightOrDarkMode()

    const onSubmitGuess = (value: number) => {
        setGuesses(current => current.concat(rateDistance(value, config.length)))

        if (value === config.length) {
            setDone(true)
        }
    }

    const trySubmittingGuess = () => {
        const value = parseInt(inputText, 10)

        setInputText('')

        if (isNaN(value) || value <= 0 || value >= 200) {
            return
        }

        onSubmitGuess(value)
    }

    return (
        <section className="longie-main">
            <h1>Longie</h1>
            {isDone && (
                <div className="block">
                    <h2>You got it!</h2>
                    <div>Your guesses: {guesses.length} / {MAX_GUESSES}</div>
                    <PostGuessList guesses={guesses} />
                    <button
                        onClick={() => {
                            setCopies(c => c + 1)

                            navigator.clipboard.writeText(createCopyText(guesses))

                            if (timeoutRef.current) {
                                clearTimeout(timeoutRef.current)
                            }

                            timeoutRef.current = setTimeout(() => {
                                setCopies(0)
                            }, 1000)
                        }}
                    >
                        {copies > 0 ? 'Copied' + '!'.repeat(copies) : 'Copy'}
                    </button>
                </div>
            )}
            <canvas
                id="canvas"
                width="250"
                height="120"
                ref={canvas => drawCanvas(canvas, config)}
            />
            <div>
                The {lightOrDark === 'light' ? 'black' : 'white'} reference line above is 100 pixels long.
            </div>
            <div className="flex-row">
                Guess the length of the red bar in pixels:
                <input
                    type="text"
                    name="longie-guess"
                    value={inputText}
                    placeholder="100"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={e => {
                        setInputText(e.currentTarget.value)
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            trySubmittingGuess()
                        }
                    }}
                    disabled={isDone}
                />
                <button
                    onClick={() => {
                        trySubmittingGuess()
                    }}
                    disabled={isDone}
                >
                    Guess
                </button>
            </div>
            <div>Guesses made: {guesses.length} / {MAX_GUESSES}</div>
            <ul className="guess-list">
                {guesses.map((guess, index) => <Guess key={index} {...guess} />)}
            </ul>
        </section>
    )
}
