import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check if already seeded
    const count = await db.product.count()
    if (count > 0) {
      return NextResponse.json({
        seeded: true,
        count,
        message: 'Database already seeded. Use POST /api/seed to re-seed.',
      })
    }

    // Auto-seed if empty
    return seedDatabase()
  } catch (error: any) {
    // If tables don't exist, the query itself will fail
    console.error('Seed check error:', error)
    return NextResponse.json(
      {
        error: 'Database tables may not exist. Run `npx prisma db push` first.',
        details: error?.message || String(error),
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    return seedDatabase()
  } catch (error: any) {
    console.error('Seed POST error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error?.message || String(error) },
      { status: 500 }
    )
  }
}

async function seedDatabase() {
  // Clean all tables in reverse dependency order
  await db.auditLog.deleteMany()
  await db.demandForecast.deleteMany()
  await db.shipmentItem.deleteMany()
  await db.shipment.deleteMany()
  await db.workOrderProduct.deleteMany()
  await db.workOrder.deleteMany()
  await db.bomComponent.deleteMany()
  await db.ecommerceOrder.deleteMany()
  await db.posTransaction.deleteMany()
  await db.salesOrder.deleteMany()
  await db.customer.deleteMany()
  await db.inventoryMovement.deleteMany()
  await db.inventoryItem.deleteMany()
  await db.purchaseOrderItem.deleteMany()
  await db.purchaseOrder.deleteMany()
  await db.supplier.deleteMany()
  await db.warehouse.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.user.deleteMany()

  // ─── USERS ────────────────────────────────────────────────────────
  const userAlex = await db.user.create({
    data: { email: 'alex@goldgem.com', name: 'Alex Carter', password: '$2b$10$placeholderHash', role: 'admin' },
  })
  const userSarah = await db.user.create({
    data: { email: 'sarah@goldgem.com', name: 'Sarah Mitchell', password: '$2b$10$placeholderHash', role: 'manager' },
  })

  // ─── CATEGORIES ───────────────────────────────────────────────────
  const catGold = await db.category.create({ data: { name: 'Gold Necklaces', icon: 'Necklace', color: '#D4A017' } })
  const catDiamond = await db.category.create({ data: { name: 'Diamond Rings', icon: 'Gem', color: '#B9F2FF' } })
  const catSilver = await db.category.create({ data: { name: 'Silver Earrings', icon: 'Ear', color: '#C0C0C0' } })
  const catPlatinum = await db.category.create({ data: { name: 'Platinum Bracelets', icon: 'CircleDot', color: '#E5E4E2' } })
  const catPearl = await db.category.create({ data: { name: 'Pearl Collections', icon: 'Sparkles', color: '#FDEEF4' } })
  const catWatch = await db.category.create({ data: { name: 'Luxury Watches', icon: 'Clock', color: '#1C1C1C' } })
  const catGem = await db.category.create({ data: { name: 'Gemstone Pendants', icon: 'Diamond', color: '#6A0DAD' } })
  const catBridal = await db.category.create({ data: { name: 'Bridal Collections', icon: 'Heart', color: '#C71585' } })

  // ─── PRODUCTS ─────────────────────────────────────────────────────
  const prodGoldChain = await db.product.create({ data: { name: 'Classic Gold Chain', sku: 'GLD-001', description: 'Timeless 18K gold chain with interlocking links.', categoryId: catGold.id, price: 1250, costPrice: 890, weight: 22, purity: '18K', isManufactured: true, minStockLevel: 15, isActive: true } })
  const prodItalianGold = await db.product.create({ data: { name: 'Italian Gold Necklace', sku: 'GLD-002', description: 'Exquisite Italian-crafted 18K gold necklace.', categoryId: catGold.id, price: 3800, costPrice: 2650, weight: 35, purity: '18K', isManufactured: false, minStockLevel: 8, isActive: true } })
  const prodGoldPendant = await db.product.create({ data: { name: 'Gold Pendant Necklace', sku: 'GLD-003', description: 'Elegant 14K gold pendant necklace.', categoryId: catGold.id, price: 2450, costPrice: 1680, weight: 18, purity: '14K', isManufactured: false, minStockLevel: 12, isActive: true } })
  const prodSolitaire = await db.product.create({ data: { name: 'Solitaire Engagement Ring', sku: 'DMD-001', description: 'Stunning 1.5ct round brilliant solitaire diamond.', categoryId: catDiamond.id, price: 12500, costPrice: 8200, weight: 5.2, purity: '18K', isManufactured: true, minStockLevel: 5, isActive: true } })
  const prodHaloRing = await db.product.create({ data: { name: 'Diamond Halo Ring', sku: 'DMD-002', description: '0.75ct center diamond with halo of 36 micro-pave diamonds.', categoryId: catDiamond.id, price: 8900, costPrice: 5800, weight: 6.8, purity: '14K', isManufactured: true, minStockLevel: 6, isActive: true } })
  const prodTennisBracelet = await db.product.create({ data: { name: 'Diamond Tennis Bracelet', sku: 'DMD-003', description: '5ct total weight diamond tennis bracelet.', categoryId: catDiamond.id, price: 15000, costPrice: 9500, weight: 28, purity: '14K', isManufactured: false, minStockLevel: 4, isActive: true } })
  const prodSilverHoops = await db.product.create({ data: { name: 'Sterling Silver Hoops', sku: 'SLV-001', description: 'Classic sterling silver hoop earrings.', categoryId: catSilver.id, price: 285, costPrice: 95, weight: 8, purity: '925', isManufactured: true, minStockLevel: 25, isActive: true } })
  const prodSilverDrops = await db.product.create({ data: { name: 'Silver Drop Earrings', sku: 'SLV-002', description: 'Elegant sterling silver drop earrings.', categoryId: catSilver.id, price: 420, costPrice: 145, weight: 12, purity: '925', isManufactured: false, minStockLevel: 20, isActive: true } })
  const prodSilverStuds = await db.product.create({ data: { name: 'Silver Stud Earrings', sku: 'SLV-003', description: 'Minimalist sterling silver ball stud earrings.', categoryId: catSilver.id, price: 195, costPrice: 65, weight: 4, purity: '925', isManufactured: false, minStockLevel: 30, isActive: true } })
  const prodPlatinumBand = await db.product.create({ data: { name: 'Platinum Wedding Band', sku: 'PLT-001', description: 'Classic comfort-fit platinum wedding band.', categoryId: catPlatinum.id, price: 2800, costPrice: 1900, weight: 10, purity: '950', isManufactured: true, minStockLevel: 10, isActive: true } })
  const prodPlatinumBracelet = await db.product.create({ data: { name: 'Platinum Link Bracelet', sku: 'PLT-002', description: 'Luxurious platinum link bracelet.', categoryId: catPlatinum.id, price: 7500, costPrice: 4800, weight: 32, purity: '950', isManufactured: false, minStockLevel: 5, isActive: true } })
  const prodPlatinumChain = await db.product.create({ data: { name: 'Platinum Chain Necklace', sku: 'PLT-003', description: 'Heavy platinum cable chain necklace.', categoryId: catPlatinum.id, price: 5200, costPrice: 3400, weight: 25, purity: '950', isManufactured: false, minStockLevel: 6, isActive: true } })
  const prodAkoyaPearl = await db.product.create({ data: { name: 'Akoya Pearl Necklace', sku: 'PRL-001', description: '18-inch strand of 7-7.5mm AAA Akoya pearls.', categoryId: catPearl.id, price: 4500, costPrice: 2800, weight: 45, purity: null, isManufactured: true, minStockLevel: 6, isActive: true } })
  const prodPearlDrops = await db.product.create({ data: { name: 'Pearl Drop Earrings', sku: 'PRL-002', description: 'South Sea pearl drop earrings.', categoryId: catPearl.id, price: 1200, costPrice: 720, weight: 10, purity: null, isManufactured: false, minStockLevel: 12, isActive: true } })
  const prodFreshwater = await db.product.create({ data: { name: 'Freshwater Pearl Strand', sku: 'PRL-003', description: 'Multicolor freshwater pearl strand.', categoryId: catPearl.id, price: 890, costPrice: 480, weight: 38, purity: null, isManufactured: false, minStockLevel: 15, isActive: true } })
  const prodSwissWatch = await db.product.create({ data: { name: 'Swiss Automatic Watch', sku: 'WTC-001', description: 'Swiss-made automatic movement watch.', categoryId: catWatch.id, price: 8500, costPrice: 5200, weight: 85, purity: null, isManufactured: false, minStockLevel: 4, isActive: true } })
  const prodChronograph = await db.product.create({ data: { name: 'Luxury Chronograph', sku: 'WTC-002', description: 'Platinum chronograph with perpetual calendar.', categoryId: catWatch.id, price: 35000, costPrice: 22000, weight: 120, purity: null, isManufactured: false, minStockLevel: 2, isActive: true } })
  const prodRubyPendant = await db.product.create({ data: { name: 'Ruby Pendant Necklace', sku: 'GEM-001', description: '2.5ct oval Burmese ruby pendant.', categoryId: catGem.id, price: 6800, costPrice: 4200, weight: 14, purity: '18K', isManufactured: true, minStockLevel: 5, isActive: true } })
  const prodSapphireRing = await db.product.create({ data: { name: 'Sapphire Cocktail Ring', sku: 'GEM-002', description: '3ct Ceylon sapphire cocktail ring.', categoryId: catGem.id, price: 5200, costPrice: 3100, weight: 8, purity: '18K', isManufactured: false, minStockLevel: 6, isActive: true } })
  const prodEmeraldEarrings = await db.product.create({ data: { name: 'Emerald Drop Earrings', sku: 'GEM-003', description: 'Colombian emerald drop earrings.', categoryId: catGem.id, price: 4100, costPrice: 2500, weight: 11, purity: '14K', isManufactured: false, minStockLevel: 7, isActive: true } })
  const prodBridalSet = await db.product.create({ data: { name: 'Classic Bridal Set', sku: 'BRD-001', description: 'Timeless bridal set with 1ct solitaire.', categoryId: catBridal.id, price: 18500, costPrice: 11200, weight: 12, purity: '18K', isManufactured: true, minStockLevel: 4, isActive: true } })
  const prodVintageBridal = await db.product.create({ data: { name: 'Vintage Bridal Ring Set', sku: 'BRD-002', description: 'Art deco inspired bridal set.', categoryId: catBridal.id, price: 22000, costPrice: 13800, weight: 15, purity: '18K', isManufactured: false, minStockLevel: 3, isActive: true } })
  const prodModernBridal = await db.product.create({ data: { name: 'Modern Bridal Necklace', sku: 'BRD-003', description: 'Contemporary bridal necklace with geometric pattern.', categoryId: catBridal.id, price: 9800, costPrice: 6100, weight: 22, purity: '14K', isManufactured: false, minStockLevel: 5, isActive: true } })

  // ─── WAREHOUSES ───────────────────────────────────────────────────
  const whMain = await db.warehouse.create({ data: { name: 'Main Vault', code: 'NYC-VLT', city: 'New York', capacity: 5000 } })
  const whWorkshop = await db.warehouse.create({ data: { name: 'Workshop', code: 'LDN-WRK', city: 'London', capacity: 2000 } })
  const whDubai = await db.warehouse.create({ data: { name: 'Distribution Hub', code: 'DXB-DST', city: 'Dubai', capacity: 3000 } })

  // ─── INVENTORY ITEMS ──────────────────────────────────────────────
  const invItems = await Promise.all([
    db.inventoryItem.create({ data: { productId: prodGoldChain.id, warehouseId: whMain.id, quantity: 25, reservedQty: 3, reorderPoint: 10 } }),
    db.inventoryItem.create({ data: { productId: prodItalianGold.id, warehouseId: whMain.id, quantity: 12, reservedQty: 1, reorderPoint: 5 } }),
    db.inventoryItem.create({ data: { productId: prodGoldPendant.id, warehouseId: whMain.id, quantity: 18, reservedQty: 2, reorderPoint: 8 } }),
    db.inventoryItem.create({ data: { productId: prodSolitaire.id, warehouseId: whMain.id, quantity: 8, reservedQty: 2, reorderPoint: 3 } }),
    db.inventoryItem.create({ data: { productId: prodHaloRing.id, warehouseId: whMain.id, quantity: 10, reservedQty: 1, reorderPoint: 4 } }),
    db.inventoryItem.create({ data: { productId: prodTennisBracelet.id, warehouseId: whMain.id, quantity: 5, reservedQty: 1, reorderPoint: 2 } }),
    db.inventoryItem.create({ data: { productId: prodSilverHoops.id, warehouseId: whWorkshop.id, quantity: 40, reservedQty: 5, reorderPoint: 15 } }),
    db.inventoryItem.create({ data: { productId: prodSilverDrops.id, warehouseId: whWorkshop.id, quantity: 30, reservedQty: 3, reorderPoint: 12 } }),
    db.inventoryItem.create({ data: { productId: prodSilverStuds.id, warehouseId: whWorkshop.id, quantity: 55, reservedQty: 4, reorderPoint: 20 } }),
    db.inventoryItem.create({ data: { productId: prodPlatinumBand.id, warehouseId: whMain.id, quantity: 15, reservedQty: 2, reorderPoint: 6 } }),
    db.inventoryItem.create({ data: { productId: prodPlatinumBracelet.id, warehouseId: whMain.id, quantity: 6, reservedQty: 0, reorderPoint: 3 } }),
    db.inventoryItem.create({ data: { productId: prodPlatinumChain.id, warehouseId: whMain.id, quantity: 8, reservedQty: 1, reorderPoint: 4 } }),
    db.inventoryItem.create({ data: { productId: prodAkoyaPearl.id, warehouseId: whDubai.id, quantity: 10, reservedQty: 2, reorderPoint: 5 } }),
    db.inventoryItem.create({ data: { productId: prodPearlDrops.id, warehouseId: whDubai.id, quantity: 20, reservedQty: 3, reorderPoint: 8 } }),
    db.inventoryItem.create({ data: { productId: prodFreshwater.id, warehouseId: whDubai.id, quantity: 18, reservedQty: 1, reorderPoint: 10 } }),
    db.inventoryItem.create({ data: { productId: prodSwissWatch.id, warehouseId: whMain.id, quantity: 6, reservedQty: 1, reorderPoint: 2 } }),
    db.inventoryItem.create({ data: { productId: prodChronograph.id, warehouseId: whMain.id, quantity: 3, reservedQty: 0, reorderPoint: 1 } }),
    db.inventoryItem.create({ data: { productId: prodRubyPendant.id, warehouseId: whWorkshop.id, quantity: 7, reservedQty: 1, reorderPoint: 3 } }),
    db.inventoryItem.create({ data: { productId: prodSapphireRing.id, warehouseId: whWorkshop.id, quantity: 9, reservedQty: 2, reorderPoint: 4 } }),
    db.inventoryItem.create({ data: { productId: prodEmeraldEarrings.id, warehouseId: whWorkshop.id, quantity: 11, reservedQty: 1, reorderPoint: 5 } }),
    db.inventoryItem.create({ data: { productId: prodBridalSet.id, warehouseId: whDubai.id, quantity: 5, reservedQty: 1, reorderPoint: 2 } }),
    db.inventoryItem.create({ data: { productId: prodVintageBridal.id, warehouseId: whDubai.id, quantity: 4, reservedQty: 0, reorderPoint: 2 } }),
    db.inventoryItem.create({ data: { productId: prodModernBridal.id, warehouseId: whDubai.id, quantity: 7, reservedQty: 1, reorderPoint: 3 } }),
    db.inventoryItem.create({ data: { productId: prodSilverHoops.id, warehouseId: whDubai.id, quantity: 25, reservedQty: 2, reorderPoint: 10 } }),
    db.inventoryItem.create({ data: { productId: prodGoldChain.id, warehouseId: whWorkshop.id, quantity: 10, reservedQty: 0, reorderPoint: 5 } }),
  ])

  // ─── SUPPLIERS ────────────────────────────────────────────────────
  const supSwiss = await db.supplier.create({ data: { name: 'Swiss Gold Refinery', code: 'SGR-001', contactPerson: 'Hans Mueller', phone: '+41 44 123 4567', email: 'orders@swissgoldrefinery.ch', address: 'Bahnhofstrasse 42, Zurich, Switzerland', rating: 4.8, leadTimeDays: 5, paymentTerms: 'Net 30', isActive: true } })
  const supAntwerp = await db.supplier.create({ data: { name: 'Antwerp Diamond Traders', code: 'ADT-001', contactPerson: 'Jan De Smedt', phone: '+32 3 234 5678', email: 'supply@antwerpdiamonds.be', address: 'Pelikaanstraat 60, Antwerp, Belgium', rating: 4.6, leadTimeDays: 7, paymentTerms: 'Net 45', isActive: true } })
  const supItalian = await db.supplier.create({ data: { name: 'Italian Silver Craft', code: 'ISC-001', contactPerson: 'Marco Rossi', phone: '+39 02 345 6789', email: 'wholesale@italiansilvercraft.it', address: 'Via Montenapoleone 8, Milan, Italy', rating: 4.3, leadTimeDays: 10, paymentTerms: 'Net 30', isActive: true } })
  const supTahiti = await db.supplier.create({ data: { name: 'Tahiti Pearl House', code: 'TPH-001', contactPerson: 'Manoa Tehahe', phone: '+689 40 456 789', email: 'export@tahitipearlhouse.pf', address: 'Boulevard Pomare IV, Papeete, Tahiti', rating: 4.1, leadTimeDays: 14, paymentTerms: 'Net 60', isActive: true } })
  const supColombian = await db.supplier.create({ data: { name: 'Colombian Emerald Exchange', code: 'CEE-001', contactPerson: 'Carlos Mendoza', phone: '+57 1 567 8901', email: 'gems@colombianemerald.co', address: 'Carrera 7 #72-41, Bogota, Colombia', rating: 4.5, leadTimeDays: 12, paymentTerms: 'Net 45', isActive: true } })

  // ─── PURCHASE ORDERS ──────────────────────────────────────────────
  const po1 = await db.purchaseOrder.create({ data: { poNumber: 'PO-2024-001', supplierId: supSwiss.id, status: 'received', totalAmount: 26700, taxAmount: 2136, notes: 'Quarterly gold chain replenishment.' } })
  const po2 = await db.purchaseOrder.create({ data: { poNumber: 'PO-2024-002', supplierId: supAntwerp.id, status: 'received', totalAmount: 58000, taxAmount: 4640, notes: 'Diamond ring and bracelet consignment.' } })
  const po3 = await db.purchaseOrder.create({ data: { poNumber: 'PO-2024-003', supplierId: supItalian.id, status: 'shipped', totalAmount: 6420, taxAmount: 513.6, notes: 'Sterling silver earrings for London workshop.' } })
  const po4 = await db.purchaseOrder.create({ data: { poNumber: 'PO-2024-004', supplierId: supTahiti.id, status: 'confirmed', totalAmount: 15200, taxAmount: 1216, notes: 'Akoya and freshwater pearl order for Dubai hub.' } })
  const po5 = await db.purchaseOrder.create({ data: { poNumber: 'PO-2024-005', supplierId: supColombian.id, status: 'draft', totalAmount: 18000, taxAmount: 1440, notes: 'Emerald procurement pending management approval.' } })

  // ─── PURCHASE ORDER ITEMS ─────────────────────────────────────────
  await Promise.all([
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po1.id, productId: prodGoldChain.id, quantity: 30, unitPrice: 890, receivedQty: 30 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po2.id, productId: prodSolitaire.id, quantity: 4, unitPrice: 8200, receivedQty: 4 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po2.id, productId: prodHaloRing.id, quantity: 3, unitPrice: 5800, receivedQty: 3 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po3.id, productId: prodSilverHoops.id, quantity: 40, unitPrice: 95, receivedQty: 0 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po3.id, productId: prodSilverDrops.id, quantity: 28, unitPrice: 145, receivedQty: 0 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po4.id, productId: prodAkoyaPearl.id, quantity: 4, unitPrice: 2800, receivedQty: 0 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po4.id, productId: prodFreshwater.id, quantity: 8, unitPrice: 480, receivedQty: 0 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po5.id, productId: prodEmeraldEarrings.id, quantity: 6, unitPrice: 2500, receivedQty: 0 } }),
    db.purchaseOrderItem.create({ data: { purchaseOrderId: po5.id, productId: prodSapphireRing.id, quantity: 3, unitPrice: 3100, receivedQty: 0 } }),
  ])

  // ─── CUSTOMERS ────────────────────────────────────────────────────
  const custEmma = await db.customer.create({ data: { name: 'Emma Thompson', email: 'emma@email.co.uk', phone: '+44 20 7946 0958', address: '14 Kensington Gardens, London, UK', type: 'retail' } })
  const custJames = await db.customer.create({ data: { name: 'James Wilson', email: 'james@email.com', phone: '+1 212 555 0147', address: '740 Park Avenue, New York, USA', type: 'retail' } })
  const custSophie = await db.customer.create({ data: { name: 'Sophie Laurent', email: 'sophie@laurent-j.fr', phone: '+33 1 42 68 53 00', address: '28 Place Vendome, Paris, France', type: 'wholesale', taxId: 'FR-WS-2024-0847' } })
  const custMichael = await db.customer.create({ data: { name: 'Michael Rodriguez', email: 'michael@rodriguez.com', phone: '+1 305 555 0199', address: '1200 Brickell Ave, Miami, USA', type: 'wholesale', taxId: 'US-WS-2024-1562' } })
  const custLisa = await db.customer.create({ data: { name: 'Lisa Yamamoto', email: 'lisa@email.jp', phone: '+81 3 1234 5678', address: '4-2-8 Roppongi Hills, Tokyo, Japan', type: 'retail' } })
  const custAurora = await db.customer.create({ data: { name: 'Aurora International', email: 'procurement@aurora-intl.sg', phone: '+65 6738 2900', address: '1 Raffles Place, Singapore', type: 'wholesale', taxId: 'SG-WS-2024-0391' } })

  // ─── SALES ORDERS ─────────────────────────────────────────────────
  await Promise.all([
    db.salesOrder.create({ data: { soNumber: 'SO-2024-001', customerId: custEmma.id, status: 'delivered', totalAmount: 2450, discount: 0, taxAmount: 196, notes: 'Gold Pendant Necklace delivered.' } }),
    db.salesOrder.create({ data: { soNumber: 'SO-2024-002', customerId: custSophie.id, status: 'shipped', totalAmount: 28800, discount: 2400, taxAmount: 2112, notes: 'Wholesale order - 3x Solitaire Rings for Paris boutique.' } }),
    db.salesOrder.create({ data: { soNumber: 'SO-2024-003', customerId: custAurora.id, status: 'confirmed', totalAmount: 15200, discount: 1200, taxAmount: 1120, notes: 'Wholesale pearl and silver assortment for Singapore.' } }),
    db.salesOrder.create({ data: { soNumber: 'SO-2024-004', customerId: custJames.id, status: 'pending', totalAmount: 12500, discount: 0, taxAmount: 1000, notes: 'Special order - Solitaire Ring with custom engraving.' } }),
  ])

  // ─── POS TRANSACTIONS ─────────────────────────────────────────────
  await Promise.all([
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-001', items: JSON.stringify([{ productId: prodSilverHoops.id, name: 'Sterling Silver Hoops', quantity: 2, price: 285 }]), subtotal: 570, tax: 45.6, discount: 0, total: 615.6, paymentMethod: 'card', status: 'completed' } }),
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-002', items: JSON.stringify([{ productId: prodGoldChain.id, name: 'Classic Gold Chain', quantity: 1, price: 1250 }]), subtotal: 1250, tax: 100, discount: 50, total: 1300, paymentMethod: 'card', status: 'completed' } }),
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-003', items: JSON.stringify([{ productId: prodSilverStuds.id, name: 'Silver Stud Earrings', quantity: 1, price: 195 }, { productId: prodSilverDrops.id, name: 'Silver Drop Earrings', quantity: 1, price: 420 }]), subtotal: 615, tax: 49.2, discount: 0, total: 664.2, paymentMethod: 'cash', status: 'completed' } }),
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-004', items: JSON.stringify([{ productId: prodPlatinumBand.id, name: 'Platinum Wedding Band', quantity: 1, price: 2800 }]), subtotal: 2800, tax: 224, discount: 100, total: 2924, paymentMethod: 'card', status: 'completed' } }),
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-005', items: JSON.stringify([{ productId: prodSwissWatch.id, name: 'Swiss Automatic Watch', quantity: 1, price: 8500 }]), subtotal: 8500, tax: 680, discount: 0, total: 9180, paymentMethod: 'card', status: 'completed' } }),
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-006', items: JSON.stringify([{ productId: prodPearlDrops.id, name: 'Pearl Drop Earrings', quantity: 1, price: 1200 }, { productId: prodFreshwater.id, name: 'Freshwater Pearl Strand', quantity: 2, price: 890 }]), subtotal: 2980, tax: 238.4, discount: 200, total: 3018.4, paymentMethod: 'digital', status: 'completed' } }),
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-007', items: JSON.stringify([{ productId: prodRubyPendant.id, name: 'Ruby Pendant Necklace', quantity: 1, price: 6800 }]), subtotal: 6800, tax: 544, discount: 0, total: 7344, paymentMethod: 'card', status: 'completed' } }),
    db.posTransaction.create({ data: { transactionNumber: 'POS-TXN-008', items: JSON.stringify([{ productId: prodSilverHoops.id, name: 'Sterling Silver Hoops', quantity: 3, price: 285 }]), subtotal: 855, tax: 68.4, discount: 50, total: 873.4, paymentMethod: 'cash', status: 'completed' } }),
  ])

  // ─── E-COMMERCE ORDERS ────────────────────────────────────────────
  await Promise.all([
    db.ecommerceOrder.create({ data: { orderNumber: 'ECO-2024-001', customerName: 'Robert Kim', customerEmail: 'robert@email.kr', items: JSON.stringify([{ productId: prodHaloRing.id, name: 'Diamond Halo Ring', price: 8900, quantity: 1 }]), totalAmount: 9612, shippingAddress: '123 Gangnam-daero, Seoul, South Korea', paymentStatus: 'paid', orderStatus: 'shipped' } }),
    db.ecommerceOrder.create({ data: { orderNumber: 'ECO-2024-002', customerName: 'Isabella Rossi', customerEmail: 'isabella@email.it', items: JSON.stringify([{ productId: prodSilverDrops.id, name: 'Silver Drop Earrings', price: 420, quantity: 1 }, { productId: prodSilverStuds.id, name: 'Silver Stud Earrings', price: 195, quantity: 2 }]), totalAmount: 873, shippingAddress: 'Via della Spiga 26, Milan, Italy', paymentStatus: 'paid', orderStatus: 'delivered' } }),
    db.ecommerceOrder.create({ data: { orderNumber: 'ECO-2024-003', customerName: 'Lisa Yamamoto', customerEmail: 'lisa@email.jp', items: JSON.stringify([{ productId: prodBridalSet.id, name: 'Classic Bridal Set', price: 18500, quantity: 1 }]), totalAmount: 19980, shippingAddress: '4-2-8 Roppongi Hills, Tokyo, Japan', paymentStatus: 'paid', orderStatus: 'processing' } }),
    db.ecommerceOrder.create({ data: { orderNumber: 'ECO-2024-004', customerName: 'Emma Thompson', customerEmail: 'emma@email.co.uk', items: JSON.stringify([{ productId: prodSapphireRing.id, name: 'Sapphire Cocktail Ring', price: 5200, quantity: 1 }]), totalAmount: 5616, shippingAddress: '14 Kensington Gardens, London, UK', paymentStatus: 'pending', orderStatus: 'pending' } }),
  ])

  // ─── BOM COMPONENTS ───────────────────────────────────────────────
  await Promise.all([
    db.bomComponent.create({ data: { productId: prodGoldChain.id, componentId: prodGoldPendant.id, quantity: 1.2 } }),
    db.bomComponent.create({ data: { productId: prodSolitaire.id, componentId: prodGoldPendant.id, quantity: 0.8 } }),
    db.bomComponent.create({ data: { productId: prodHaloRing.id, componentId: prodGoldPendant.id, quantity: 0.6 } }),
    db.bomComponent.create({ data: { productId: prodSilverHoops.id, componentId: prodSilverDrops.id, quantity: 2.0 } }),
    db.bomComponent.create({ data: { productId: prodPlatinumBand.id, componentId: prodPlatinumChain.id, quantity: 0.5 } }),
    db.bomComponent.create({ data: { productId: prodAkoyaPearl.id, componentId: prodFreshwater.id, quantity: 8.0 } }),
    db.bomComponent.create({ data: { productId: prodRubyPendant.id, componentId: prodGoldPendant.id, quantity: 1.0 } }),
  ])

  // ─── WORK ORDERS ──────────────────────────────────────────────────
  const wo1 = await db.workOrder.create({ data: { woNumber: 'WO-2024-001', status: 'in_progress', priority: 'high', plannedStart: new Date('2024-10-01'), plannedEnd: new Date('2024-10-15'), actualStart: new Date('2024-10-02'), notes: 'Manufacturing Classic Gold Chain batch for Q4 inventory replenishment.' } })
  const wo2 = await db.workOrder.create({ data: { woNumber: 'WO-2024-002', status: 'planned', priority: 'medium', plannedStart: new Date('2024-11-01'), plannedEnd: new Date('2024-11-20'), notes: 'Solitaire Engagement Ring production run for holiday season demand.' } })
  const wo3 = await db.workOrder.create({ data: { woNumber: 'WO-2024-003', status: 'completed', priority: 'high', plannedStart: new Date('2024-09-01'), plannedEnd: new Date('2024-09-10'), actualStart: new Date('2024-09-01'), actualEnd: new Date('2024-09-08'), notes: 'Sterling Silver Hoops batch completed ahead of schedule.' } })

  await Promise.all([
    db.workOrderProduct.create({ data: { workOrderId: wo1.id, productId: prodGoldChain.id, targetQty: 50, completedQty: 30, wastageQty: 1.5 } }),
    db.workOrderProduct.create({ data: { workOrderId: wo2.id, productId: prodSolitaire.id, targetQty: 10, completedQty: 0, wastageQty: 0 } }),
    db.workOrderProduct.create({ data: { workOrderId: wo3.id, productId: prodSilverHoops.id, targetQty: 100, completedQty: 100, wastageQty: 3.2 } }),
  ])

  // ─── SHIPMENTS ────────────────────────────────────────────────────
  const shp1 = await db.shipment.create({ data: { shipmentNumber: 'SHP-2024-001', carrier: 'FedEx', trackingNumber: 'FX1234567890', origin: 'Zurich, Switzerland', destination: 'New York, USA', status: 'delivered', shippedDate: new Date('2024-09-15'), deliveredDate: new Date('2024-09-18') } })
  const shp2 = await db.shipment.create({ data: { shipmentNumber: 'SHP-2024-002', carrier: 'DHL', trackingNumber: 'DHL9876543210', origin: 'Antwerp, Belgium', destination: 'New York, USA', status: 'in_transit', shippedDate: new Date('2024-10-20') } })
  const shp3 = await db.shipment.create({ data: { shipmentNumber: 'SHP-2024-003', carrier: 'UPS', trackingNumber: 'UPS5556667778', origin: 'Milan, Italy', destination: 'London, UK', status: 'shipped', shippedDate: new Date('2024-10-25') } })
  const shp4 = await db.shipment.create({ data: { shipmentNumber: 'SHP-2024-004', carrier: 'FedEx', origin: 'Papeete, Tahiti', destination: 'Dubai, UAE', status: 'pending' } })

  await Promise.all([
    db.shipmentItem.create({ data: { shipmentId: shp1.id, productId: prodGoldChain.id, quantity: 30 } }),
    db.shipmentItem.create({ data: { shipmentId: shp2.id, productId: prodSolitaire.id, quantity: 4 } }),
    db.shipmentItem.create({ data: { shipmentId: shp2.id, productId: prodHaloRing.id, quantity: 3 } }),
    db.shipmentItem.create({ data: { shipmentId: shp3.id, productId: prodSilverHoops.id, quantity: 40 } }),
    db.shipmentItem.create({ data: { shipmentId: shp3.id, productId: prodSilverDrops.id, quantity: 28 } }),
    db.shipmentItem.create({ data: { shipmentId: shp4.id, productId: prodAkoyaPearl.id, quantity: 4 } }),
    db.shipmentItem.create({ data: { shipmentId: shp4.id, productId: prodFreshwater.id, quantity: 8 } }),
  ])

  // ─── AUDIT LOGS ───────────────────────────────────────────────────
  await Promise.all([
    db.auditLog.create({ data: { user: 'Alex Carter', action: 'Created Purchase Order PO-2024-001', module: 'Supply Chain', details: 'Order placed with Swiss Gold Refinery for 30 units' } }),
    db.auditLog.create({ data: { user: 'Sarah Mitchell', action: 'Completed POS Transaction POS-TXN-001', module: 'POS', details: 'Sterling Silver Hoops x2 sold via card payment' } }),
    db.auditLog.create({ data: { user: 'Alex Carter', action: 'Updated Inventory - Classic Gold Chain', module: 'Inventory', details: 'Stock adjusted: +30 units from PO receipt' } }),
    db.auditLog.create({ data: { user: 'Sarah Mitchell', action: 'Created Work Order WO-2024-001', module: 'Manufacturing', details: 'Gold Chain manufacturing batch initiated' } }),
    db.auditLog.create({ data: { user: 'Alex Carter', action: 'Shipped Sales Order SO-2024-002', module: 'Sales', details: '3x Solitaire Rings shipped to Paris boutique' } }),
    db.auditLog.create({ data: { user: 'David Chen', action: 'Completed POS Transaction POS-TXN-004', module: 'POS', details: 'Platinum Wedding Band sold via card payment' } }),
    db.auditLog.create({ data: { user: 'Alex Carter', action: 'Received Shipment SHP-2024-001', module: 'Supply Chain', details: 'Gold Chain delivery from Zurich verified and stored' } }),
    db.auditLog.create({ data: { user: 'Sarah Mitchell', action: 'Created Customer - Aurora International', module: 'CRM', details: 'New wholesale customer onboarded from Singapore' } }),
  ])

  const productCount = await db.product.count()

  return NextResponse.json({
    seeded: true,
    count: productCount,
    message: `Database seeded successfully with ${productCount} products, 3 warehouses, 5 suppliers, 6 customers, 8 POS transactions, and more.`,
  })
}
