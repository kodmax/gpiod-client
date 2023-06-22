import { EventEmitter } from 'events'
import { DebouncerEventType, EventListener, SwitchEvent, ReleaseEvent, PressEvent, HoldEvent } from './events'
import { BitValue } from 'libgpiod'

export class Debouncer {
    private readonly emitter: EventEmitter = new EventEmitter()

    private lastInstantValue?: BitValue
    private lastStableValue?: BitValue
    private lastChangeTime?: number

    private lastPressTime?: number
    private nextHoldIndex = 0

    public constructor(
        emitter: EventEmitter,
        private readonly timeout: number,
        private readonly pressValue?: BitValue,
        private readonly holdTimes?: number[]
    ) {
        emitter.addListener('falling', ev => {
            this.lastInstantValue = 0
            this.checkState(ev.ts)

            this.lastChangeTime = ev.ts
        })

        emitter.addListener('rising', ev => {
            this.lastInstantValue = 1
            this.checkState(ev.ts)

            this.lastChangeTime = ev.ts
        })

        emitter.addListener('read-events', () => {
            const [sec, nsec] = process.hrtime()
            const ts = sec + nsec / 1e9

            if (this.lastChangeTime) {
                this.checkState(ts)
            }

            if (this.pressValue !== void 0 && this.lastInstantValue === this.pressValue && this.lastPressTime !== void 0) {
                this.hold(ts, (ts - this.lastPressTime) * 1000)
            }
        })
    }

    private switch(ts: number, to: BitValue): void {
        if (this.pressValue !== void 0) {
            if (to !== this.pressValue) {
                if (this.lastPressTime !== void 0) {
                    const ev: ReleaseEvent = {
                        time: ts - this.lastPressTime,
                        ts
                    }

                    this.emitter.emit('release', ev)
                    this.lastPressTime = void 0
                }

            } else {
                const ev: PressEvent = {
                    ts
                }

                this.emitter.emit('press', ev)
                this.lastPressTime = ts
                this.nextHoldIndex = 0
            }
        }
    }

    private hold(ts: number, elapsed: number): void {
        if (this.holdTimes && this.holdTimes.length > this.nextHoldIndex) {
            if (elapsed >= this.holdTimes[this.nextHoldIndex]) {
                const ev: HoldEvent = {
                    time: elapsed,
                    ts
                }

                this.emitter.emit('hold', ev)
                ++this.nextHoldIndex
            }
        }
    }

    private checkState(ts: number): void {
        if (this.lastChangeTime && ts - this.lastChangeTime > this.timeout) {
            if (this.lastStableValue !== this.lastInstantValue && (this.lastInstantValue !== void 0)) {
                const ev: SwitchEvent = {
                    value: this.lastInstantValue,
                    ts
                }

                this.switch(ts, this.lastInstantValue)
                this.emitter.emit('switch', ev)
            }

            this.lastStableValue = this.lastInstantValue
            this.lastChangeTime = void 0
        }
    }

    public addListener(eventName: 'release', listener: EventListener<ReleaseEvent>): void
    public addListener(eventName: 'switch', listener: EventListener<SwitchEvent>): void
    public addListener(eventName: 'press', listener: EventListener<PressEvent>): void
    public addListener(eventName: 'hold', listener: EventListener<HoldEvent>): void
    public addListener(
        eventName: DebouncerEventType,
        listener: EventListener<ReleaseEvent> | EventListener<SwitchEvent> | EventListener<PressEvent> | EventListener<HoldEvent>
    ): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: 'release', listener: EventListener<ReleaseEvent>): void
    public removeListener(eventName: 'switch', listener: EventListener<SwitchEvent>): void
    public removeListener(eventName: 'press', listener: EventListener<PressEvent>): void
    public removeListener(eventName: 'hold', listener: EventListener<HoldEvent>): void
    public removeListener(
        eventName: DebouncerEventType,
        listener: EventListener<ReleaseEvent> | EventListener<SwitchEvent> | EventListener<PressEvent> | EventListener<HoldEvent>
    ): void {
        this.emitter.removeListener(eventName, listener)
    }

    public once(eventName: 'release', listener: EventListener<ReleaseEvent>): void
    public once(eventName: 'switch', listener: EventListener<SwitchEvent>): void
    public once(eventName: 'press', listener: EventListener<PressEvent>): void
    public once(eventName: 'hold', listener: EventListener<HoldEvent>): void
    public once(
        eventName: DebouncerEventType,
        listener: EventListener<ReleaseEvent> | EventListener<SwitchEvent> | EventListener<PressEvent> | EventListener<HoldEvent>
    ): void {
        this.emitter.once(eventName, listener)
    }
}
