# GPIO Controller for Node.js done right
Intuitive, fun to use, object-oriented implementation. 

Thanks to C++ bindings this package is using kernel level GPIO access via libgpiod (see https://kernel.googlesource.com/pub/scm/libs/libgpiod/libgpiod/+/v0.2.x/README.md). The library offers accuracy and reliability. It can also register changes as quick as 1 microsecond or less and does not require extensive pooling. 

Written in TypeScript.

# Installation
```sh
sudo apt update
sudo apt-get install libgpiod-dev
yarn add gpiod-client
```

# API Reference
  https://kodmax.github.io/gpiod-client/classes/GPIOController.html

# Digital Input
## Features
 - reading current value
 - listening for input events: rising and/or falling edge
 - nanoseconds precision for each event provided by linux kernel
 - software input debouncer for ease of use with mechanical switches
 - configurable 'hold' event triggered after each hold time is reached
## Polling interval
### Linux kernel
The input events are collected at kernel level. Each event has a high resolution timer timestamp attached. The precision goes to nanoseconds level.
### Input line configuration
Each input line can be configured with different pooling interval to read those events. Regardless of the pooling interval the precision remains the same and no events are lost.
If edge events are not needed, no pooling is required.
## Examples
### Logging button events
```ts
import { GPIOController } from 'gpiod-client'

const gpio = new GPIOController('gpiochip0', 'input27')

// look for both falling and rising edges
// read the events queue from linux kernel every 100ms
const line2 = gpio.requestLineAsInput(2, 'both', 100) 

// debounce the mechanical switch noise for 50ms
// trigger a hold event after 300ms press and then after 1 second press
const button = line2.createDebouncer(50, 0, [300, 1000]) 

console.log('Hit the button!')

button.addListener('press', () => {
    console.log('press')
})

button.addListener('release', () => {
    console.log('release')
})

button.addListener('hold', ev => {
    console.log('hold', ev.time, 'ms')
})
```
# Digital output
## Features
 - setting a value
 - optionally pausing program execution after setings a value (sleep in microseconds). Convenient if the connected circuit needs some microseconds to process the input change
 - sending an impulse (trigger in microseconds) of 0 or 1. Convenient for triggering RST or other functions.

## Examples
### Classic, blink as led by settings 0 and 1 in interval of 50 miliseconds
```ts
import { GPIOController } from 'gpiod-client'

const gpio = new GPIOController('gpiochip0', 'blink17')
const led = gpio.requestLineAsOutput(17, 1)

let i = 0
setInterval(() => {
    led.setValue(++i % 2 ? 1 : 0)
}, 50)
```
### Flash led for 10 miliseconds every second using trigger
```ts
import { GPIOController } from 'gpiod-client'

const gpio = new GPIOController('gpiochip0', 'blink17')
const led = gpio.requestLineAsOutput(17, 0)

setInterval(() => {
    led.trigger(1, 10000)
}, 1000)
```
