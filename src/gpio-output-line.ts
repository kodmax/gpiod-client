import { BitValue, StatusError, lineSetValue } from "libgpiod"
import { GPIOLineReservation } from "./gpio-line-reservation"
import { GPIOException } from "./gpio-exception"

export class GPIOOutputLine extends GPIOLineReservation {

    public setValue(value: BitValue): void {
        this.checkReservation()

        if (lineSetValue(this.line, value) === StatusError) {
            throw new GPIOException('Line set value failed')
        }
    }

}