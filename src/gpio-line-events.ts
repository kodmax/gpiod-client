import { Event, Line, StatusError, StatusEvent, lineEventRead, lineEventWait, lineRelease } from "libgpiod"
import { GPIOLineReservation } from "./gpio-line-reservation"
import { EventEmitter } from "stream"
import { EdgeEvent, EventListener, EventName } from "./events"


export class GPIOLineEvents extends GPIOLineReservation {
    private interval: ReturnType<typeof setInterval>
    private emitter: EventEmitter

    public constructor(line: Line, pollingInterval: number, releaseCallback: () => void) {
        super(line, releaseCallback)

        this.interval = setInterval(() => {
            if (lineEventWait(line, 0, 0) === StatusEvent) {
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
            gpiodEvent: event
        })
    }

    
    public addListener(eventName: 'edge', listener: EventListener<EdgeEvent>): void
    public addListener(eventName: EventName, listener: EventListener<any>): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: 'edge', listener: EventListener<EdgeEvent>): void
    public removeListener(eventName: EventName, listener: EventListener<any>): void {
        this.emitter.removeListener(eventName, listener)
    }

    public release(): void {
        clearInterval(this.interval)
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }

}