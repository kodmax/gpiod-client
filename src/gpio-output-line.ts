import { BitValue, Line, StatusError, lineSetValue, lineTrigger } from 'libgpiod'
import { GPIOLineReservation } from './gpio-line-reservation'
import { GPIOException, gpioExceptions } from './gpio-exception'

export class GPIOOutputLine extends GPIOLineReservation {

    private lastValue: BitValue

    public constructor(line: Line, initialValue: BitValue, releaseCallback: () => void) {
        super(line, releaseCallback)

        this.lastValue = initialValue
    }

    /**
     * Set the value and optionally sleep afterward
     * @param value
     * @param uSleep (optional) number of microseconds to sleep after setting the value
     */
    public setValue(value: BitValue, uSleep?: number): void {
        this.checkReservation()

        if (lineSetValue(this.line, value, uSleep) === StatusError) {
            throw new GPIOException(gpioExceptions.E_LINE_SET_VALUE)
        }

        this.lastValue = value
    }

    public getLastSetValue(): BitValue {
        return this.lastValue
    }

    /**
     * @brief sets the specified value for the specified time span and then sets the opposite value
     * @param value pulse value
     * @param usec pulse width in microseconds
     * Use to generate short triggering pulses.
     */
    public trigger(value: BitValue, usec: number): void {
        lineTrigger(this.line, value, usec)
    }
}
