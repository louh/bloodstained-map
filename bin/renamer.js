const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const z = 3

const NUM_TILES = 108

async function renameImage ({ z, i }) {
  const filename = `map-test_${String(i).padStart(2, '0')}.png`
  const src = path.join(__dirname, `../public/tiles/${z}/${filename}`)

  const x = (i - 1) % 18
  const y = Math.floor((i - 1) / 18)

  const destDir = path.join(__dirname, `../public/tiles/${z}/${x}/`)

  mkdirp(destDir, function (err) {
    if (err) {
      console.error(err)
    } else {
      const dest = `${destDir}${y}.png`
      fs.rename(src, dest, function (err) {
        if (err) throw err
        console.log(`File renamed: ${src} -> ${dest}`)
      })
    }
  })
}

for (let i = 1; i <= NUM_TILES; i++){
  renameImage({ z, i })
}
