import { SetName } from '../../../../../components/games/common/SetName'

import { PlayerList } from '../components/PlayerList'
import { ReadyUp } from '../components/ReadyUp'
import { useGameContext } from '../context'
import { GameSettingsPanel, GameSettingsReadOnly } from './GameSettings'

type Props = {
    code: string
}

export const Pending = ({ code }: Props) => {
    const { output, settings, socket } = useGameContext()

    if (output.state.state !== 'pending') {
        return null
    }

    const currentName = output.players.find(p => p.id === output.yourId)?.name

    const copyLinkToClipboard = () => {
        const url = window.location.href

        window.navigator.clipboard.writeText(url)
    }

    return (
        <div className="column gap-8px">
            <PlayerList />
            <div className="column gap-16px full-width">
                <div className="column">
                    <div>The room code is:</div>
                    <div className="big-text">{code}</div>
                    <button onClick={copyLinkToClipboard}>
                        Copy link
                    </button>
                </div>
                <div className="column gap-8px">
                    <SetName
                        currentName={currentName}
                        onSetName={(newName: string) => {
                            socket.emit('updateName', { name: newName })
                        }}
                    />
                    <ReadyUp />
                </div>
                {!settings ? null : output.hostPlayerId === output.yourId ? (
                    <GameSettingsPanel settings={settings} />
                ) : (
                    <GameSettingsReadOnly settings={settings} />
                )}
            </div>
        </div>
    )
}
