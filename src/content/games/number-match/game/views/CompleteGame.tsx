import { Grid } from '../components/Grid'
import { PlayerList } from '../components/PlayerList'
import { useGameContext } from '../context'
import type { CompleteOutput } from '../types'
import { ValueDetails } from '../components/ValueDetails'

type Props = {
    state: CompleteOutput
}

export const CompleteGame = ({ state }: Props) => {
    const { output: { hostPlayerId, yourId }, socket } = useGameContext()

    return (
        <div className="stack gap-8px">
            <PlayerList />
            <h1>Complete</h1>
            <ValueDetails state={state} />
            <div className="stack gap-16px full-width">
                <div>
                    Errors: {state.errors}, Actions
                </div>
                <div className="stack stack-center gap-8px">
                    <div>Your grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId === yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid grid={grid} hideName />
                            </li>
                        ))}
                    </ul>
                    <div>Others' grids</div>
                    <ul>
                        {state.grids.filter(grid => grid.ownerId !== yourId).map(grid => (
                            <li key={grid.id}>
                                <Grid grid={grid} />
                            </li>
                        ))}
                    </ul>
                </div>
                {hostPlayerId === yourId && (
                    <>
                        <br />
                        <div>
                            <button
                                onClick={() => {
                                    socket.emit('resetRound')
                                }}
                            >
                                Play again
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
