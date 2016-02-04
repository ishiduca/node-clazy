var stream   = require('readable-stream')
var inherits = require('inherits')
var eos      = require('end-of-stream')

module.exports = Clazy
inherits(Clazy, stream.Readable)

function Clazy () {
    if (!(this instanceof Clazy)) return new Clazy
    stream.Readable.call(this, {encoding: 'utf8'})
    this._onWorks = []
    this._count   = 0
}

Clazy.prototype._read = function () {}

Clazy.prototype.add = function (strm) {
    this._onWorks.push(strm)
    this._count += 1

    var me = this

    eos(strm, function (err) {
        if (err) {
            me.emit('error', err)
        } else {
            me.push(String(me._onWorks.indexOf(strm)))
        }
        if ((me._count -= 1) === 0) {
            me.push(null)
            me._onWorks = []
        }
    })
}

Clazy.prototype.wait = function (f) {
    var payload = {id: (this._count += 1)}
    this._onWorks.push(payload)

    var me = this

    f(function (err) {
        if (err) {
            me.emit('error', err)
        } else {
            me.push(String(me._onWorks.indexOf(payload)))
        }

        if ((me._count -= 1) === 0) {
            me.push(null)
            me._onWorks = []
        }
    })
}
