import { Event } from "libgpiod"

export type EdgeEvent = {
    gpiodEvent: Event
}

export type EventListener<Event> = (event: Event) => void
export type EventName = 'edge'
