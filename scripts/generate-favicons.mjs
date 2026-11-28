// Generates all favicon assets from public/favicon.svg (the NexVault brand mark).
// Run: node scripts/generate-favicons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const svg = readFileSync('public/favicon.svg')

const PNGS = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['apple-icon.png', 180],
  ['android-chrome-192x192.png', 192],
  ['android-chrome-512x512.png', 512],
]

const icoSizes = [16, 32, 48]
const buffers = new Map()

for (const [name, size] of [...PNGS, ...icoSizes.map((s) => [`__ico_${s}`, s])]) {
  const buf = await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
  buffers.set(name, buf)
  console.log(`${name}: ${size}x${size} (${buf.length} bytes)`)
}

for (const [name, size] of PNGS) {
  writeFileSync(`public/${name}`, buffers.get(name))
}

// Assemble favicon.ico — multi-size container holding PNG-encoded frames.
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(icoSizes.length, 4)

let offset = 6 + icoSizes.length * 16
const entries = []
const images = []
for (const size of icoSizes) {
  const data = buffers.get(`__ico_${size}`)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(size === 256 ? 0 : size, 0) // width
  entry.writeUInt8(size === 256 ? 0 : size, 1) // height
  entry.writeUInt8(0, 2) // palette colors
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // color planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(data.length, 8)
  entry.writeUInt32LE(offset, 12)
  entries.push(entry)
  images.push(data)
  offset += data.length
}

writeFileSync('public/favicon.ico', Buffer.concat([header, ...entries, ...images]))
console.log('favicon.ico written (16/32/48 PNG frames)')
console.log('done')
