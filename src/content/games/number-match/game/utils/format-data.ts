import type { ActiveOutput, CompleteOutput, GameStateOutput, PendingGameState } from '../types'

const formatState = (state: PendingGameState | ActiveOutput | CompleteOutput): PendingGameState | ActiveOutput | CompleteOutput => {
    if (state.state === 'active' || state.state === 'complete') {
        const valueDetails = state.valueDetails.slice()
        valueDetails.sort((detail, detail2) => detail.value - detail2.value)

        const grids = state.grids.slice()
        grids.sort((grid, grid2) => grid.ownerId.localeCompare(grid2.ownerId))

        if (state.state === 'active') {
            return {
                state: 'active',
                valueDetails,
                grids,
                action: state.action,
                errors: state.errors,
            }
        } else {
            return {
                state: 'complete',
                valueDetails,
                grids,
                errors: state.errors,
            }
        }
    } else {
        return state
    }
}

export const formatData = ({ players, state, ...rest }: GameStateOutput): GameStateOutput => {
    const sortedPlayers = players.slice()
    sortedPlayers.sort((p1, p2) => p1.id.localeCompare(p2.id))

    return {
        players: sortedPlayers,
        state: formatState(state),
        ...rest,
    }
}
