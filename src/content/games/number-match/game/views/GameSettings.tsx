import { useState, type ReactNode } from 'react'

import { IncDecNumber } from '../../../../../components/games/common/IncDecNumber'

import { useGameContext } from '../context'
import type { GameSettings } from '../types'

import './GameSettings.css'

export type Props = {
    settings: GameSettings
}

export const GameSettingsPanel = ({ settings }: Props) => {
    const { socket } = useGameContext()

    const [numGrids, setNumGrids] = useState(settings.numGrids)
    const [autoAssign, setAutoAssign] = useState(settings.autoAssignGrids)
    const [gridHeight, setGridHeight] = useState(settings.gridHeight)
    const [maxValue, setMaxValue] = useState(settings.maxValue)
    const [duplicates, setDuplicates] = useState(settings.duplicates)
    const [totalReds, setTotalReds] = useState(settings.totalReds)
    const [bonusReds, setBonusReds] = useState(settings.extraReds - settings.totalReds)
    const [totalYellows, setTotalYellows] = useState(settings.totalYellows)
    const [bonusYellows, setBonusYellows] = useState(settings.extraYellows - settings.totalYellows)

    const isDirty =
        settings.numGrids !== numGrids
        || settings.autoAssignGrids !== autoAssign
        || settings.gridHeight !== gridHeight
        || settings.maxValue !== maxValue
        || settings.duplicates !== duplicates
        || settings.totalReds !== totalReds
        || settings.extraReds !== (totalReds + bonusReds)
        || settings.totalYellows !== totalYellows
        || settings.extraYellows !== (totalYellows + bonusYellows)

    const onSave = () => {
        if (!isDirty) {
            return
        }

        const newGameSettings: GameSettings = {
            numGrids,
            autoAssignGrids: autoAssign,
            gridHeight,
            maxValue,
            duplicates,
            totalReds,
            extraReds: totalReds + bonusReds,
            totalYellows,
            extraYellows: totalYellows + bonusYellows,
        }

        socket.emit('updateGameSettings', newGameSettings)
    }

    return (
        <div className="column gap-8px flex-start full-width">
            <h3>Game settings</h3>
            <div className="column flex-start">
                <div className="row">
                    <span>Number of grids</span>
                </div>
                <IncDecNumber
                    value={numGrids}
                    min={2}
                    max={10}
                    onChange={setNumGrids}
                />
            </div>
            <div className="row gap-8px">
                Auto assign?
                <input
                    type="checkbox"
                    checked={autoAssign}
                    onChange={e => {
                        setAutoAssign(e.currentTarget.checked)
                    }}
                />
            </div>
            <div className="column flex-start">
                Grid height
                <IncDecNumber
                    value={gridHeight}
                    min={1}
                    max={10}
                    onChange={setGridHeight}
                />
            </div>
            <div className="column flex-start">
                Max value
                <IncDecNumber
                    value={maxValue}
                    min={4}
                    max={48}
                    onChange={setMaxValue}
                />
            </div>
            <div className="column flex-start">
                <div className="row gap-8px">
                    <span>Copies of each regular number</span>
                    {duplicates < 2 || duplicates % 2 === 1 && (
                        <Error>Must be even to allow pairing</Error>
                    )}
                </div>
                <IncDecNumber
                    value={duplicates}
                    min={2}
                    max={16}
                    step={2}
                    onChange={setDuplicates}
                />
            </div>
            <div className="column flex-start">
                <div className="row gap-8px">
                    <span>Number of reds</span>
                    {totalReds >= maxValue && (
                        <Error>Must be fewer reds than values</Error>
                    )}
                </div>
                <IncDecNumber
                    value={totalReds}
                    min={0}
                    max={maxValue - 1}
                    onChange={setTotalReds}
                />
            </div>
            <div className="column flex-start">
                Bonus reds (e.g. 2 reds, 1 bonus red = 2 of 3 possible red values will be included)
                {totalReds + bonusReds >= maxValue && (
                    <Error>Number of reds + bonus reds must be less than values</Error>
                )}
                {totalReds === 0 && bonusReds > 0 && (
                    <Error>Cannot have bonus reds if there are no regular reds</Error>
                )}
                <IncDecNumber
                    value={bonusReds}
                    min={0}
                    max={maxValue - 1}
                    onChange={setBonusReds}
                />
            </div>
            <div className="column flex-start">
                <div className="row gap-8px">
                    <span>Number of yellows</span>
                    {totalYellows >= maxValue && (
                        <Error>Must be fewer yellows than values</Error>
                    )}
                    {totalYellows % 2 !== 0 && (
                        <Error>Number of yellows should be even</Error>
                    )}
                </div>
                <IncDecNumber
                    value={totalYellows}
                    min={0}
                    max={maxValue - 1}
                    step={2}
                    onChange={setTotalYellows}
                />
            </div>
            <div className="column flex-start">
                Bonus yellows (e.g. 2 yellows, 1 bonus red = 2 of 3 possible red values will be included)
                {totalYellows + bonusYellows >= maxValue && (
                    <Error>Number of yellows + bonus yellows must be less than values</Error>
                )}
                {totalYellows === 0 && bonusYellows > 0 && (
                    <Error>Cannot have bonus yellows if there are no regular yellows</Error>
                )}
                <IncDecNumber
                    value={bonusYellows}
                    min={0}
                    max={maxValue - 1}
                    onChange={setBonusYellows}
                />
            </div>
            <div>
                <button disabled={!isDirty} onClick={onSave}>Save</button>
            </div>
        </div>
    )
}

const Error = ({ children }: { children: ReactNode }) => (
    <span className="error">{children}</span>
)

export const GameSettingsReadOnly = ({ settings }: Props) => {
    return (
        <div className="column gap-8px flex-start full-width">
            <h3>Game settings</h3>
            <div>Number of grids: {settings.numGrids}</div>
            <div>Auto assign grids? {settings.autoAssignGrids ? 'Yes' : 'No'}</div>
            <div>Grid height: {settings.gridHeight}</div>
            <div>Max value: {settings.maxValue}</div>
            <div>Copies of each regular number: {settings.duplicates}</div>
            <div>Reds: {settings.totalReds === 0 ? 'None' : `${settings.totalReds} of ${settings.extraReds}`}</div>
            <div>Yellows: {settings.totalYellows === 0 ? 'None' : `${settings.totalYellows} of ${settings.extraYellows}`}</div>
        </div>
    )
}
