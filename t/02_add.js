'use strict'
var test    = require('tape')
var stream  = require('readable-stream')
var through = require('through2')
var Clazy   = require('../index')
var fs      = require('fs')
var path    = require('path')
var mkdirp  = require('mkdirp')
var remove  = require('remove')

test('lazyStream.add(readableStream)', (t) => {
    var ping = []
    var lazyStream = Clazy()

    lazyStream
      .on('data', (data) => {
        ping.push(data)
      })
      .on('end', () => {
        t.ok(1, 'lazyStream ended')
        t.deepEqual(ping, ["0","1","2","3","4","5","6","7","8"]
          , 'ping deepEq  ["0","1","2","3","4","5","6","7","8"]')
        t.end()
      })

    ;('123456789').split('').forEach((n) => {
        var rs = new stream.Readable
        rs._read = function () {}

        lazyStream.add(rs.on('data', (n) => {/*dummp*/}))

        rs.push(n)
        rs.push(null)
    })
})

test('lazyStream.add(readableStream) # with error', (t) => {
    var ping = []
    var errs = []
    var lazyStream = Clazy()

    lazyStream
      .on('data', (data) => {
        ping.push(data)
      })
      .on('error', (err) => {
        errs.push(err.message)
      })
      .on('end', () => {
        t.ok(1, 'lazyStream ended')
        t.deepEqual(errs, ["count: 5, ping: 4"], 'errs deepEq ["count: 5, ping: 4"]')
        t.deepEqual(ping, ["0","1","2","3","5","6","7","8"]
          , 'ping deepEq  ["0","1","2","3","5","6","7","8"]')
        t.end()
      })

    ;('123456789').split('').forEach((n) => {
        var rs = new stream.Readable
        rs._read = function () {}

        lazyStream.add(rs.on('data', (n) => {/*dummp*/}))

        if (n === '5') {
            return rs.emit('error', new Error('count: 5, ping: 4'))
        }

        rs.push(n)
        rs.push(null)
    })
})

test('lazyStream.add(writableStream)', (t) => {
    var ping = []
    var lazyStream = Clazy()

    lazyStream
      .on('data', (data) => {
        ping.push(data)
      })
      .on('end', () => {
        t.ok(1, 'lazyStream ended')
        t.deepEqual(ping, ["0","1","2","3","4","5","6","7","8"]
          , 'ping deepEq  ["0","1","2","3","4","5","6","7","8"]')
        t.end()
      })

    ;('123456789').split('').forEach((n) => {
        var ws = new stream.Writable
        ws._write = function (data, enc, done) {
            setTimeout(done, 10)
        }

        lazyStream.add(ws)

        ws.end(n)
    })
})

test('lazyStream.add(writableStream) # with error', (t) => {
    var ping = []
    var errs = []
    var lazyStream = Clazy()

    lazyStream
      .on('data', (data) => {
        ping.push(data)
      })
      .on('error', (err) => {
        errs.push(err.message)
      })
      .on('end', () => {
        t.ok(1, 'lazyStream ended')
        t.deepEqual(ping, ["0","1","3","4","6","7"]
          , 'ping deepEq  ["0","1","3","4","6","7"]')
        t.deepEqual(errs, ["count: 3, ping: 2", "count: 6, ping: 5", "count: 9, ping: 8"]
          , 'errs deepEq ["count: 3, ping: 2", "count: 6, ping: 5", "count: 9, ping: 8"]')
        t.end()
      })

    ;('123456789').split('').forEach((n, i) => {
        var ws = new stream.Writable
        ws._write = function (data, enc, done) {
            setTimeout(() => {
                var err
                if (0 === data % 3)
                    err = new Error('count: ' + n + ', ping: ' + i)
                done(err)
            }, 10)
        }

        lazyStream.add(ws)

        ws.end(n)
    })
})

test('lazyStream.add(stream)', (t) => {
    var savedDir = path.join(__dirname, 'copies')

    function setup (f) {
        mkdirp(savedDir, f)
    }

    function teardown (end) {
        remove(savedDir, (err) => {
            err ? console.error(err)
                : console.log('# teardown remove "%s"', savedDir)
            end()
        })
    }

    setup((err) => {
        if (err) {
            console.error(err)
            return t.end()
        }

        console.log('# setup mkdirp "%s"', savedDir)

        var ping  = []
        var errs = []
        var lazyStream = Clazy()

        lazyStream
          .on('end', () => {
            t.ok(1, 'lazyStream.ended')
            t.is(ping.length, 3, 'ping.length === 3')
            t.deepEqual(ping.sort(), ['0', '1', '2'], 'ping.sort() deepEq ["1", "2", "3"]')

            teardown(t.end)
          })
          .pipe(through((str, enc, done) => {
            ping.push(String(str))
            done()
          }))

        ;[
            './txt/foo.txt'
          , './txt/bar.txt'
          , './txt/beep.txt'
        ].forEach((filePath) => {
            var savePath    = path.join(__dirname, 'copies', path.basename(filePath))
            var readStream  = fs.createReadStream(path.join(__dirname, filePath))
            var writeStream = fs.createWriteStream(savePath)

            lazyStream.add(readStream.pipe(writeStream))
        })
    })
})
