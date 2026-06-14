import type { Socket } from 'socket.io-client'

export type Player = {
    id: string
    socket: Socket
    name: string
    password: string
}

export type LobbyDetails = {
    numUsers: number
    stage: 'pending' | 'active' | 'complete'
}

export type ConnectOptions = {
    name?: string
    token?: string
}

export type Tag =
    | { type: 'value', value: number }
    | { type: 'yellow' }

export type GridValue = {
    value: number
    revealed: boolean
    tags: Tag[]
    empty?: boolean
}

export type Grid = {
    id: number
    ownerId: string
    width: number
    height: number
    values: GridValue[][]
}

export type ValueDetails = {
    value: number
    totalCount: number
    isYellow?: boolean
    isRed?: boolean
}

export type PendingGameState = {
    state: 'pending'
    readyPlayers: string[]
}

export type CurrentAction =
    | {
        type: 'tag'
        users: string[]
    }
    | {
        type: 'guess'
        user: string
    }
    | {
        type: 'claim'
        users: string[]
        min: number
        max: number
    }

export type GameState = {
    state: 'active'
    valueDetails: ValueDetails[]
    totalYellows: number
    totalReds: number
    grids: Grid[]
    action: CurrentAction
    errors: number
}

export type CompleteState = {
    state: 'complete'
    valueDetails: ValueDetails[]
    totalReds: number
    totalYellows: number
    grids: Grid[]
    errors: number
}

export type OutputGridValue = {
    value: number | undefined
    revealed: boolean
    tags: Tag[]
    empty?: boolean
}

export type OutputGrid = Omit<Grid, 'values'> & {
    type: 'partial'
    values: OutputGridValue[][]
}

export type OutputGridOption = (Grid & { type: 'full' }) | OutputGrid

export type GameStateOutput = {
    players: Pick<Player, 'id' | 'name'>[]
    yourId: string
    password: string
    lobby: string
    hostPlayerId: string
    state: PendingGameState | ActiveOutput | CompleteOutput
}

export type ActiveOutput = {
    state: 'active'
    valueDetails: ValueDetails[]
    grids: OutputGridOption[]
    action: CurrentAction
    errors: number
    totalReds: number
    totalYellows: number
}

export type CompleteOutput = {
    state: 'complete'
    valueDetails: ValueDetails[]
    grids: OutputGridOption[]
    errors: number
    totalReds: number
    totalYellows: number
}

export type Coordinate = {
    gridId: number
    row: number
    column: number
}

export type TagAction = {
    coordinate: Coordinate
}

export type GuessAction = {
    myCoord: Coordinate
    otherCoord: Coordinate
}

export type RevealAllAction =
    | {
        value: number
        isRed?: false
        isYellow?: false
    }
    | {
        value?: undefined
        isRed?: false
        isYellow: true
    }
    | {
        value?: undefined
        isRed: true
        isYellow?: false
    }

export type GameSettings = {
    numGrids: number
    autoAssignGrids: boolean
    gridHeight: number
    maxValue: number
    duplicates: number
    totalReds: number
    extraReds: number
    totalYellows: number
    extraYellows: number
}
