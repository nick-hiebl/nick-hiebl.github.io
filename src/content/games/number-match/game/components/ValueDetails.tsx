import { useMemo } from 'react'

import { useGameContext } from '../context'
import type { ActiveOutput, CompleteOutput, Grid, OutputGrid, ValueDetails as ValueDetailsType } from '../types'

import './ValueDetails.css'

type Props = {
    state: ActiveOutput | CompleteOutput
}

const countValueAmongGrids = (value: number, grids: (Grid | OutputGrid)[], expRevealed: boolean) => {
    return grids.reduce(
        (sum, grid) =>
            sum + grid.values
                .flatMap(x => x)
                .filter(cell => !cell.empty && cell.revealed === expRevealed && cell.value === value)
                .length,
        0,
    )
}

const countColorAmongGrids = (colorValues: number[], grids: (Grid | OutputGrid)[], expRevealed: boolean) => {
    return grids.reduce(
        (sum, grid) =>
            sum + grid.values
                .flatMap(x => x)
                .filter(cell => !cell.empty && cell.revealed === expRevealed && cell.value != undefined && colorValues.includes(cell.value))
                .length,
        0,
    )
}

export const ValueDetails = ({ state }: Props) => {
    const { output: { yourId }, socket } = useGameContext()
    const { grids, totalReds, totalYellows, valueDetails } = state

    const details = useMemo(() => {
        const yellowValues = valueDetails.filter(detail => detail.isYellow).map(v => v.value)
        const redValues = valueDetails.filter(detail => detail.isRed).map(v => v.value)

        const myGrids = grids.filter(grid => grid.ownerId === yourId)

        return valueDetails.map(({ value, totalCount, isRed, isYellow }) => {
            const mine = countValueAmongGrids(value, myGrids, false)
            const revealed = countValueAmongGrids(value, grids, true)

            if (isYellow) {
                const revealedYellows = countColorAmongGrids(yellowValues, grids, true)
                const myYellows = countColorAmongGrids(yellowValues, myGrids, false)

                const canReveal = revealedYellows < totalYellows &&
                    myYellows > 0 &&
                    myYellows + revealedYellows === totalYellows

                const isDone = revealed === totalCount || revealedYellows >= totalYellows

                const actualMax = isDone
                    ? revealed
                    : totalCount

                return {
                    value,
                    totalCount: actualMax,
                    revealed,
                    isDone,
                    canReveal: mine > 0 && canReveal,
                    isRed,
                    isYellow: true,
                }
            } else if (isRed) {
                const revealedReds = countColorAmongGrids(redValues, grids, true)

                const myUnrevealedNonReds = myGrids.reduce(
                    (sum, grid) =>
                        sum + grid.values
                            .flatMap(x => x)
                            .filter(cell => !cell.empty && cell.revealed === false && cell.value != undefined && !redValues.includes(cell.value))
                            .length,
                    0,
                )

                const myUnrevealedReds = myGrids.reduce(
                    (sum, grid) =>
                        sum + grid.values
                            .flatMap(x => x)
                            .filter(cell => !cell.empty && cell.revealed === false && cell.value != undefined && redValues.includes(cell.value))
                            .length,
                    0,
                )

                const canReveal = myUnrevealedNonReds === 0 && myUnrevealedReds > 0 && mine > 0

                const isDone = revealed === totalCount || revealedReds >= totalReds

                return {
                    value,
                    totalCount,
                    revealed,
                    isDone,
                    canReveal,
                    isRed: true,
                    isYellow,
                }
            }

            const canReveal = revealed < totalCount && mine > 0 && mine + revealed === totalCount

            return {
                value,
                totalCount,
                revealed,
                isDone: revealed === totalCount,
                canReveal,
                isRed,
                isYellow,
            }
        })
    }, [grids, totalReds, totalYellows, valueDetails, yourId])

    const isYourTurn = state.state === 'active' &&
        state.action.type === 'guess' &&
        state.action.user === yourId

    const sumYellows = valueDetails.reduce((sum, value) => value.isYellow ? sum + value.totalCount : sum, 0)
    const sumReds = valueDetails.reduce((sum, value) => value.isRed ? sum + value.totalCount : sum, 0)

    return (
        <div className="gap-8px">
            <ul>
                {details.map(value => (
                    <li key={value.value}>
                        <div className="value-detail" data-color={value.isRed ? 'red' : value.isYellow ? 'yellow' : undefined}>
                            <div className="value-title-row">
                                <h3 className="value-title" data-complete={value.isDone}>
                                    {value.value.toString()}
                                </h3>
                                {value.isRed && (
                                    <span className="detail-bubble red" />
                                )}
                                {value.isYellow && (
                                    <span className="detail-bubble yellow" />
                                )}
                            </div>
                            <div>{value.revealed} / {value.totalCount}</div>
                            {value.canReveal && (
                                <button
                                    onClick={() => {
                                        if (value.isYellow) {
                                            socket.emit('revealAll', { isYellow: true })
                                        } else if (value.isRed) {
                                            socket.emit('revealAll', { isRed: true })
                                        } else {
                                            socket.emit('revealAll', { value: value.value })
                                        }
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
            {totalYellows < sumYellows && (
                <div>Only {totalYellows} of {sumYellows} yellows are actually present.</div>
            )}
            {totalReds < sumReds && (
                <div>Only {totalReds} of {sumReds} reds are actually present.</div>
            )}
        </div>
    )
}
