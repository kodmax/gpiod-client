import { EventEmitter } from 'events'
import { DebouncerEventType, EventListener, DebouncerEvent } from './events'
import { BitValue } from 'libgpiod'

export class Debouncer {
    private readonly emitter: EventEmitter = new EventEmitter()

    private lastInstantValue?: BitValue
    private lastStableValue?: BitValue
    private lastChangeTime?: number

    private checkTimeout(ts: number): void {
        if (this.lastChangeTime && ts - this.lastChangeTime > this.timeout) {
            if (this.lastStableValue !== this.lastInstantValue && (this.lastInstantValue !== void 0)) {
                const ev: DebouncerEvent = {
                    value: this.lastInstantValue,
                    type: 'switch',
                    ts
                }

                this.emitter.emit('switch', ev)
            }

            this.lastStableValue = this.lastInstantValue
            this.lastChangeTime = void 0
        }
    }

    public constructor(emitter: EventEmitter, private readonly timeout: number) {
        emitter.addListener('falling', ev => {
            this.lastInstantValue = 0
            this.checkTimeout(ev.ts)

            this.lastChangeTime = ev.ts
        })

        emitter.addListener('rising', ev => {
            this.lastInstantValue = 1
            this.checkTimeout(ev.ts)

            this.lastChangeTime = ev.ts
        })

        emitter.addListener('read-events', () => {
            if (this.lastChangeTime) {
                const [sec, nsec] = process.hrtime()
                const ts = sec + nsec / 1e9
                this.checkTimeout(ts)
            }
        })
    }

    public addListener(eventName: DebouncerEventType, listener: EventListener<DebouncerEvent>): void {
        this.emitter.addListener(eventName, listener)
    }

    public removeListener(eventName: DebouncerEventType, listener: EventListener<DebouncerEvent>) {
        this.emitter.removeListener(eventName, listener)
    }

    public once(eventName: DebouncerEventType, listener: EventListener<DebouncerEvent>) {
        this.emitter.once(eventName, listener)
    }
}
