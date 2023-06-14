import { BitValue, Event, EventTypeFalling, EventTypeRising, Line, RisingEdge, StatusError, StatusEvent, lineEventRead, lineEventWait, lineRelease } from "libgpiod"
import { GPIOLineReservation } from "./gpio-line-reservation"
import { EventEmitter } from "stream"

export type EventName = 'press' | 'release' | 'hold' | 'tap'

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

export type EventListener<Event> = (event: Event) => void

export class GPIOButtonEvents extends GPIOLineReservation {
    private readonly pollInterval: ReturnType<typeof setInterval>
    private readonly emitter: EventEmitter

    private lastPressTimestamp: number = 0

    public constructor(line: Line, private readonly pressValue: BitValue, private readonly minimumTapTime: number, releaseCallback: () => void) {
        super(line, releaseCallback)

        this.pollInterval = setInterval(() => {
            while (lineEventWait(line, 0, 0) === StatusEvent) {
                const event = lineEventRead(line)
                console.log(event)
                if (event !== StatusError) {
                    this.processEvent(event)
                }

            }

            if (this.lastPressTimestamp) {
                const [sec, nsec] = process.hrtime()
                this.emitter.emit('hold', {
                    elapsed: this.getHoldTime((sec + nsec / 1e9))
                })
            }

        }, 50)

        this.emitter = new EventEmitter()
    }

    private getHoldTime(ts: number): number {
        return this.lastPressTimestamp !== 0
            ? ts - this.lastPressTimestamp
            : 0
    }

    private processEvent(event: Event): void {
        if (event.type === EventTypeRising && this.pressValue === 0 || event.type === EventTypeFalling && this.pressValue === 1) {
            const holdTime = this.getHoldTime(event.sec + event.nsec / 1e9)
            this.lastPressTimestamp = 0

            this.emitter.emit('release', {
                ts: event.sec + event.nsec / 1e9
            })

            if (holdTime > this.minimumTapTime) {
                this.emitter.emit('tap', {
                    duration: holdTime
                })
            }

        } else {
            this.lastPressTimestamp = event.sec + event.nsec / 1e9
            this.emitter.emit('press', {
                ts: event.sec + event.nsec / 1e9
            })
        }
    }

    public addListener(eventName: 'release', listener: EventListener<ReleaseEvent>): void
    public addListener(eventName: 'press', listener: EventListener<PressEvent>): void
    public addListener(eventName: 'hold', listener: EventListener<HoldEvent>): void
    public addListener(eventName: 'tap', listener: EventListener<TapEvent>): void
    public addListener(eventName: EventName, listener: EventListener<any>): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: 'release', listener: EventListener<ReleaseEvent>): void
    public removeListener(eventName: 'press', listener: EventListener<PressEvent>): void
    public removeListener(eventName: 'hold', listener: EventListener<HoldEvent>): void
    public removeListener(eventName: 'tap', listener: EventListener<TapEvent>): void
    public removeListener(eventName: EventName, listener: EventListener<any>): void {
        this.emitter.removeListener(eventName, listener)
    }

    public release(): void {
        clearInterval(this.pollInterval)
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }

}