import { chipOpenByName, Chip, chipClose, Line, chipGetLine, lineRequestOutput, BitValue, StatusSuccess, lineRequestInput, lineRequestEvents, Edge } from 'libgpiod'
import { GPIOException } from './gpio-exception'
import { GPIOOutputLine } from './gpio-output-line'
import { GPIOInputLine } from './gpio-input-line'
import { GPIOLineReservation } from './gpio-line-reservation'
import { GPIOLineEvents } from './gpio-line-events'
import { GPIOButtonEvents } from './gpio-button-events'

export class GPIOController {
    private readonly lineHandlers: Map<Line, GPIOOutputLine | GPIOInputLine | GPIOLineReservation>
    private readonly lines: Map<number, Line>
    private chip: Chip

    public constructor(private readonly chipName: string, private readonly consumerId: string) {
        this.chip = chipOpenByName(chipName)
        if (this.chip === null) {
            throw new GPIOException('GPIO Chip not found')
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
                throw new GPIOException('Line open failed for line: ' + offset)

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
            const output = new GPIOOutputLine(line, () => {
                this.lineHandlers.delete(offset)
            })

            this.lineHandlers.set(offset, output)
            return output

        } else {
            throw new GPIOException('Requesting line as output failed for line: ' + offset)
        }

    }

    public requestLineAsInput(offset: number): GPIOInputLine {
        const currentHandler = this.lineHandlers.get(offset)
        if (currentHandler) {
            if (currentHandler instanceof GPIOInputLine) {
                return currentHandler

            } else {
                currentHandler.release()
            }
        }

        const line = this.getLine(offset)
        if (lineRequestInput(line, this.consumerId) === StatusSuccess) {
            const input = new GPIOInputLine(line, () => {
                this.lineHandlers.delete(offset)
            })

            this.lineHandlers.set(offset, input)
            return input

        } else {
            throw new GPIOException('Requesting line as input failed for line: ' + offset)
        }
    }

    public requestLineEvents(offset: number, edge: Edge, pollingInterval: number): GPIOLineEvents {
        const currentHandler = this.lineHandlers.get(offset)
        if (currentHandler) {
            if (currentHandler instanceof GPIOLineEvents) {
                return currentHandler

            } else {
                currentHandler.release()
            }
        }

        const line = this.getLine(offset)
        if (lineRequestEvents(line, this.consumerId, edge) === StatusSuccess) {
            const input = new GPIOLineEvents(line, pollingInterval, () => {
                this.lineHandlers.delete(offset)
            })

            this.lineHandlers.set(offset, input)
            return input

        } else {
            throw new GPIOException('Requesting line events failed for line: ' + offset)
        }
    }

    public requestButtonEvents(offset: number, pressValue: BitValue = 1, minimumTapTime: number = 0.001): GPIOButtonEvents {
        const currentHandler = this.lineHandlers.get(offset)
        if (currentHandler) {
            if (currentHandler instanceof GPIOButtonEvents) {
                return currentHandler

            } else {
                currentHandler.release()
            }
        }

        const line = this.getLine(offset)
        if (lineRequestEvents(line, this.consumerId, 'both') === StatusSuccess) {
            const input = new GPIOButtonEvents(line, pressValue, minimumTapTime, () => {
                this.lineHandlers.delete(offset)
            })

            this.lineHandlers.set(offset, input)
            return input

        } else {
            throw new GPIOException('Requesting button events failed for line: ' + offset)
        }
    }

    public close(): void {
        chipClose(this.chip)
        this.chip = void 0
    }
}