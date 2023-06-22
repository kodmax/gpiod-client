import { GPIOController } from '../src'

const gpio = new GPIOController('gpiochip0', 'input27')

const button = gpio.requestLineAsInput(27, 'both', 100)

/**
 * Note that multiple rising or falling events comes from imprefection of mechanical switch
 * @see https://my.eng.utah.edu/~cs5780/debouncing.pdf
 */

button.addListener('rising', event => {
    console.log('button press', event.ts, button.getValue())
})

button.addListener('falling', event => {
    console.log('button release', event.ts, button.getValue())
})
