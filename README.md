# clazy

wait for the end of multiple asynchronous processing.

## usage

```js
var Clazy = require('clazy')
var fs    = require('fs')
var path  = require('path')

// lazyStream.add(stream)
var lazyStream = new Clazy

lazyStream
    .on('error', console.error.bind(console))
    .on('data', function (ping) {
        console.dir(ping)
    })
    .on('end', function () {
        console.log('Copy completed')
    })

;[
    'path/to/img1.jpg'
  , 'path/to/img2.jpg'
  , 'path/to/img3.jpg'
].forEach(function (imgPath) {
    var savePath    = path.join('path/to/cp/', path.basename(imgPath))
    var readStream  = fs.createReadStream(imgPath)
    var writeStream = fs.createWriteStream(savePath)

    lazyStream.add(readStream.pipe(writeStream))
})

// lazyStream.wait(function (clear) { ... })
var lazyStream = new Clazy

lazyStream
    .on('error', console.error.bind(console))
    .on('data', function (ping) {
        console.dir(ping)
    })
    .on('end', function () {
        console.log('all works completed')
    })


;[5,3,4,1,2].forEach(function (s) {
    lazyStream.wait(functon (clear) {
        setTimeout(function () {
            console.log(s)
            clear()
        }, s * 1000)
    })
})
```

### api

```js
var clazyStream = new Clazy
```

create a new lazy stream. this stream is readable.

```js
clazyStream.add(stream)
```

clazyStream issue the data when added `stream` has ended (or finised).
the data is the order in witch they are registered clazyStream.
however, if the stream emit error, clazyStream will emit error.
clazyStream will emit end when all streams has ended (or finished).

```js
clazyStream.wait(function (clear) {
    // asyncwork has ended -> clear()
    // asyncwork has error -> clear(err)
})
```

### License

MIT

### author

ishiduca
