import { GPIOController } from '../src/'

const gpio = new GPIOController('gpiochip0', 'blink17')

const button = gpio.requestLineAsInput(27)
const led = gpio.requestLineAsOutput(17, 1)

let i = 0
setInterval(() => {
    led.setValue(++i % 2 ? 1 : 0)
    console.log(button.getValue())
}, 150)
