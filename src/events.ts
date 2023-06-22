import { BitValue } from 'libgpiod'

export type GPIOEventType = 'rising' | 'falling'

export type LineEvent = {
    gpiodEvent: Event
    type: GPIOEventType
    ts: number
}

export type EventListener<Event> = (event: Event) => void
export type EventType = GPIOEventType

export type DebouncerEventType = 'switch'
export type DebouncerEvent = {
    value: BitValue
    type: DebouncerEventType
    ts: number
}
