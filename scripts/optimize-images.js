import sharp from 'sharp'
import { readdirSync, statSync } from 'fs'
import { join, parse } from 'path'

const dirs = [
  'public/imagenes/carrusel',
  'public/imagenes/galeria',
]

async function optimize(filePath) {
  const { name, ext } = parse(filePath)
  const webpPath = join(parse(filePath).dir, `${name}.webp`)

  try {
    const info = await sharp(filePath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(webpPath)

    const origSize = statSync(filePath).size
    const saved = ((1 - info.size / origSize) * 100).toFixed(1)
    console.log(`  ${name}${ext}  ${(origSize / 1024).toFixed(0)}KB → ${(info.size / 1024).toFixed(0)}KB (${saved}%)`)
  } catch (err) {
    console.error(`  ${filePath}: ${err.message}`)
  }
}

async function main() {
  console.log('Optimizando imágenes a WebP...\n')
  for (const dir of dirs) {
    console.log(`📁 ${dir}`)
    try {
      const files = readdirSync(dir)
      const images = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f))
      for (const file of images) {
        await optimize(join(dir, file))
      }
    } catch {
      console.log(`  No encontrado`)
    }
  }
  console.log('\n✅ Hecho')
}

main()
