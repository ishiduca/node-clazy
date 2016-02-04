'use strict'
var test    = require('tape')
var through = require('through2')
var Clazy   = require('../index')

test('lazyStream.wait(function (clear) {...})', (t) => {
    var ping  = []
    var outs = []
    var lazyStream = Clazy()

    lazyStream.on('error', console.error.bind(console))
      .on('end', () => {
        t.ok(1, 'lazyStream ended')
        t.deepEqual(outs, [5, 3, 4, 1, 2], 'outs deepEq [5, 3, 4, 1, 2]')
        t.deepEqual(ping, ['0', '1', '2', '3', '4'], "ping deepEq ['0', '1', '2', '3', '4']")
        t.end()
      })
      .pipe(through((str, enc, done) => {
        ping.push(String(str))
        done()
      }))

    ;[5, 3, 4, 1, 2].forEach((n) => {
        lazyStream.wait((clear) => {
            setTimeout(() => {
                outs.push(n)
                clear()
            }, 100)
        })
    })
})

test('lazyStream.wait(function (clear) {...}) # with error', (t) => {
    var ping  = []
    var errs = []
    var lazyStream = Clazy()

    lazyStream
      .on('end', () => {
        t.ok(1, 'lazyStream ended')
        t.deepEqual(errs, ['number 4', 'number 2'], 'errs deepEq ["number 4", "number 2"]')
        t.deepEqual(ping, ['0', '1', '3'], "ping deepEq ['0', '1', '3']")
        t.end()
      })
      .on('error', (err) => {
        errs.push(err.message)
      })
      .pipe(through((str, enc, done) => {
        ping.push(String(str))
        done()
      }))

    ;[5, 3, 4, 1, 2].forEach((n) => {
        lazyStream.wait((clear) => {
            setTimeout(() => {
                if (n % 2 === 0)
                    clear(new Error('number ' + n))
                else
                    clear()
            }, 100)
        })
    })
})
