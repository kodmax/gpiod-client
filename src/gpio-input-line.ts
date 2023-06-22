import { BitValue, Event, Line, StatusError, StatusEvent, StatusTimeout, lineEventRead, lineEventWait, lineGetValue, lineRelease } from 'libgpiod'
import { GPIOLineReservation } from './gpio-line-reservation'
import { EventEmitter } from 'stream'
import { GPIOException, gpioExceptions } from './gpio-exception'
import { LineEdgeEvent, LineEventListener, LineEventType } from './line-events'


export class GPIOInputLine extends GPIOLineReservation {
    private interval?: ReturnType<typeof setInterval>
    private emitter: EventEmitter

    public constructor(line: Line, pollingInterval: number | undefined, releaseCallback: () => void) {
        super(line, releaseCallback)

        if (pollingInterval) {
            this.interval = setInterval(() => {
                this.readEvents()
            }, pollingInterval)
        }

        this.emitter = new EventEmitter()
    }

    private propagateEvent(event: Event): void {
        const ev = {
            type: event.type === 1 ? 'rising' : 'falling',
            ts: event.sec + event.nsec / 1e9,
            gpiodEvent: event
        }

        this.emitter.emit(ev.type, ev)
    }

    /**
     * Instantly poll kernel's events queue
     */
    public readEvents(): void {
        while (lineEventWait(this.line, 0, 0) === StatusEvent) {
            const event = lineEventRead(this.line)
            if (event !== StatusError) {
                this.propagateEvent(event)
            }
        }
    }

    public addListener(eventName: LineEventType, listener: LineEventListener<LineEdgeEvent>): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: LineEventType, listener: LineEventListener<LineEdgeEvent>) {
        this.emitter.removeListener(eventName, listener)
    }

    public once(eventName: LineEventType, listener: LineEventListener<LineEdgeEvent>) {
        this.emitter.once(eventName, listener)
    }

    /**
     * Wait for a new line event.
     * This method will poll the queue and propagate any previous events and wait for new one.
     * @param uSec maximum number of micro seconds to wait for an event
     * @param capture if true, the event will not be propagated to listeners
     */
    public wait(uSec: number, capture = false): Event | null {
        this.readEvents()

        switch (lineEventWait(this.line, 0, uSec * 1000)) {
            case StatusTimeout:
                return null

            case StatusEvent: {
                const event = lineEventRead(this.line)
                if (event === StatusError) {
                    throw new GPIOException(gpioExceptions.E_LINE_EVENT_READ)
                }

                if (capture === false) {
                    this.propagateEvent(event)
                }

                return event
            }

            case StatusError:
                throw new GPIOException(gpioExceptions.E_LINE_EVENT_WAIT)
        }
    }

    public getValue(): BitValue {
        this.checkReservation()

        const value = lineGetValue(this.line)
        if (value === StatusError) {
            throw new GPIOException(gpioExceptions.E_LINE_GET_VALUE)

        } else {
            return value
        }
    }

    public release(): void {
        clearInterval(this.interval)
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }

}
