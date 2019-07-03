const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const z = 4
const NUM_TILES = 512
const NUM_PER_ROW = 32

async function renameImage ({ z, i }) {
  const filename = `Complete-8K-Map_${String(i).padStart(2, '0')}.png`
  const src = path.join(__dirname, `../tiles/${z}/images/${filename}`)

  const x = (i - 1) % NUM_PER_ROW
  const y = Math.floor((i - 1) / NUM_PER_ROW)

  const destDir = path.join(__dirname, `../tiles/${z}/${x}/`)

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
