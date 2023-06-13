import { GPIOController } from '../src/'

const gpio = new GPIOController('gpiochip0', 'blink17')

const button = gpio.requestLineEvents(27, 'Rising')
button.addListener('edge', event => {
    console.log('edge event', event)
})

const led = gpio.requestLineAsOutput(17, 1)
let i = 0
setInterval(() => {
    led.setValue(++i % 2 ? 1 : 0)
}, 150)
