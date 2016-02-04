'use strict'
var test = require('tape')
var Clazy = require('../index')

test('create lazy stream', (t) => {
    t.test('var lazySteram = new Clazy', (tt) => {
        var lazyStream = new Clazy
        tt.ok(lazyStream.add, 'lazyStream.add')
        tt.ok(lazyStream.wait, 'lazyStream.wait')
        tt.ok(lazyStream._readableState, 'lazyStream._readableState')
        tt.end()
    })
    t.test('var lazySteram = Clazy()', (tt) => {
        var lazyStream = Clazy()
        tt.ok(lazyStream.add, 'lazyStream.add')
        tt.ok(lazyStream.wait, 'lazyStream.wait')
        tt.ok(lazyStream._readableState, 'lazyStream._readableState')
        tt.end()
    })
    t.end()
})
