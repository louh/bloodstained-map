const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const z = 5
const NUM_TILES = 512
const NUM_PER_ROW = 32
// const z = 4
// const NUM_TILES = 128
// const NUM_PER_ROW = 16
// const z = 3
// const NUM_TILES = 32
// const NUM_PER_ROW = 8
// const z = 2
// const NUM_TILES = 8
// const NUM_PER_ROW = 4

// NOTE: Photoshop has a save-for-web pixel limit of 8192 pixels!
// const z = 5
// const NUM_TILES = 256
// const NUM_PER_ROW = 16

async function renameImage ({ z, i }) {
  const filename = `Complete-8K-Map-copy_${String(i).padStart(2, '0')}.png`
  const src = path.join(__dirname, `../public/tiles/${z}/images/${filename}`)

  const x = (i - 1) % NUM_PER_ROW
  // const x = (i - 1) % NUM_PER_ROW + 16
  const y = Math.floor((i - 1) / NUM_PER_ROW)

  const destDir = path.join(__dirname, `../public/tiles/${z}/${x}/`)

  mkdirp(destDir, function (err) {
    if (err) {
      console.error(err)
    } else {
      const dest = `${destDir}${y}@2x.png`
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
