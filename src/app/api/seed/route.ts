import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear existing data
    await db.auditLog.deleteMany()
    await db.demandForecast.deleteMany()
    await db.ecommerceOrderItem.deleteMany()
    await db.ecommerceOrder.deleteMany()
    await db.posTransactionItem.deleteMany()
    await db.posTransaction.deleteMany()
    await db.salesOrderItem.deleteMany()
    await db.salesOrder.deleteMany()
    await db.workOrderProduct.deleteMany()
    await db.workOrder.deleteMany()
    await db.bomComponent.deleteMany()
    await db.shipmentItem.deleteMany()
    await db.shipment.deleteMany()
    await db.purchaseOrderItem.deleteMany()
    await db.purchaseOrder.deleteMany()
    await db.inventoryMovement.deleteMany()
    await db.inventoryItem.deleteMany()
    await db.warehouse.deleteMany()
    await db.customer.deleteMany()
    await db.supplier.deleteMany()
    await db.product.deleteMany()
    await db.category.deleteMany()
    await db.user.deleteMany()

    // Create Users
    const admin = await db.user.create({ data: { email: 'admin@goldgem.com', name: 'Vikram Mehta', password: 'hashed_admin', role: 'admin' } })
    const manager = await db.user.create({ data: { email: 'manager@goldgem.com', name: 'Priya Sharma', password: 'hashed_mgr', role: 'manager' } })
    const cashier = await db.user.create({ data: { email: 'cashier@goldgem.com', name: 'Anita Desai', password: 'hashed_cash', role: 'cashier' } })
    const staff1 = await db.user.create({ data: { email: 'goldsmith@goldgem.com', name: 'Rajesh Soni', password: 'hashed_s1', role: 'staff' } })
    const staff2 = await db.user.create({ data: { email: 'setter@goldgem.com', name: 'Mohammed Khan', password: 'hashed_s2', role: 'staff' } })

    // Create Jewellery Categories
    const goldJewellery = await db.category.create({ data: { name: 'Gold Jewellery', description: '22K & 18K gold ornaments — rings, necklaces, bangles, earrings', icon: 'Circle', color: '#d97706' } })
    const diamondJewellery = await db.category.create({ data: { name: 'Diamond Jewellery', description: 'Solitaire & cluster diamond set jewellery', icon: 'Diamond', color: '#6366f1' } })
    const silverJewellery = await db.category.create({ data: { name: 'Silver Jewellery', description: 'Sterling silver ornaments and artefacts', icon: 'Hexagon', color: '#94a3b8' } })
    const platinumJewellery = await db.category.create({ data: { name: 'Platinum Jewellery', description: 'Premium platinum bands and collections', icon: 'Pentagon', color: '#e2e8f0' } })
    const gemstones = await db.category.create({ data: { name: 'Gemstones', description: 'Precious & semi-precious stones — Ruby, Emerald, Sapphire', icon: 'Gem', color: '#dc2626' } })
    const rawMaterials = await db.category.create({ data: { name: 'Raw Materials', description: 'Gold bars, silver granules, solder, flux, casting grain', icon: 'Box', color: '#78716c' } })

    // Create Products — Jewellery Industry
    const productsData = [
      // Gold Jewellery
      { name: '22K Gold Necklace Set', sku: 'GJ-NS-001', price: 125000, costPrice: 98000, categoryId: goldJewellery.id, minStockLevel: 5, isManufactured: true, unit: 'piece' },
      { name: '22K Gold Bangles (Pair)', sku: 'GJ-BG-002', price: 89000, costPrice: 72000, categoryId: goldJewellery.id, minStockLevel: 8, isManufactured: true, unit: 'piece' },
      { name: '18K Gold Ring — Solitaire Setting', sku: 'GJ-RG-003', price: 45000, costPrice: 32000, categoryId: goldJewellery.id, minStockLevel: 12, isManufactured: true, unit: 'piece' },
      { name: '22K Gold Jhumka Earrings', sku: 'GJ-JE-004', price: 35000, costPrice: 25000, categoryId: goldJewellery.id, minStockLevel: 15, isManufactured: true, unit: 'piece' },
      { name: '22K Gold Mangalsutra', sku: 'GJ-MS-005', price: 55000, costPrice: 42000, categoryId: goldJewellery.id, minStockLevel: 8, isManufactured: true, unit: 'piece' },
      { name: '22K Gold Chain (20 inch)', sku: 'GJ-CH-006', price: 62000, costPrice: 50000, categoryId: goldJewellery.id, minStockLevel: 10, isManufactured: true, unit: 'piece' },
      { name: '18K Gold Pendant — Floral', sku: 'GJ-PD-007', price: 28000, costPrice: 19000, categoryId: goldJewellery.id, minStockLevel: 10, unit: 'piece' },
      { name: '22K Gold Nose Pin', sku: 'GJ-NP-008', price: 12000, costPrice: 8000, categoryId: goldJewellery.id, minStockLevel: 20, unit: 'piece' },
      { name: '22K Gold Anklet (Payal)', sku: 'GJ-AK-009', price: 42000, costPrice: 33000, categoryId: goldJewellery.id, minStockLevel: 6, isManufactured: true, unit: 'piece' },
      { name: '22K Gold Maang Tikka', sku: 'GJ-MT-010', price: 18000, costPrice: 13000, categoryId: goldJewellery.id, minStockLevel: 8, unit: 'piece' },
      // Diamond Jewellery
      { name: 'Diamond Solitaire Ring (0.5ct)', sku: 'DJ-SR-001', price: 285000, costPrice: 210000, categoryId: diamondJewellery.id, minStockLevel: 3, isManufactured: true, unit: 'piece' },
      { name: 'Diamond Tennis Bracelet', sku: 'DJ-TB-002', price: 195000, costPrice: 145000, categoryId: diamondJewellery.id, minStockLevel: 4, isManufactured: true, unit: 'piece' },
      { name: 'Diamond Stud Earrings (0.3ct pair)', sku: 'DJ-SE-003', price: 120000, costPrice: 88000, categoryId: diamondJewellery.id, minStockLevel: 5, isManufactured: true, unit: 'piece' },
      { name: 'Diamond Pendant Necklace', sku: 'DJ-PN-004', price: 165000, costPrice: 120000, categoryId: diamondJewellery.id, minStockLevel: 4, isManufactured: true, unit: 'piece' },
      { name: 'Diamond Cluster Ring', sku: 'DJ-CR-005', price: 135000, costPrice: 98000, categoryId: diamondJewellery.id, minStockLevel: 4, isManufactured: true, unit: 'piece' },
      // Silver Jewellery
      { name: 'Sterling Silver Cuff Bracelet', sku: 'SJ-CB-001', price: 4500, costPrice: 2200, categoryId: silverJewellery.id, minStockLevel: 25, unit: 'piece' },
      { name: 'Silver Oxidised Jhumka', sku: 'SJ-OJ-002', price: 2800, costPrice: 1200, categoryId: silverJewellery.id, minStockLevel: 40, unit: 'piece' },
      { name: 'Silver Toe Rings (Pair)', sku: 'SJ-TR-003', price: 1500, costPrice: 600, categoryId: silverJewellery.id, minStockLevel: 50, unit: 'piece' },
      { name: 'Silver Pooja Thali Set', sku: 'SJ-PT-004', price: 8500, costPrice: 4800, categoryId: silverJewellery.id, minStockLevel: 10, unit: 'piece' },
      // Platinum Jewellery
      { name: 'Platinum Love Band (His)', sku: 'PJ-LB-001', price: 75000, costPrice: 55000, categoryId: platinumJewellery.id, minStockLevel: 5, isManufactured: true, unit: 'piece' },
      { name: 'Platinum Love Band (Hers)', sku: 'PJ-LB-002', price: 65000, costPrice: 48000, categoryId: platinumJewellery.id, minStockLevel: 5, isManufactured: true, unit: 'piece' },
      { name: 'Platinum Solitaire Ring', sku: 'PJ-SR-003', price: 320000, costPrice: 240000, categoryId: platinumJewellery.id, minStockLevel: 2, isManufactured: true, unit: 'piece' },
      // Gemstones
      { name: 'Natural Ruby (1.2ct)', sku: 'GM-RB-001', price: 95000, costPrice: 65000, categoryId: gemstones.id, minStockLevel: 5, unit: 'piece' },
      { name: 'Colombian Emerald (1.0ct)', sku: 'GM-EM-002', price: 120000, costPrice: 82000, categoryId: gemstones.id, minStockLevel: 4, unit: 'piece' },
      { name: 'Blue Sapphire (1.5ct)', sku: 'GM-BS-003', price: 85000, costPrice: 58000, categoryId: gemstones.id, minStockLevel: 5, unit: 'piece' },
      { name: 'South Sea Pearl (10mm)', sku: 'GM-PP-004', price: 4500, costPrice: 2500, categoryId: gemstones.id, minStockLevel: 30, unit: 'piece' },
      { name: 'Yellow Sapphire (2.0ct)', sku: 'GM-YS-005', price: 55000, costPrice: 38000, categoryId: gemstones.id, minStockLevel: 5, unit: 'piece' },
      // Raw Materials
      { name: '22K Gold Casting Grain (10g)', sku: 'RM-GC-001', price: 62000, costPrice: 58000, categoryId: rawMaterials.id, minStockLevel: 50, unit: 'piece' },
      { name: '18K Gold Wire (1m)', sku: 'RM-GW-002', price: 4800, costPrice: 3800, categoryId: rawMaterials.id, minStockLevel: 100, unit: 'meter' },
      { name: 'Silver Granules (100g)', sku: 'RM-SG-003', price: 8500, costPrice: 7200, categoryId: rawMaterials.id, minStockLevel: 30, unit: 'piece' },
      { name: 'Gold Solder Sheet (5g)', sku: 'RM-GS-004', price: 3200, costPrice: 2500, categoryId: rawMaterials.id, minStockLevel: 80, unit: 'piece' },
      { name: 'Platinum Casting Grain (5g)', sku: 'RM-PC-005', price: 25000, costPrice: 22000, categoryId: rawMaterials.id, minStockLevel: 20, unit: 'piece' },
    ]
    const products = []
    for (const p of productsData) {
      products.push(await db.product.create({ data: p }))
    }

    // Create Warehouses — Jewellery specific
    const wh1 = await db.warehouse.create({ data: { name: 'Main Vault', code: 'WH-VAULT', address: 'Zaveri Bazaar, Shop 12', city: 'Mumbai', manager: 'Vikram Mehta', capacity: 500 } })
    const wh2 = await db.warehouse.create({ data: { name: 'Karigarkhana Workshop', code: 'WH-KARKHANA', address: 'Bhendi Bazaar, Lane 3', city: 'Mumbai', manager: 'Rajesh Soni', capacity: 200 } })
    const wh3 = await db.warehouse.create({ data: { name: 'Showroom Stock Room', code: 'WH-SHOWROOM', address: 'Linking Road, Bandra', city: 'Mumbai', manager: 'Anita Desai', capacity: 150 } })

    // Create Inventory Items
    for (const product of products) {
      const stockLevels = [Math.floor(Math.random() * 15) + 1, Math.floor(Math.random() * 8) + 1, Math.floor(Math.random() * 5) + 1]
      const warehouses = [wh1, wh2, wh3]
      for (let i = 0; i < 3; i++) {
        await db.inventoryItem.create({
          data: {
            productId: product.id,
            warehouseId: warehouses[i].id,
            quantity: stockLevels[i],
            reservedQty: Math.floor(stockLevels[i] * 0.2),
            reorderPoint: product.minStockLevel,
            reorderQty: product.minStockLevel * 3,
          }
        })
      }
    }

    // Create Suppliers — Jewellery industry
    const suppliers = []
    const suppliersData = [
      { name: 'MMTC-PAMP India', code: 'SUP-MMTC', email: 'bullion@mmtcpamp.com', phone: '+91-22-23456789', city: 'Mumbai', country: 'India', rating: 4.8, leadTimeDays: 3, paymentTerms: 'Advance' },
      { name: 'Rajesh Exports Ltd', code: 'SUP-REL', email: 'supply@rajeshexports.com', phone: '+91-80-22334455', city: 'Bangalore', country: 'India', rating: 4.5, leadTimeDays: 5, paymentTerms: 'Net 15' },
      { name: 'Surat Diamond Bureau', code: 'SUP-SDB', email: 'diamonds@sdb.org.in', phone: '+91-261-2345678', city: 'Surat', country: 'India', rating: 4.2, leadTimeDays: 7, paymentTerms: 'Net 30' },
      { name: 'Gem Palace Jaipur', code: 'SUP-GPJ', email: 'gems@gempalace.com', phone: '+91-141-2345678', city: 'Jaipur', country: 'India', rating: 4.6, leadTimeDays: 4, paymentTerms: 'Net 15' },
      { name: 'Swiss Refinery AG', code: 'SUP-SRA', email: 'orders@swissrefinery.ch', phone: '+41-44-1234567', city: 'Zurich', country: 'Switzerland', rating: 4.9, leadTimeDays: 14, paymentTerms: 'LC at Sight' },
    ]
    for (const s of suppliersData) {
      suppliers.push(await db.supplier.create({ data: s }))
    }

    // Create Purchase Orders
    const poStatuses = ['draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled']
    for (let i = 0; i < 12; i++) {
      const supplier = suppliers[i % suppliers.length]
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const qty = Math.floor(Math.random() * 20) + 2
        items.push({ productId: product.id, quantity: qty, unitPrice: product.costPrice, totalPrice: product.costPrice * qty, receivedQty: Math.floor(qty * Math.random()) })
      }
      const totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0)
      await db.purchaseOrder.create({
        data: {
          poNumber: `PO-2026-${String(i + 1).padStart(4, '0')}`,
          supplierId: supplier.id,
          status: poStatuses[i % poStatuses.length],
          orderDate: new Date(2026, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1),
          expectedDate: new Date(2026, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 28) + 1),
          totalAmount,
          taxAmount: totalAmount * 0.03, // 3% GST on gold
          items: { create: items }
        }
      })
    }

    // Create BOMs — Jewellery manufacturing
    const necklaceProduct = products[0] // 22K Gold Necklace Set
    const bangleProduct = products[1] // 22K Gold Bangles
    const ringProduct = products[2] // 18K Gold Ring
    const earringProduct = products[3] // 22K Gold Jhumka
    const mangalsutraProduct = products[4] // 22K Gold Mangalsutra
    const diamondRing = products[10] // Diamond Solitaire Ring
    const diamondBracelet = products[11] // Diamond Tennis Bracelet
    const goldCastingGrain = products[27] // 22K Gold Casting Grain
    const goldWire = products[28] // 18K Gold Wire
    const goldSolder = products[30] // Gold Solder Sheet
    const ruby = products[22] // Natural Ruby
    const sapphire = products[24] // Blue Sapphire

    const bomRelations = [
      { productId: necklaceProduct.id, componentId: goldCastingGrain.id, quantity: 3 }, // 30g gold
      { productId: necklaceProduct.id, componentId: goldWire.id, quantity: 2 }, // 2m wire
      { productId: necklaceProduct.id, componentId: goldSolder.id, quantity: 2 }, // solder
      { productId: bangleProduct.id, componentId: goldCastingGrain.id, quantity: 4 }, // 40g gold per pair
      { productId: bangleProduct.id, componentId: goldSolder.id, quantity: 1 },
      { productId: ringProduct.id, componentId: goldCastingGrain.id, quantity: 1 }, // 10g gold
      { productId: ringProduct.id, componentId: goldWire.id, quantity: 1 }, // 1m wire
      { productId: ringProduct.id, componentId: ruby.id, quantity: 1 }, // 1 ruby
      { productId: earringProduct.id, componentId: goldCastingGrain.id, quantity: 1 }, // 10g gold
      { productId: earringProduct.id, componentId: goldWire.id, quantity: 1 },
      { productId: earringProduct.id, componentId: goldSolder.id, quantity: 1 },
      { productId: mangalsutraProduct.id, componentId: goldCastingGrain.id, quantity: 2 },
      { productId: mangalsutraProduct.id, componentId: goldWire.id, quantity: 2 },
      { productId: diamondRing.id, componentId: goldCastingGrain.id, quantity: 1 },
      { productId: diamondRing.id, componentId: goldWire.id, quantity: 1 },
      { productId: diamondRing.id, componentId: goldSolder.id, quantity: 1 },
      { productId: diamondBracelet.id, componentId: goldCastingGrain.id, quantity: 2 },
      { productId: diamondBracelet.id, componentId: goldWire.id, quantity: 2 },
      { productId: diamondBracelet.id, componentId: goldSolder.id, quantity: 2 },
    ]
    for (const bom of bomRelations) {
      await db.bomComponent.create({ data: bom })
    }

    // Create Work Orders
    const woStatuses = ['planned', 'in_progress', 'completed', 'cancelled']
    const woPriorities = ['low', 'medium', 'high', 'urgent']
    const woProducts = [necklaceProduct, bangleProduct, ringProduct, earringProduct, diamondRing, diamondBracelet]
    for (let i = 0; i < 12; i++) {
      const product = woProducts[i % woProducts.length]
      const targetQty = Math.floor(Math.random() * 10) + 2
      const status = woStatuses[i % woStatuses.length]
      await db.workOrder.create({
        data: {
          woNumber: `WO-2026-${String(i + 1).padStart(4, '0')}`,
          status,
          priority: woPriorities[i % woPriorities.length],
          plannedStart: new Date(2026, 3, (i % 28) + 1),
          plannedEnd: new Date(2026, 3, (i % 28) + 8),
          actualStart: status !== 'planned' ? new Date(2026, 3, (i % 28) + 1) : null,
          actualEnd: status === 'completed' ? new Date(2026, 3, (i % 28) + 7) : null,
          products: {
            create: {
              productId: product.id,
              targetQty,
              completedQty: status === 'completed' ? targetQty : Math.floor(targetQty * Math.random() * 0.6),
              wastageQty: Math.floor(targetQty * 0.03 * Math.random()), // 3% typical gold wastage
            }
          }
        }
      })
    }

    // Create Customers — Jewellery buyers
    const customers = []
    const customerNames = [
      'Sharma Jewellers', 'Patel Ornaments', 'Jain Gold House', 'Khandelwal Gems',
      'Agarwal Jewellers', 'Mehta & Sons Jewellers', 'Gupta Gold Palace',
      'Singh Jewellers', 'Malhotra Diamonds', 'Verma Bullion',
      'Roshni Bride Studio', 'Kalyani Wedding Collections', 'Priya Bridal Couture',
      'Bhatt Jewellers', 'Chopra Ornaments', 'Das Gold Works',
      'Iyer Traditional Jewels', 'Nair Heritage Gold', 'Reddy Bridal Sets',
      'Kapoor Luxury Jewels'
    ]
    for (let i = 0; i < customerNames.length; i++) {
      const type = i < 5 ? 'wholesale' : i < 12 ? 'retail' : 'online'
      customers.push(await db.customer.create({
        data: {
          name: customerNames[i],
          email: `${customerNames[i].toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
          phone: `+91-${9700000000 + i * 111111}`,
          city: ['Mumbai', 'Delhi', 'Jaipur', 'Chennai', 'Kolkata'][i % 5],
          type,
        }
      }))
    }

    // Create Sales Orders
    const soStatuses = ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    for (let i = 0; i < 18; i++) {
      const customer = customers[i % customers.length]
      const numItems = Math.floor(Math.random() * 2) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * 20)] // mostly finished jewellery
        const qty = Math.floor(Math.random() * 5) + 1
        items.push({ productId: product.id, quantity: qty, unitPrice: product.price, totalPrice: product.price * qty })
      }
      const totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0)
      await db.salesOrder.create({
        data: {
          soNumber: `SO-2026-${String(i + 1).padStart(4, '0')}`,
          customerId: customer.id,
          userId: [admin.id, manager.id, staff1.id][i % 3],
          status: soStatuses[i % soStatuses.length],
          orderDate: new Date(2026, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1),
          totalAmount,
          taxAmount: totalAmount * 0.03,
          discount: Math.random() > 0.7 ? totalAmount * 0.02 : 0, // 2% making charge discount
          items: { create: items }
        }
      })
    }

    // Create POS Transactions
    for (let i = 0; i < 50; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * 20)]
        const qty = Math.floor(Math.random() * 2) + 1
        items.push({ productId: product.id, productName: product.name, quantity: qty, unitPrice: product.price, totalPrice: product.price * qty })
      }
      const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0)
      const makingCharge = Math.floor(subtotal * 0.08) // 8% making charge typical
      await db.posTransaction.create({
        data: {
          transactionNumber: `TRX-2026-${String(i + 1).padStart(5, '0')}`,
          userId: [cashier.id, staff1.id, staff2.id][i % 3],
          customerName: Math.random() > 0.5 ? customerNames[Math.floor(Math.random() * customerNames.length)] : null,
          subtotal: subtotal + makingCharge,
          taxAmount: Math.floor(subtotal * 0.03),
          discount: Math.random() > 0.85 ? Math.floor(subtotal * 0.05) : 0,
          totalAmount: subtotal + makingCharge + Math.floor(subtotal * 0.03) - (Math.random() > 0.85 ? Math.floor(subtotal * 0.05) : 0),
          paymentMethod: ['cash', 'card', 'upi'][i % 3],
          status: i % 25 === 0 ? 'refunded' : 'completed',
          createdAt: new Date(2026, 3, Math.floor(Math.random() * 22) + 1, Math.floor(Math.random() * 10) + 10, Math.floor(Math.random() * 60)),
          items: { create: items }
        }
      })
    }

    // Create E-commerce Orders
    for (let i = 0; i < 15; i++) {
      const customer = customers[(i + 12) % customers.length]
      const numItems = Math.floor(Math.random() * 2) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * 15)]
        const qty = Math.floor(Math.random() * 2) + 1
        items.push({ productId: product.id, productName: product.name, quantity: qty, unitPrice: product.price, totalPrice: product.price * qty })
      }
      const totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0)
      await db.ecommerceOrder.create({
        data: {
          orderNumber: `ORD-2026-${String(i + 1).padStart(5, '0')}`,
          customerId: customer.id,
          status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'][i % 6],
          orderDate: new Date(2026, 3, Math.floor(Math.random() * 22) + 1),
          shippingAddress: `Zaveri Bazaar, ${customer.city}, India`,
          billingAddress: `${customer.city}, India`,
          totalAmount,
          taxAmount: totalAmount * 0.03,
          shippingCost: totalAmount > 50000 ? 0 : 499, // insured shipping
          paymentMethod: ['online', 'cod', 'upi'][i % 3],
          paymentStatus: i % 5 === 0 ? 'pending' : 'paid',
          items: { create: items }
        }
      })
    }

    // Create Shipments
    for (let i = 0; i < 10; i++) {
      const numItems = Math.floor(Math.random() * 2) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * 15)]
        items.push({ productId: product.id, quantity: Math.floor(Math.random() * 5) + 1 })
      }
      await db.shipment.create({
        data: {
          shipmentNumber: `SHP-2026-${String(i + 1).padStart(4, '0')}`,
          status: ['pending', 'shipped', 'in_transit', 'delivered', 'cancelled'][i % 5],
          carrier: ['BlueDart Secure', 'Gati Safe', 'Delhivery Valuable', 'BVC Secure', 'Sequel Logistics'][i % 5],
          trackingNumber: `SHP${Date.now()}${i}`,
          shippingDate: new Date(2026, 3, Math.floor(Math.random() * 20) + 1),
          deliveryDate: i % 5 === 3 ? new Date(2026, 3, Math.floor(Math.random() * 10) + 20) : null,
          origin: ['Mumbai', 'Surat', 'Jaipur'][i % 3],
          destination: ['Delhi', 'Chennai', 'Kolkata'][i % 3],
          cost: Math.floor(Math.random() * 3000) + 500, // higher cost for insured
          items: { create: items }
        }
      })
    }

    // Create Demand Forecasts
    for (const product of products.slice(0, 15)) {
      for (let m = 0; m < 3; m++) {
        const baseDemand = Math.floor(Math.random() * 15) + 3
        await db.demandForecast.create({
          data: {
            productId: product.id,
            period: `2026-${String(m + 5).padStart(2, '0')}`,
            predictedDemand: baseDemand + Math.floor(Math.random() * 8),
            confidence: 0.55 + Math.random() * 0.35,
            model: ['prophet', 'arima', 'moving_avg'][m % 3],
          }
        })
      }
    }

    // Create Inventory Movements
    for (let i = 0; i < 30; i++) {
      const invItems = await db.inventoryItem.findMany({ take: 5, skip: i % 10 })
      if (invItems.length > 0) {
        const inv = invItems[0]
        await db.inventoryMovement.create({
          data: {
            inventoryItemId: inv.id,
            warehouseId: inv.warehouseId,
            type: ['in', 'out', 'transfer', 'adjustment', 'return'][i % 5],
            quantity: Math.floor(Math.random() * 5) + 1,
            reference: i % 5 === 0 ? `PO-2026-${String(i + 1).padStart(4, '0')}` : i % 5 === 1 ? `SO-2026-${String(i + 1).padStart(4, '0')}` : null,
            notes: ['Gold received from supplier', 'Customer order fulfilled', 'Vault to workshop transfer', 'Weight adjustment', 'Customer exchange'][i % 5],
            performedBy: [admin.name, manager.name, staff1.name][i % 3],
          }
        })
      }
    }

    return NextResponse.json({ success: true, message: 'GoldGem database seeded with jewellery industry data' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
