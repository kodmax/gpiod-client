import { Event, Line, StatusError, StatusEvent, StatusTimeout, lineEventRead, lineEventWait, lineRelease } from 'libgpiod'
import { GPIOLineReservation } from './gpio-line-reservation'
import { EventEmitter } from 'stream'

type LineEdgeEvent = {
    gpiodEvent: Event
    type: 'rising' | 'falling'
    ts: number
}

type LineEventListener<Event> = (event: Event) => void
type LineEventName = 'edge' | 'rising' | 'falling'

export class GPIOLineEvents extends GPIOLineReservation {
    private interval: ReturnType<typeof setInterval>
    private emitter: EventEmitter

    public constructor(line: Line, pollingInterval: number, releaseCallback: () => void) {
        super(line, releaseCallback)

        this.interval = setInterval(() => {
            this.clearEvents()
        }, pollingInterval)

        this.emitter = new EventEmitter()
    }

    private clearEvents(): void {
        while (lineEventWait(this.line, 0, 0) === StatusEvent) {
            const event = lineEventRead(this.line)
            if (event !== StatusError) {
                const ev = {
                    type: event.type === 1 ? 'rising' : 'falling',
                    ts: event.sec + event.nsec / 1e9,
                    gpiodEvent: event
                }

                this.emitter.emit(ev.type, ev)
                this.emitter.emit('edge', ev)
            }
        }
    }

    public addListener(eventName: LineEventName, listener: LineEventListener<LineEdgeEvent>): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: LineEventName, listener: LineEventListener<LineEdgeEvent>) {
        this.emitter.removeListener(eventName, listener)
    }

    public wait(ns: number): boolean {
        this.clearEvents()

        const status = lineEventWait(this.line, 0, ns)
        switch (status) {
            case StatusTimeout:
                return false

            case StatusEvent:
                return true

            case StatusError:
                throw new Error('Waiting for line event error')
        }
    }

    public release(): void {
        clearInterval(this.interval)
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }

}
