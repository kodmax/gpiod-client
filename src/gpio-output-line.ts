import { BitValue, Line, StatusError, lineRelease, lineSetValue } from "libgpiod";
import { GPIOException } from "./gpio-exception";

export class GPIOOutputLine {
    public constructor(private line: Line, private readonly releaseCallback: () => void) { }
    
    public setValue(value: BitValue): void {
        if (this.line) {
            if (lineSetValue(this.line, value) === StatusError) {
                throw new GPIOException('Line set value failed')
            }
    
        } else {
            throw new GPIOException('Line already released')
        }
    }

    public release(): void {
        this.releaseCallback()

        lineRelease(this.line)
        this.line = null
    }
}