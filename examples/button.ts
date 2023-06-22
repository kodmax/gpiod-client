import { GPIOController } from '../src'

const gpio = new GPIOController('gpiochip0', 'input27')

const line2 = gpio.requestLineAsInput(2, 'both', 100)
const button = line2.createDebouncer(50, 0, [300, 1000])

console.log('go!')

button.addListener('press', () => {
    console.log('press')
})

button.addListener('release', () => {
    console.log('release')
})

button.addListener('hold', ev => {
    console.log('hold', ev.time, 'ms')
})
