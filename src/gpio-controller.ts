import { chipOpenByName, Chip, chipClose, Line, chipGetLine, lineRequestOutput, BitValue, StatusSuccess, lineRequestInput } from 'libgpiod'
import { GPIOException } from './gpio-exception'
import { GPIOOutputLine } from './gpio-output-line'
import { GPIOInputLine } from './gpio-input-line'

export class GPIOController {
    private readonly outputLines: Map<Line, GPIOOutputLine> = new Map()
    private readonly inputLines: Map<Line, GPIOInputLine> = new Map()
    private readonly lines: Map<number, Line> = new Map()
    private chip: Chip

    public constructor(private readonly chipName: string, private readonly consumerId: string) {
        this.chip = chipOpenByName(chipName)
        if (this.chip === null) {
            throw new GPIOException('GPIO Chip not found')
        }
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
        if (this.outputLines.has(offset)) {
            return this.outputLines.get(offset)!
        }

        if (this.inputLines.has(offset)) {
            this.inputLines.get(offset)!.release()
        }

        const line = this.getLine(offset)
        if (lineRequestOutput(line, this.consumerId, initialValue) === StatusSuccess) {
            const output = new GPIOOutputLine(line, () => {
                this.outputLines.delete(offset)
            })

            this.outputLines.set(offset, output)
            return output

        } else {
            throw new GPIOException('Requesting line as output failed for line: ' + offset)
        }

    }

    public requestLineAsInput(offset: number): GPIOInputLine {
        if (this.inputLines.has(offset)) {
            return this.inputLines.get(offset)!
        }

        if (this.outputLines.has(offset)) {
            this.outputLines.get(offset)!.release()
        }

        const line = this.getLine(offset)
        if (lineRequestInput(line, this.consumerId) === StatusSuccess) {
            const input = new GPIOInputLine(line, () => {
                this.inputLines.delete(offset)
            })

            this.inputLines.set(offset, input)
            return input

        } else {
            throw new GPIOException('Requesting line as input failed for line: ' + offset)
        }

    }

    public close(): void {
        chipClose(this.chip)
        this.chip = void 0
    }
}