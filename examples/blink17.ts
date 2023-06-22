import { GPIOController } from '../src/'

const gpio = new GPIOController('gpiochip0', 'blink17')

const led = gpio.requestLineAsOutput(17, 1)
let i = 0
setInterval(() => {
    led.setValue(++i % 2 ? 1 : 0)
}, 50)
