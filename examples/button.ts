import { GPIOController } from '../src'

const gpio = new GPIOController('gpiochip0', 'input27')

const line2 = gpio.requestLineAsInput(2, 'both', 100)
const button = line2.createDebouncer(100)

console.log('go!')
button.addListener('switch', event => {
    console.log('switch', event)
})
