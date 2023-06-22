import { Line, lineRelease } from 'libgpiod'
import { GPIOException, gpioExceptions } from './gpio-exception'

export abstract class GPIOLineReservation {

    public constructor(protected line: Line, protected readonly releaseCallback: () => void) { }

    protected checkReservation(): void {
        if (!this.line) {
            throw new GPIOException(gpioExceptions.E_LINE_NOT_RESERVED)
        }
    }

    public release(): void {
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }
}
