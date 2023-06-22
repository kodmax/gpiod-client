import { BitValue } from 'libgpiod'

export type GPIOEventType = 'rising' | 'falling'

export type LineEvent = {
    gpiodEvent: Event
    type: GPIOEventType
    ts: number
}

export type EventListener<Event> = (event: Event) => void
export type EventType = GPIOEventType

export type DebouncerEventType = 'switch' | 'press' | 'hold' | 'release'

export type SwitchEvent = {
    value: BitValue
    ts: number
}

export type PressEvent = {
    ts: number
}

export type ReleaseEvent = {
    time: number
    ts: number
}

export type HoldEvent = {
    time: number
    ts: number
}
