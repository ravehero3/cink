#!/usr/bin/env node

/**
 * Quick script to update category video URLs to Oracle VPS
 * Run: cd /path/to/cink && npx ts-node scripts/update-category-videos.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const updates = [
  {
    slug: 'voodoo808',
    videoUrl: 'https://videos.ufosport.cz/VOODOO808%204%20UFOSPORT.CZ%202576x584.mov',
    displayName: 'VOODOO808',
  },
  {
    slug: 'space-love',
    videoUrl: 'https://videos.ufosport.cz/SPACE%20LOVE%204%20UFOSPORT.CZ%20257x584.mov',
    displayName: 'SPACE LOVE',
  },
]

async function updateCategories() {
  console.log('🎬 Updating category video URLs...\n')

  for (const update of updates) {
    try {
      console.log(`📹 ${update.displayName}...`)

      const category = await prisma.category.findUnique({
        where: { slug: update.slug },
      })

      if (!category) {
        console.log(`   ❌ Category not found: ${update.slug}\n`)
        continue
      }

      const updated = await prisma.category.update({
        where: { slug: update.slug },
        data: { videoUrl: update.videoUrl },
      })

      console.log(`   ✓ Updated: ${updated.name}`)
      console.log(`   🔗 URL: ${update.videoUrl}`)
      console.log(`   ✅ https://www.ufosport.cz/${update.slug}\n`)
    } catch (error) {
      console.error(`   ❌ Error:`, error instanceof Error ? error.message : error)
      console.log()
    }
  }

  await prisma.$disconnect()
  console.log('✅ Done!')
}

updateCategories().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
