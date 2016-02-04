'use strict'
const clazy = require('../index')
const lzy   = clazy()

lzy
  .on('error', (err) => {
    console.log('# error')
    console.error('! %s can not greets...', err.message)
  })
  .on('data', (data) => {
     console.log('# finsih -- "%d"', data)
  })
  .once('end', console.log.bind(console, 'all works ended'))


;('Ben Poison Water Bonz').split(' ').forEach((name) => {
    lzy.wait((clear) => {
        let c = Math.floor(Math.random() * 10) * 1000
        setTimeout(() => {
            let err
            if (/poison/i.test(name)) {
                err = new Error(name)
            } else {
                console.log('%s > hello', name)
            }
            clear(err)
        }, c)
        console.log('> hello "%s"', name)
    })
})
