import './IncDecNumber.css'

interface NumberProps {
    value: number
    max?: number
    min?: number
    step?: number
    onChange: (value: number, increase: boolean) => void
}

export const IncDecNumber = (props: NumberProps) => {
    const canDecrement = props.min === undefined || props.value <= props.min
    const canIncrement = props.max === undefined || props.value >= props.max

    const step = props.step ?? 1

    return (
        <div className="inc-dec-number">
            <button
                onClick={() => props.onChange(props.value - step, false)}
                disabled={canDecrement}
            >
                -
            </button>
            <span>{props.value}</span>
            <button
                onClick={() => props.onChange(props.value + step, true)}
                disabled={canIncrement}
            >
                +
            </button>
        </div>
    )
}
