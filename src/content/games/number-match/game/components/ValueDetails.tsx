import { useMemo } from 'react'

import { useGameContext } from '../context'
import type { ActiveOutput, CompleteOutput, Grid, OutputGrid } from '../types'

import './ValueDetails.css'

type Props = {
    state: ActiveOutput | CompleteOutput
}

const countValueAmongGrids = (value: number, grids: (Grid | OutputGrid)[], expRevealed: boolean) => {
    return grids.reduce((sum, grid) =>
        sum + grid.values
            .flatMap(x => x)
            .filter(cell => cell.revealed === expRevealed && cell.value === value)
            .length,
        0,
    )
}

export const ValueDetails = ({ state }: Props) => {
    const { output: { yourId }, socket } = useGameContext()
    const { grids, valueDetails } = state

    const details = useMemo(() => {
        return valueDetails.map(({ value, totalCount, isRed, isYellow }) => {
            const revealed = countValueAmongGrids(value, grids, true)
            const mine = countValueAmongGrids(value, grids.filter(grid => grid.ownerId === yourId), false)
            return {
                value,
                totalCount,
                revealed,
                mine,
                isRed,
                isYellow,
            }
        })
    }, [grids, valueDetails])

    const isYourTurn = state.state === 'active' &&
        state.action.type === 'guess' &&
        state.action.user === yourId

    return (
        <div className="gap-8px">
            <ul>
                {details.map(value => (
                    <li key={value.value}>
                        <div className="value-detail" data-color={value.isRed ? 'red' : value.isYellow ? 'yellow' : undefined}>
                            <div className="value-title-row">
                                <h3 className="value-title" data-complete={value.revealed === value.totalCount}>
                                    {value.value.toString()}
                                </h3>
                                {value.isRed && (
                                    <span className="detail-bubble red" />
                                )}
                                {value.isYellow && (
                                    <span className="detail-bubble yellow" />
                                )}
                            </div>
                            <div>Count: {value.revealed} / {value.totalCount}</div>
                            {value.revealed < value.totalCount && value.mine > 0 && value.mine + value.revealed === value.totalCount && (
                                <button
                                    onClick={() => {
                                        socket.emit('revealAll', { value: value.value })
                                    }}
                                    disabled={!isYourTurn}
                                >
                                    Reveal remaining
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
