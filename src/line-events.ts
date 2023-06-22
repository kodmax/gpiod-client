export type GPIOEventType = 'rising' | 'falling'
export type LineEdgeEvent = {
    gpiodEvent: Event
    type: GPIOEventType
    ts: number
}

export type LineEventListener<Event> = (event: Event) => void
export type LineEventType = GPIOEventType | 'switch'
