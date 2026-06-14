import { useEffect, useState } from 'react'

import { useSocket } from '../../../../components/games/common/socket'
import { MenuTrigger } from '../../../../components/games/common/Menu'

// import { StatusMenu } from './components/StatusMenu'
import { NUMBER_MATCH_PASSWORD } from './constants'
import { GameContext, useGameContext } from './context'
import type { GameSettings, GameStateOutput } from './types'
import { formatData } from './utils/format-data'
import { Pending } from './views/Pending'
import { ActiveGame } from './views/ActiveGame'
import { CompleteGame } from './views/CompleteGame'

import './game.css'

type GameProps = {
    code: string
    onLobbyNotFound: () => void
}

const myToken = () => {
    return {
        name: localStorage.getItem('user-name') || undefined,
        token: localStorage.getItem(NUMBER_MATCH_PASSWORD) || undefined,
        activity: 'number-match',
    }
}

export const NumberMatchGame = ({ code, onLobbyNotFound }: GameProps) => {
    const token = myToken()

    const socket = useSocket(token, code)
    const [state, setState] = useState<GameStateOutput | undefined>()
    const [settings, setGameSettings] = useState<GameSettings | undefined>()

    useEffect(() => {
        if (!socket) {
            return
        }

        const onGameState = (data: GameStateOutput) => {
            setState(formatData(data))
            localStorage.setItem(NUMBER_MATCH_PASSWORD, data.password)
        }

        const onGameSettings = (data: GameSettings) => {
            setGameSettings(data)
        }

        socket.on('gameState', onGameState)
        socket.on('gameSettings', onGameSettings)

        socket.on('not-found', onLobbyNotFound)

        return () => {
            socket.off('gameState', onGameState)
            socket.off('gameSettings', onGameSettings)

            socket.off('not-found', onLobbyNotFound)
        }
    }, [onLobbyNotFound, socket])

    if (!socket) {
        return (
            <section>
                <h1>Loading...</h1>
                <p>If this is up for a while: Error: NOSOCKET</p>
            </section>
        )
    }

    if (!state) {
        return (
            <section>
                <h1>Loading...</h1>
                <p>Ideally you should not be seeing this for long... NOSTATE</p>
            </section>
        )
    }

    const { players, ...stateWithoutPlayers } = state

    return (
        <GameContext.Provider value={{ output: state, settings, socket }}>
            <section>
                <div id="top-bar">
                    <div id="core-bar">
                        Number match game ({code})
                    </div>
                    {state.hostPlayerId === state.yourId && (
                        <MenuTrigger>
                            {({ onClose }) => (
                                <MenuContents onClose={onClose} />
                            )}
                        </MenuTrigger>
                    )}
                </div>
                {state.state.state === 'pending' ? (
                    <Pending code={code} />
                ) : state.state.state === 'active' ? (
                    <ActiveGame state={state.state} />
                ) : state.state.state === 'complete' ? (
                    <CompleteGame state={state.state} />
                ) : (
                    <div>
                        <h1>{code}</h1>
                        <pre>{JSON.stringify(stateWithoutPlayers, null, 2)}</pre>
                    </div>
                )}
            </section>
        </GameContext.Provider>
    )
}

type MenuContentsProps = {
    onClose: () => void
}

const MenuContents = ({ onClose }: MenuContentsProps) => {
    const { output, socket } = useGameContext()

    return (
        <div>
            <h1>Menu!</h1>
            {output.hostPlayerId === output.yourId && (
                <div>
                    <div>Fully reset the game? Warning, this will happen immediately.</div>
                    <button
                        onClick={() => {
                            socket.emit('resetRound')
                            onClose()
                        }}
                    >
                        Reset round
                    </button>
                </div>
            )}
        </div>
    )
}
