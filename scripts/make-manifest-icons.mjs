/**
 * Renders the 512×512 manifest icons of the properties (the logo, in white, over the brand color)
 * from the SVG logos in public/brand into src/endpoints/seed/tenant-assets. Run again after changing
 * a logo or a color: `node scripts/make-manifest-icons.mjs`. Design can replace the PNGs.
 */
import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const out = 'src/endpoints/seed/tenant-assets'
const SIZE = 512

const icons = [
  // Digio: the same navy as the app icon, rounded like it.
  {
    file: 'digio-manifest-icon.png',
    logo: 'public/brand/logo-digio-branco.svg',
    color: '#1c2048',
    radius: 112,
    width: 0.66,
  },
  // Uber Conta: black, with the wordmark (placeholder until design provides the app icon).
  {
    file: 'uber-conta-manifest-icon.png',
    logo: 'public/brand/uber-conta-logo.svg',
    color: '#000000',
    radius: 0,
    width: 0.66,
  },
]

for (const { file, logo, color, radius, width } of icons) {
  const mark = await sharp(await readFile(logo), { density: 600 })
    .resize({ width: Math.round(SIZE * width) })
    .png()
    .toBuffer()
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="${radius}" fill="${color}"/></svg>`,
  )
  await writeFile(
    `${out}/${file}`,
    await sharp(background)
      .composite([{ input: mark, gravity: 'center' }])
      .png()
      .toBuffer(),
  )
  console.log(`${out}/${file}`)
}
