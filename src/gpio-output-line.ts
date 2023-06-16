import { BitValue, StatusError, lineSetValue, lineTrigger } from 'libgpiod'
import { GPIOLineReservation } from './gpio-line-reservation'
import { GPIOException } from './gpio-exception'

export class GPIOOutputLine extends GPIOLineReservation {

    public setValue(value: BitValue): void {
        this.checkReservation()

        if (lineSetValue(this.line, value) === StatusError) {
            throw new GPIOException('Line set value failed')
        }
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
