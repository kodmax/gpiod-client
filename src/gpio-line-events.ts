import { Event, Line, StatusError, StatusEvent, lineEventRead, lineEventWait, lineRelease } from "libgpiod"
import { GPIOLineReservation } from "./gpio-line-reservation"
import { EventEmitter } from "stream"

export type EdgeEvent = {
    gpiodEvent: Event
    ts: number
}

export type EventListener<Event> = (event: Event) => void
export type EventName = 'edge'

export class GPIOLineEvents extends GPIOLineReservation {
    private interval: ReturnType<typeof setInterval>
    private emitter: EventEmitter

    public constructor(line: Line, pollingInterval: number, releaseCallback: () => void) {
        super(line, releaseCallback)

        this.interval = setInterval(() => {
            while (lineEventWait(line, 0, 0) === StatusEvent) {
                const event = lineEventRead(line)
                if (event !== StatusError) {
                    this.processEvent(event)
                }
            }
        }, pollingInterval)
    
        this.emitter = new EventEmitter()
    }

    private processEvent(event: Event): void {
        this.emitter.emit('edge', {
            ts: event.sec + event.nsec / 1e9,
            gpiodEvent: event
        })
        
    }

    public addListener(eventName: 'edge', listener: EventListener<EdgeEvent>): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: 'edge', listener: EventListener<EdgeEvent>) {
        this.emitter.removeListener(eventName, listener)
    }

    public release(): void {
        clearInterval(this.interval)
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }

}