import { GPIOController } from '../src/'

const gpio = new GPIOController('gpiochip0', 'blink17')

const button = gpio.requestButtonEvents(27)
button.addListener('tap', event => {
    console.log('button tap', event)
})

const led = gpio.requestLineAsOutput(17, 1)
let i = 0
setInterval(() => {
    led.setValue(++i % 2 ? 1 : 0)
}, 50)
