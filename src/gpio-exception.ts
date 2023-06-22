export enum gpioExceptions {
    E_LINE_NOT_RESERVED,

    E_LINE_EVENT_WAIT,
    E_LINE_EVENT_READ,
    E_LINE_GET_VALUE,
    E_LINE_SET_VALUE,

    E_LINE_REQUEST_OUTPUT,
    E_LINE_REQUEST_EVENTS,
    E_LINE_REQUEST_INPUT,

    E_CHIP_OPEN,
    E_GET_LINE,
}

export class GPIOException extends Error {
    public constructor(public readonly code: number, public readonly lineOffset?: number) {
        super(gpioExceptions[code])
    }
}
