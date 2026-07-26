import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  // Apparel
  { name: 'Kylin Esports Hoodie', description: 'Premium branded hoodie with Kylin logo. Comfortable, warm, and stylish for any gaming session.', price: 2500, category: 'APPAREL' as const, stock: 50 },
  { name: 'Kylin Esports T-Shirt', description: 'Classic-fit cotton tee with Kylin branding. Available in black and purple.', price: 1200, category: 'APPAREL' as const, stock: 100 },
  { name: 'Kylin Esports Cap', description: 'Snapback cap with embroidered Kylin logo. One size fits all.', price: 800, category: 'APPAREL' as const, stock: 75 },
  { name: 'Kylin Jersey — Player Edition', description: 'Pro-player style jersey with moisture-wicking fabric. Customizable with your gamertag.', price: 3000, category: 'APPAREL' as const, stock: 30 },

  // Gaming Gear
  { name: 'Kylin Gaming Mouse', description: 'High-DPI optical sensor, RGB lighting, ergonomic design. Built for competitive play.', price: 3500, category: 'GAMING_GEAR' as const, stock: 40 },
  { name: 'Kylin Mechanical Keyboard', description: 'Blue switch mechanical keyboard with per-key RGB. NKRO and anti-ghosting.', price: 6500, category: 'GAMING_GEAR' as const, stock: 25 },
  { name: 'Kylin Gaming Headset', description: '7.1 surround sound, noise-cancelling mic, memory foam ear cushions. Hear every footstep.', price: 4500, category: 'GAMING_GEAR' as const, stock: 35 },
  { name: 'Kylin Mouse Pad — XL', description: 'Extended 900×400mm desk mat with Kylin artwork. Non-slip rubber base.', price: 1500, category: 'GAMING_GEAR' as const, stock: 60 },
  { name: 'Kylin Gaming Chair', description: 'Ergonomic racing-style chair with adjustable armrests, lumbar support, and Kylin branding.', price: 18000, category: 'GAMING_GEAR' as const, stock: 10 },

  // Accessories
  { name: 'Kylin Wrist Rest', description: 'Memory foam wrist rest with Kylin logo. Perfect for long gaming sessions.', price: 600, category: 'ACCESSORIES' as const, stock: 80 },
  { name: 'Kylin Sticker Pack', description: 'Set of 10 vinyl stickers with Kylin Esports designs. Waterproof and durable.', price: 300, category: 'ACCESSORIES' as const, stock: 200 },
  { name: 'Kylin Phone Case', description: 'Shock-absorbent phone case with Kylin graphics. Available for iPhone and Samsung.', price: 1000, category: 'ACCESSORIES' as const, stock: 45 },
  { name: 'Kylin Lanyard + Badge', description: 'Official Kylin Esports lanyard with collectible badge. Wear your colors.', price: 400, category: 'ACCESSORIES' as const, stock: 150 },
  { name: 'Kylin Water Bottle', description: '500ml insulated bottle with Kylin branding. Keeps drinks cold for 12 hours.', price: 900, category: 'ACCESSORIES' as const, stock: 55 },

  // Other
  { name: 'Kylin Gift Card — 1000 KES', description: 'Digital gift card redeemable on the Kylin Esports shop. Perfect for your gaming friends.', price: 1000, category: 'OTHER' as const, stock: 999 },
  { name: 'Kylin Gift Card — 5000 KES', description: 'Digital gift card redeemable on the Kylin Esports shop. The ultimate gift for gamers.', price: 5000, category: 'OTHER' as const, stock: 999 },
]

async function main() {
  console.log('Seeding products...')

  // Upsert products by name (assumed unique)
  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } })
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: product })
      console.log(`  Updated: ${product.name}`)
    } else {
      await prisma.product.create({ data: product })
      console.log(`  Created: ${product.name}`)
    }
  }

  console.log(`\n✅ ${products.length} products seeded.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
