import { Fragment } from 'react'

import { useGameContext } from '../context'
import type { Coordinate, GridValue, OutputGridOption, OutputGridValue, Tag } from '../types'

import './Grid.css'

type Props = {
    grid: OutputGridOption
    hideName?: boolean
    selectedCoordinate?: Coordinate
    onSelectCoordinate?: (coordinate: Coordinate | undefined) => void
    isCellInteractive?: (cellValue: OutputGridValue | GridValue) => boolean
}

export const Grid = ({ grid, hideName, onSelectCoordinate, isCellInteractive, selectedCoordinate }: Props) => {
    const { output: { players, state } } = useGameContext()

    const valueDetails = state.state === 'pending' ? [] : state.valueDetails

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

                                const isYellow = (cell.value != undefined &&
                                    valueDetails.find(v => v.value === cell.value)?.isYellow) ?? false
                                const isRed = (cell.value != undefined &&
                                    valueDetails.find(v => v.value === cell.value)?.isRed) ?? false

                                return (
                                    <td
                                        key={columnIndex}
                                        className="grid-cell"
                                    >
                                        <button
                                            className="grid-cell-button"
                                            aria-selected={isSelected}
                                            disabled={isCellInteractive ? !isCellInteractive(cell) : true}
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
                                            {isYellow && <span className="tag-bubble yellow non-inverse" />}
                                            {isRed && <span className="tag-bubble red non-inverse" />}
                                        </button>
                                        <Tags tags={cell.tags} />
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

const Tags = ({ tags }: { tags: Tag[] }) => {
    if (tags.length === 0) {
        return null
    }

    return (
        <div className="cell-tags">
            {tags.map((v, index) => (
                <Fragment key={index}>
                    {v.type === 'value' && v.value.toString()}
                    {v.type === 'yellow' && <span className="tag-bubble yellow" />}
                    {index < tags.length - 1 && ', '}
                </Fragment>
            ))}
        </div>
    )
}
