import { useEffect, useState } from 'react'

import { useGameContext } from '../context'
import type { GameSettings } from '../types'

const TIME_LIMIT_INCREMENT_FACTOR = 15_000

export const GameSettingsMenu = () => {
    const { output, settings, socket } = useGameContext()

    const [cluesPerPlayer, setCluesPerPlayer] = useState(settings?.cluesPerPlayer ?? 1)
    const [givingCluesNum, setGivingCluesNum] = useState(settings?.readiesRequired?.['giving-clues'] ?? 1)
    const [assessingCluesNum, setAssessingCluesNum] = useState(settings?.readiesRequired?.['assessing-clues'] ?? 1)
    const [postGameNum, setPostGameNum] = useState(settings?.readiesRequired?.['post-game'] ?? 1)
    const [cluesTimerEnabled, setCluesTimerEnabled] = useState(settings?.cluesTimerEnabled ?? false)
    const [cluesTimeout, setCluesTimeout] = useState(settings?.cluesTimeout ?? 120_000)
    const [requiredClues, setRequiredClues] = useState(settings?.requiredClues ?? 10)

    const [currentLists, setLists] = useState<[string, number][]>(() => {
        const weights = settings?.wordListWeights ?? { 'default': 10 }
        const keys = Object.keys(weights)

        return keys.map(key => [key, weights[key]])
    })

    useEffect(() => {
        const onInvalidWordLists = (invalidWordLists: string[]) => {
            setLists(current => current.filter(([listName]) => !invalidWordLists.includes(listName)))
        }

        socket.on('invalidWordLists', onInvalidWordLists)

        return () => {
            socket.off('invalidWordLists', onInvalidWordLists)
        }
    }, [socket])

    if (!settings) {
        return (
            <div>Failed to load settings...</div>
        )
    }

    const isDirty =
        settings.cluesPerPlayer !== cluesPerPlayer
        || settings.readiesRequired['giving-clues'] !== givingCluesNum
        || settings.readiesRequired['assessing-clues'] !== assessingCluesNum
        || settings.readiesRequired['post-game'] !== postGameNum
        || currentLists.length !== Object.keys(settings.wordListWeights).length
        || currentLists.some(([listName, weight]) => weight !== settings.wordListWeights[listName])
        || cluesTimerEnabled !== settings.cluesTimerEnabled
        || cluesTimeout !== settings.cluesTimeout
        || requiredClues !== settings.requiredClues

    const onSave = () => {
        if (!isDirty) {
            return
        }

        const newGameSettings: GameSettings = {
            cluesPerPlayer: cluesPerPlayer ?? settings.cluesPerPlayer,
            readiesRequired: {
                'giving-clues': givingCluesNum,
                'assessing-clues': assessingCluesNum,
                'post-game': postGameNum,
            },
            cluesTimerEnabled,
            cluesTimeout,
            requiredClues,
            wordListWeights: currentLists.reduce((obj, [list, weight]) => {
                obj[list] = weight
                return obj
            }, {} as Record<string, number>),
        }
        socket.emit('updateGameSettings', newGameSettings)
    }

    const numPlayers = Math.max(output.players.length, 2)

    return (
        <div className="stack gap-8px">
            <div className="inline stack-center spread">
                Clues per player
                <IncDecNumber value={cluesPerPlayer} min={1} max={3} onChange={setCluesPerPlayer} />
            </div>
            <strong>
                Readies required after:
            </strong>
            <div className="inline stack-center spread">
                Submitting clues
                <IncDecNumber
                    value={givingCluesNum}
                    min={1}
                    max={numPlayers - 1}
                    onChange={setGivingCluesNum}
                />
            </div>
            <div className="inline stack-center spread">
                Assessing clues
                <IncDecNumber
                    value={assessingCluesNum}
                    min={1}
                    max={numPlayers - 1}
                    onChange={setAssessingCluesNum}
                />
            </div>
            <div className="inline stack-center spread">
                Between rounds
                <IncDecNumber value={postGameNum} min={1} max={numPlayers} onChange={setPostGameNum} />
            </div>
            <div className="stack gap-8px">
                <strong>Time limit for giving clues:</strong>
                <label className="inline stack-center">
                    <input
                        type="checkbox"
                        checked={cluesTimerEnabled}
                        onChange={e => {
                            setCluesTimerEnabled(e.currentTarget.checked)
                        }}
                    />
                    Enabled?
                </label>
                <div className="inline stack-center spread">
                    Clues timeout
                    <IncDecNumber
                        value={Math.round(cluesTimeout / 1000)}
                        min={15}
                        max={600}
                        onChange={(_, increase) => {
                            setCluesTimeout(cluesTimeout + TIME_LIMIT_INCREMENT_FACTOR * (increase ? 1 : -1))
                        }}
                    />
                </div>
                <div className="inline stack-center spread">
                    Required clues
                    <IncDecNumber
                        value={requiredClues}
                        min={1}
                        max={cluesPerPlayer * (numPlayers - 1)}
                        onChange={setRequiredClues}
                    />
                </div>
            </div>
            <div className="stack gap-8px">
                <strong>Word lists:</strong>
                <form className="inline gap-8px stack-center flex-wrap" onSubmit={formEvent => {
                    formEvent.preventDefault()

                    const formData = new FormData(formEvent.currentTarget)

                    const newList = formData.get('new-word-list')

                    if (!newList || !(typeof newList === 'string')) {
                        return
                    }

                    formEvent.currentTarget.getElementsByTagName('input')[0].value = ''

                    setLists(current => {
                        const result = current.slice()
                        result.push([newList, 1])
                        return result
                    })
                }}>
                    <label className="inline gap-8px stack-center flex-wrap">
                        Add new word list
                        <input type="text" id="new-word-list" name="new-word-list" autoCapitalize="off" autoComplete="off" />
                    </label>
                    <button type="submit">Add</button>
                </form>
                <div className="stack gap-8px">
                    {currentLists.map(([list, weight]) => (
                        <div className="inline stack-center spread" key={list}>
                            {list}
                            <div className="inline stack-center gap-8px">
                                {list !== 'default' && (
                                    <button
                                        onClick={() => {
                                            setLists(current => current.filter(([l]) => l !== list))
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                                <IncDecNumber
                                    value={weight}
                                    min={0}
                                    max={10}
                                    onChange={newValue => {
                                        setLists(current => current.map(([l, w]) => l === list ? [l, newValue] : [l, w]))
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="inline spread stack-center">
                <em>Words already seen: {output.seenWords}</em>
                <button
                    onClick={() => {
                        socket.emit('resetSeenWords')
                    }}
                >
                    Reset seen words
                </button>
            </div>
            <div>
                <button onClick={onSave} disabled={!isDirty}>Save</button>
            </div>
        </div>
    )
}

interface NumberProps {
    value: number
    max?: number
    min?: number
    onChange: (value: number, increase: boolean) => void
}

// Replace with common component
const IncDecNumber = (props: NumberProps) => {
    const canDecrement = props.min === undefined || props.value <= props.min
    const canIncrement = props.max === undefined || props.value >= props.max

    return (
        <div className="inc-dec-number">
            <button
                onClick={() => props.onChange(props.value - 1, false)}
                disabled={canDecrement}
            >
                -
            </button>
            <span>{props.value}</span>
            <button
                onClick={() => props.onChange(props.value + 1, true)}
                disabled={canIncrement}
            >
                +
            </button>
        </div>
    )
}
