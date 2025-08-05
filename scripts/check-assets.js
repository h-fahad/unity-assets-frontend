// Script to check and fix asset thumbnail URLs
// Run this from the backend directory: node scripts/check-assets.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAssets() {
  try {
    console.log('Checking assets in database...\n');
    
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
        uploadedBy: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log(`Found ${assets.length} assets:\n`);
    
    assets.forEach((asset, index) => {
      console.log(`${index + 1}. ${asset.name}`);
      console.log(`   Category: ${asset.category.name}`);
      console.log(`   Thumbnail: ${asset.thumbnail || 'NULL'}`);
      console.log(`   File URL: ${asset.fileUrl || 'NULL'}`);
      console.log(`   Uploaded by: ${asset.uploadedBy.email}`);
      console.log(`   Created: ${asset.createdAt}`);
      console.log('');
    });
    
    // Check for problematic thumbnail URLs
    const problematicAssets = assets.filter(asset => {
      if (!asset.thumbnail) return false;
      return asset.thumbnail.includes('forest-thumb') || 
             asset.thumbnail.includes('magic-thumb') || 
             asset.thumbnail.includes('knight-thumb') ||
             asset.thumbnail.includes('placeholder.png');
    });
    
    if (problematicAssets.length > 0) {
      console.log(`\n⚠️  Found ${problematicAssets.length} assets with problematic thumbnail URLs:`);
      problematicAssets.forEach(asset => {
        console.log(`   - ${asset.name}: ${asset.thumbnail}`);
      });
      
      console.log('\nTo fix these, you can:');
      console.log('1. Update the thumbnail URLs in the database');
      console.log('2. Upload new thumbnails for these assets');
      console.log('3. Set thumbnail to NULL to use placeholder');
    } else {
      console.log('\n✅ All assets have valid thumbnail URLs');
    }
    
  } catch (error) {
    console.error('Error checking assets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAssets(); 