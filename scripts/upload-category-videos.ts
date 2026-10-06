import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { uploadToOracleVPS } from '@/lib/oracle-vps'

const prisma = new PrismaClient()

interface VideoConfig {
  slug: string
  localPath: string
  categoryName: string
}

const videos: VideoConfig[] = [
  {
    slug: 'voodoo808',
    localPath: '/Users/voodoo808/Movies/VOODOO808 4 UFOSPORT.CZ 2576x584.mov',
    categoryName: 'VOODOO808',
  },
  {
    slug: 'space-love',
    localPath: '/Users/voodoo808/Movies/SPACE LOVE 4 UFOSPORT.CZ 257x584.mov',
    categoryName: 'SPACE LOVE',
  },
]

async function uploadCategoryVideos() {
  console.log('🎬 Starting category video uploads to Oracle VPS...\n')

  for (const video of videos) {
    try {
      console.log(`📹 Processing: ${video.categoryName} (${video.slug})`)

      // Read video file
      const buffer = await readFile(video.localPath)
      console.log(`   ✓ Read file: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`)

      // Upload to Oracle VPS
      const filename = video.localPath.split('/').pop() || `${video.slug}-banner.mov`
      console.log(`   ⬆️  Uploading to Oracle VPS as: ${filename}`)

      const uploadResult = await uploadToOracleVPS(buffer, filename)
      console.log(`   ✓ Oracle VPS URL: ${uploadResult.url}`)

      // Find category by slug
      const category = await prisma.category.findUnique({
        where: { slug: video.slug },
      })

      if (!category) {
        console.log(`   ❌ Category not found: ${video.slug}\n`)
        continue
      }

      console.log(`   ✓ Found category: ${category.name} (ID: ${category.id})`)

      // Update category with new videoUrl
      const updated = await prisma.category.update({
        where: { id: category.id },
        data: { videoUrl: uploadResult.url },
      })

      console.log(`   ✓ Updated category videoUrl`)
      console.log(`   ✅ Success! Video is live at: https://www.ufosport.cz/${video.slug}\n`)
    } catch (error) {
      console.error(`   ❌ Error processing ${video.categoryName}:`, error instanceof Error ? error.message : error)
      console.log()
    }
  }

  await prisma.$disconnect()
  console.log('✅ All videos processed!')
}

uploadCategoryVideos().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
