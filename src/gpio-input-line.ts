import { BitValue, StatusError, lineGetValue } from 'libgpiod'
import { GPIOLineReservation } from './gpio-line-reservation'
import { GPIOException } from './gpio-exception'

export class GPIOInputLine extends GPIOLineReservation {

    public getValue(): BitValue {
        this.checkReservation()

        const value = lineGetValue(this.line)
        if (value === StatusError) {
            throw new GPIOException('Line get value failed')

        } else {
            return value
        }
    }

}
