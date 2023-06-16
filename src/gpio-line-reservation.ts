import { Line, lineRelease } from 'libgpiod'
import { GPIOException } from './gpio-exception'

export abstract class GPIOLineReservation {

    public constructor(protected line: Line, protected readonly releaseCallback: () => void) { }

    protected checkReservation(): void {
        if (!this.line) {
            throw new GPIOException('Line already released')
        }
    }

    public release(): void {
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }
}
