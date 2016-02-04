'use strict'
var test    = require('tape')
var through = require('through2')
var Clazy   = require('../index')

var fs      = require('fs')
var path    = require('path')
var mkdirp  = require('mkdirp')
var remove  = require('remove')

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

test('lazyStream.add(stream)', (t) => {
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

var stream = require('readable-stream')

test('lazyStream.add(stream) # with error', (t) => {
    var ping  = []
    var errs = []
    var lazyStream = Clazy()

    lazyStream
        .on('error', (err) => {
            errs.push(err.message)
        })
        .on('end', () => {
            t.ok(1, 'lazyStream.ended')
            t.deepEqual(errs, ['number 2', 'number 4'], 'errs deepEq ["number 2", "number 4"]')
            t.deepEqual(ping, ['0', '2', '4'], 'ping deepEq ["0", "2", "4"]')
            t.end()
        })
        .pipe(through.obj((n, _, done) => {
            ping.push(n)
            done()
        }))

    ;[1, 2, 3, 4, 5].forEach((n) => {
        var ws = new stream.Writable({objectMode: true})
        ws._write = function (n, enc, done) {
            if (n % 2 === 0)
                return done(new Error('number ' + n))
            done()
        }

        lazyStream.add(ws)

        ws.end(n)
    })
})
