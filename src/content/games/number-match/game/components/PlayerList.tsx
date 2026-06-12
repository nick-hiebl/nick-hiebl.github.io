import { useGameContext } from '../context'

import './PlayerList.css'

type PlayerListProps = {
    extraContent?: (playerId: string) => React.ReactNode
}

export const PlayerList = ({ extraContent }: PlayerListProps) => {
    const { output } = useGameContext()

    return (
        <div id="player-list">
            {output.players.map((player) => {
                return (
                    <div key={player.id} className="player-item">
                        <span>
                            {player.name}
                            {output.yourId === player.id && (
                                <>
                                    {' '}
                                    (You)
                                </>
                            )}
                        </span>
                        <div className="player-tag-list">
                            {extraContent ? extraContent(player.id) : (
                                <ReadyNode playerId={player.id} />
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const ReadyNode = ({ playerId }: { playerId: string }) => {
    const { output: state } = useGameContext()

    switch (state.state.state) {
        default:
            return null
        case 'pending':
            if (state.state.readyPlayers.includes(playerId)) {
                return <span>✅</span>
            } else {
                return <span>❌</span>
            }
    }
}
