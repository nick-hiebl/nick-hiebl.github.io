import { useEffect, useState } from 'react'

import { Grid } from '../components/Grid'
import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'
import type { Coordinate, ActiveOutput } from '../types'
import { ValueDetails } from '../components/ValueDetails'

type Props = {
    state: ActiveOutput
}

export const ActiveGame = ({ state }: Props) => {
    const { output: { yourId }, socket } = useGameContext()
    const [myCoord, setMyCoord] = useState<Coordinate | undefined>()
    const [otherCoord, setOtherCoord] = useState<Coordinate | undefined>()

    const actionType = state.action.type
    const isMyAction = state.action.type === 'guess'
        ? state.action.user === yourId
        : state.action.type === 'tag'
            ? state.action.users.includes(yourId)
            : false

    useEffect(() => {
        setMyCoord(undefined)
        setOtherCoord(undefined)
    }, [actionType, isMyAction])

    return (
        <div className="stack gap-8px">
            <PlayerList
                extraContent={playerId => {
                    if (actionType === 'claim' && state.action.users.includes(playerId)) {
                        return <span>🤔</span>
                    } else if (actionType === 'guess' && state.action.user === playerId) {
                        return <span>🔎</span>
                    } else if (actionType === 'tag' && state.action.users.includes(playerId)) {
                        return <span>❓</span>
                    }
                }}
            />
            <h1>Active</h1>
            <ValueDetails state={state} />
            <div className="stack gap-16px">
                <div>
                    Errors: {state.errors}, Actions
                    {actionType === 'tag' && isMyAction && (
                        <button
                            disabled={!myCoord}
                            onClick={() => {
                                if (!myCoord) {
                                    return
                                }

                                socket.emit('tagCell', { coordinate: myCoord })
                            }}
                        >
                            Submit tag
                        </button>
                    )}
                    {actionType === 'guess' && isMyAction && (
                        <button
                            disabled={!myCoord || !otherCoord}
                            onClick={() => {
                                socket.emit('makeGuess', {
                                    myCoord,
                                    otherCoord,
                                })
                            }}
                        >
                            Submit guess
                        </button>
                    )}
                </div>
                <div className="stack stack-center gap-8px">
                    <div>Your grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid
                                    grid={grid}
                                    onSelectCoordinate={coord => setMyCoord(coord)}
                                    selectedCoordinate={myCoord}
                                    isCellInteractive={cell => (actionType === 'guess' && !cell.revealed) || actionType === 'tag'}
                                    hideName
                                />
                            </li>
                        ))}
                    </ul>
                    <div>Others' grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId !== yourId).map(grid => (
                            <li key={grid.id} className="column flex-center">
                                {grid.ownerId === '' && actionType === 'claim' && state.action.users.includes(yourId) && (
                                    <button
                                        onClick={() => {
                                            socket.emit('claimGrid', { gridId: grid.id })
                                        }}
                                    >
                                        Claim
                                    </button>
                                )}
                                <Grid
                                    grid={grid}
                                    onSelectCoordinate={coord => setOtherCoord(coord)}
                                    selectedCoordinate={otherCoord}
                                    isCellInteractive={cell => (actionType === 'guess' && !cell.revealed)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
