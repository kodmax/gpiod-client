import { chipOpenByName, Chip, chipClose, Line, chipGetLine, lineRequestOutput, BitValue, StatusSuccess, lineRequestInput, lineRequestEvents, Edge } from 'libgpiod'
import { GPIOException, gpioExceptions } from './gpio-exception'
import { GPIOOutputLine } from './gpio-output-line'
import { GPIOInputLine } from './gpio-input-line'
import { GPIOLineReservation } from './gpio-line-reservation'

export class GPIOController {
    private readonly lineHandlers: Map<Line, GPIOOutputLine | GPIOInputLine | GPIOLineReservation>
    private readonly lines: Map<number, Line>
    private chip: Chip

    public constructor(private readonly chipName: string, private readonly consumerId: string) {
        this.chip = chipOpenByName(chipName)
        if (this.chip === null) {
            throw new GPIOException(gpioExceptions.E_CHIP_OPEN)
        }

        this.lineHandlers = new Map()
        this.lines = new Map()
    }

    private getLine(offset: number): Line {
        if (this.lines.has(offset)) {
            return this.lines.get(offset)

        } else {
            const line = chipGetLine(this.chip, offset)

            if (line === null) {
                throw new GPIOException(gpioExceptions.E_GET_LINE, offset)

            } else {
                this.lines.set(offset, line)
                return line
            }
        }
    }

    public requestLineAsOutput(offset: number, initialValue: BitValue): GPIOOutputLine {
        const currentHandler = this.lineHandlers.get(offset)
        if (currentHandler) {
            if (currentHandler instanceof GPIOOutputLine) {
                return currentHandler

            } else {
                currentHandler.release()
            }
        }

        const line = this.getLine(offset)
        if (lineRequestOutput(line, this.consumerId, initialValue) === StatusSuccess) {
            const output = new GPIOOutputLine(line, initialValue, () => {
                this.lineHandlers.delete(offset)
            })

            this.lineHandlers.set(offset, output)
            return output

        } else {
            throw new GPIOException(gpioExceptions.E_LINE_REQUEST_OUTPUT, offset)
        }

    }

    public requestLineAsInput(offset: number, edge?: Edge, pollingInterval?: number): GPIOInputLine {
        const currentHandler = this.lineHandlers.get(offset)
        if (currentHandler) {
            if (currentHandler instanceof GPIOInputLine) {
                return currentHandler

            } else {
                currentHandler.release()
            }
        }

        const line = this.getLine(offset)
        if (edge) {
            if (lineRequestEvents(line, this.consumerId, edge) !== StatusSuccess) {
                throw new GPIOException(gpioExceptions.E_LINE_REQUEST_EVENTS, offset)
            }

        } else {
            if (lineRequestInput(line, this.consumerId) !== StatusSuccess) {
                throw new GPIOException(gpioExceptions.E_LINE_REQUEST_INPUT, offset)
            }
        }

        const input = new GPIOInputLine(line, pollingInterval, () => {
            this.lineHandlers.delete(offset)
        })

        this.lineHandlers.set(offset, input)
        return input
    }

    public close(): void {
        chipClose(this.chip)
        this.chip = void 0
    }
}
