import { useGameContext } from '../context'
import type { Coordinate, OutputGridOption } from '../types'

import './Grid.css'

type Props = {
    grid: OutputGridOption
    hideName?: boolean
    selectedCoordinate?: Coordinate
    onSelectCoordinate?: (coordinate: Coordinate | undefined) => void
}

export const Grid = ({ grid, hideName, onSelectCoordinate, selectedCoordinate }: Props) => {
    const { output: { players, state, yourId }, socket } = useGameContext()

    const isYourGrid = grid.ownerId === yourId

    return (
        <div className="grid-container">
            {!hideName && (
                <div>Owner: {!grid.ownerId ? 'Unassigned' : players.find(p => p.id === grid.ownerId)?.name ?? 'Unknown owner'}</div>
            )}
            <table className="grid">
                <tbody>
                    {grid.values.map((row, rowIndex) => (
                        <tr key={rowIndex} className="grid-row">
                            {row.map((cell, columnIndex) => {
                                if (cell.empty) {
                                    return <td key={columnIndex} />
                                }

                                const isSelected = selectedCoordinate &&
                                    selectedCoordinate.gridId === grid.id &&
                                    selectedCoordinate.column === columnIndex &&
                                    selectedCoordinate.row === rowIndex

                                return (
                                    <td
                                        key={columnIndex}
                                        className="grid-cell"
                                    >
                                        <button
                                            className="grid-cell-button"
                                            aria-selected={isSelected}
                                            data-revealed={cell.revealed}
                                            onClick={() => {
                                                const coordinate: Coordinate = {
                                                    gridId: grid.id,
                                                    row: rowIndex,
                                                    column: columnIndex,
                                                }

                                                if (isSelected) {
                                                    onSelectCoordinate?.(undefined)
                                                } else {
                                                    onSelectCoordinate?.(coordinate)
                                                }
                                            }}
                                        >
                                            {cell.value ?? '?'}
                                        </button>
                                        {cell.tags.length > 0 && (
                                            <div className="cell-tags">
                                                {cell.tags.map(v => v.value.toString()).join(', ')}
                                            </div>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
