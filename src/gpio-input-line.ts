import { BitValue, Line, StatusError, lineGetValue, lineRelease, lineSetValue } from "libgpiod";
import { GPIOException } from "./gpio-exception";

export class GPIOInputLine {
    public constructor(private line: Line, private readonly releaseCallback: () => void) { 

    }
    
    public getValue(): BitValue {
        if (this.line) {
            const value = lineGetValue(this.line)
            if (value === StatusError) {
                throw new GPIOException('Line get value failed')

            } else {
                return value
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