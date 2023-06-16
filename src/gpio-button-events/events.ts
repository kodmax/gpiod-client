export type ButtonEventName = 'press' | 'release' | 'hold' | 'tap'

export type ButtonEventListener<Event> = (event: Event) => void


export type ReleaseEvent = {
    ts: number
}

export type PressEvent = {
    ts: number
}

export type HoldEvent = {
    elapsed: number
}

export type TapEvent = {
    duration: number
}

