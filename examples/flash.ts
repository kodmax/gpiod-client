import { GPIOController } from '../src'

const gpio = new GPIOController('gpiochip0', 'blink17')

const led = gpio.requestLineAsOutput(17, 0)

setInterval(() => {
    led.trigger(1, 10000)
}, 1000)
