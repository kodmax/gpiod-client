import { Event, Line, StatusError, StatusEvent, lineEventRead, lineEventWait, lineRelease } from 'libgpiod'
import { GPIOLineReservation } from './gpio-line-reservation'
import { EventEmitter } from 'stream'

type LineEdgeEvent = {
    gpiodEvent: Event
    type: 'rising' | 'falling'
    ts: number
}

type LineEventListener<Event> = (event: Event) => void
type LineEventName = 'edge'

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
        const ev = {
            type: event.type === 1 ? 'rising' : 'falling',
            ts: event.sec + event.nsec / 1e9,
            gpiodEvent: event
        }

        this.emitter.emit(ev.type, ev)
        this.emitter.emit('edge', ev)
    }

    public addListener(eventName: LineEventName, listener: LineEventListener<LineEdgeEvent>): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: LineEventName, listener: LineEventListener<LineEdgeEvent>) {
        this.emitter.removeListener(eventName, listener)
    }

    public release(): void {
        clearInterval(this.interval)
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }

}
