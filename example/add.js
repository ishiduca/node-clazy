'use strict'
const path   = require('path')
const fs     = require('fs')
const mkdirp = require('mkdirp')
const clazy   = require('../')
const lzy     = clazy()
const saveDir = path.join(__dirname, 'copies')

mkdirp(saveDir, (err) => {
    if (err) {
        return console.error(err)
    }

    lzy
        .on('data', (data) => {
            console.log('finish -- %d', data)
        })
        .on('error', (err) => {
            console.error(err)
        })
        .once('end', () => {
            console.log('copy all files')
        })


    ;('pony foo bar fuz').split(' ').map(f).forEach((txtPath) => {
        var savePath = path.join(saveDir, path.basename(txtPath))
        var rs       = fs.createReadStream( txtPath)
        var ws       = fs.createWriteStream(savePath)

        rs.on('error', (err) => {
            ws.emit('error', err)
        })

        lzy.add(rs.pipe(ws))
    })
})

function f (name) {
    return path.join(__dirname, 'txt/' + name + '.txt')
}
