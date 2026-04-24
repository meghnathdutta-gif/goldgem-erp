import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding GoldGem ERP database...')

  // Clean existing data
  await prisma.demandForecast.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.ecommerceOrderItem.deleteMany()
  await prisma.ecommerceOrder.deleteMany()
  await prisma.posTransactionItem.deleteMany()
  await prisma.posTransaction.deleteMany()
  await prisma.salesOrderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.workOrderProduct.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.bomComponent.deleteMany()
  await prisma.shipmentItem.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.inventoryMovement.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.user.deleteMany()

  // ── Users ──
  const admin = await prisma.user.create({
    data: { email: 'admin@goldgem.com', name: 'Vikram Sharma', password: 'admin123', role: 'admin', phone: '+91-9876543210', isActive: true },
  })
  const manager = await prisma.user.create({
    data: { email: 'meena@goldgem.com', name: 'Meena Patel', password: 'staff123', role: 'manager', phone: '+91-9876543211', isActive: true },
  })
  const cashier = await prisma.user.create({
    data: { email: 'raj@goldgem.com', name: 'Raj Verma', password: 'staff123', role: 'cashier', phone: '+91-9876543212', isActive: true },
  })

  // ── Categories ──
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Gold Necklaces', description: '22K & 18K gold necklaces', color: '#d97706', icon: '📿' } }),
    prisma.category.create({ data: { name: 'Diamond Rings', description: 'Solitaire & cluster diamond rings', color: '#06b6d4', icon: '💍' } }),
    prisma.category.create({ data: { name: 'Silver Earrings', description: 'Sterling silver earrings', color: '#94a3b8', icon: '✨' } }),
    prisma.category.create({ data: { name: 'Platinum Bracelets', description: '950 platinum bracelets', color: '#6366f1', icon: '⭐' } }),
    prisma.category.create({ data: { name: 'Gold Bangles', description: '22K gold bangles', color: '#f59e0b', icon: '🔮' } }),
    prisma.category.create({ data: { name: 'Pearl Pendants', description: 'South Sea & Akoya pearl pendants', color: '#ec4899', icon: '🐚' } }),
    prisma.category.create({ data: { name: 'Gemstone Rings', description: 'Ruby, emerald & sapphire rings', color: '#dc2626', icon: '💎' } }),
    prisma.category.create({ data: { name: 'Gold Chains', description: '22K gold chains & link chains', color: '#f97316', icon: '⛓️' } }),
  ])

  // ── Products (3 per category = 24) ──
  const productDefs = [
    // Gold Necklaces
    { name: 'Temple Gold Necklace', sku: 'GN-001', price: 185000, costPrice: 148000, isManufactured: true },
    { name: 'Kundan Bridal Necklace', sku: 'GN-002', price: 325000, costPrice: 260000, isManufactured: true },
    { name: 'Daily Wear Gold Chain Necklace', sku: 'GN-003', price: 45000, costPrice: 36000, isManufactured: false },
    // Diamond Rings
    { name: 'Solitaire Diamond Ring 0.5ct', sku: 'DR-001', price: 275000, costPrice: 220000, isManufactured: true },
    { name: 'Cluster Diamond Ring', sku: 'DR-002', price: 165000, costPrice: 132000, isManufactured: true },
    { name: 'Three-Stone Diamond Ring', sku: 'DR-003', price: 395000, costPrice: 316000, isManufactured: true },
    // Silver Earrings
    { name: 'Oxidized Jhumka Earrings', sku: 'SE-001', price: 3500, costPrice: 2100, isManufactured: false },
    { name: 'Silver Stud Earrings', sku: 'SE-002', price: 1800, costPrice: 1080, isManufactured: false },
    { name: 'Pearl Drop Silver Earrings', sku: 'SE-003', price: 5200, costPrice: 3120, isManufactured: false },
    // Platinum Bracelets
    { name: 'Platinum Love Bracelet', sku: 'PB-001', price: 145000, costPrice: 116000, isManufactured: true },
    { name: 'Platinum Chain Bracelet', sku: 'PB-002', price: 98000, costPrice: 78400, isManufactured: false },
    { name: 'Diamond Cut Platinum Bangle', sku: 'PB-003', price: 210000, costPrice: 168000, isManufactured: true },
    // Gold Bangles
    { name: '22K Plain Gold Bangle', sku: 'GB-001', price: 78000, costPrice: 62400, isManufactured: true },
    { name: 'Carved Gold Bangle Set', sku: 'GB-002', price: 155000, costPrice: 124000, isManufactured: true },
    { name: 'Lightweight Daily Wear Bangle', sku: 'GB-003', price: 35000, costPrice: 28000, isManufactured: false },
    // Pearl Pendants
    { name: 'South Sea Pearl Pendant', sku: 'PP-001', price: 42000, costPrice: 33600, isManufactured: true },
    { name: 'Akoya Pearl Drop Pendant', sku: 'PP-002', price: 28000, costPrice: 22400, isManufactured: true },
    { name: 'Tahitian Pearl Pendant', sku: 'PP-003', price: 55000, costPrice: 44000, isManufactured: true },
    // Gemstone Rings
    { name: 'Ruby Halo Ring', sku: 'GR-001', price: 125000, costPrice: 100000, isManufactured: true },
    { name: 'Emerald Cocktail Ring', sku: 'GR-002', price: 185000, costPrice: 148000, isManufactured: true },
    { name: 'Blue Sapphire Ring', sku: 'GR-003', price: 155000, costPrice: 124000, isManufactured: true },
    // Gold Chains
    { name: '22K Rope Chain 20in', sku: 'GC-001', price: 68000, costPrice: 54400, isManufactured: false },
    { name: '22K Box Chain 18in', sku: 'GC-002', price: 52000, costPrice: 41600, isManufactured: false },
    { name: '22K Figaro Chain 22in', sku: 'GC-003', price: 85000, costPrice: 68000, isManufactured: false },
  ]

  const products: Awaited<ReturnType<typeof prisma.product.create>>[] = []
  for (let i = 0; i < productDefs.length; i++) {
    const catIdx = Math.floor(i / 3)
    const p = await prisma.product.create({
      data: {
        ...productDefs[i],
        categoryId: categories[catIdx].id,
        unit: 'piece',
        minStockLevel: 5,
        isActive: true,
      },
    })
    products.push(p)
  }

  // ── Warehouses ──
  const whMain = await prisma.warehouse.create({ data: { name: 'Main Vault', code: 'VAULT-MUM', city: 'Mumbai', address: 'Zaveri Bazaar, Mumbai', manager: 'Vikram Sharma', capacity: 5000, isActive: true } })
  const whWorkshop = await prisma.warehouse.create({ data: { name: 'Karigarkhana', code: 'KGK-JAI', city: 'Jaipur', address: 'Johari Bazaar, Jaipur', manager: 'Meena Patel', capacity: 2000, isActive: true } })
  const whDist = await prisma.warehouse.create({ data: { name: 'Distribution Hub', code: 'DIST-DEL', city: 'Delhi', address: 'Karol Bagh, Delhi', manager: 'Raj Verma', capacity: 3000, isActive: true } })

  // ── Inventory Items ──
  const qtyMap: Record<string, [number, number, number]> = {} // productId -> [mainQty, workshopQty, distQty]
  for (let i = 0; i < products.length; i++) {
    const base = i % 5 === 0 ? 2 : i % 3 === 0 ? 8 : 15 + Math.floor(Math.random() * 20)
    qtyMap[products[i].id] = [base + 5, base + 2, base]
  }
  for (const product of products) {
    const [mQ, wQ, dQ] = qtyMap[product.id]
    await prisma.inventoryItem.create({ data: { productId: product.id, warehouseId: whMain.id, quantity: mQ, reorderPoint: 10, reorderQty: 50 } })
    await prisma.inventoryItem.create({ data: { productId: product.id, warehouseId: whWorkshop.id, quantity: wQ, reorderPoint: 5, reorderQty: 30 } })
    await prisma.inventoryItem.create({ data: { productId: product.id, warehouseId: whDist.id, quantity: dQ, reorderPoint: 8, reorderQty: 40 } })
  }

  // ── Suppliers ──
  const sup1 = await prisma.supplier.create({ data: { name: 'Bharat Gold Refinery', code: 'BGR', email: 'info@bgr.co.in', phone: '+91-22-23456789', city: 'Mumbai', country: 'India', rating: 4.5, leadTimeDays: 5, paymentTerms: 'Net 30', isActive: true } })
  const sup2 = await prisma.supplier.create({ data: { name: 'Surat Diamond House', code: 'SDH', email: 'sales@sdh.com', phone: '+91-261-2345678', city: 'Surat', country: 'India', rating: 4.8, leadTimeDays: 7, paymentTerms: 'Net 15', isActive: true } })
  const sup3 = await prisma.supplier.create({ data: { name: 'Rajasthan Silver Arts', code: 'RSA', email: 'orders@rsa.in', phone: '+91-141-2345678', city: 'Jaipur', country: 'India', rating: 3.8, leadTimeDays: 10, paymentTerms: 'Net 45', isActive: true } })
  const sup4 = await prisma.supplier.create({ data: { name: 'Colombo Gem Traders', code: 'CGT', email: 'gems@cgt.lk', phone: '+94-11-2345678', city: 'Colombo', country: 'Sri Lanka', rating: 4.2, leadTimeDays: 14, paymentTerms: 'Net 30', isActive: true } })
  const sup5 = await prisma.supplier.create({ data: { name: 'PackWell Jewellery Packaging', code: 'PWJ', email: 'supply@pwj.in', phone: '+91-11-2345678', city: 'Delhi', country: 'India', rating: 3.5, leadTimeDays: 3, paymentTerms: 'COD', isActive: true } })

  // ── Purchase Orders ──
  const po1 = await prisma.purchaseOrder.create({
    data: { poNumber: 'PO-2026-0001', supplierId: sup1.id, status: 'received', totalAmount: 580000, taxAmount: 104400, orderDate: new Date('2026-01-15'), expectedDate: new Date('2026-01-20'), items: { create: [{ productId: products[0].id, quantity: 2, unitPrice: 148000, totalPrice: 296000, receivedQty: 2 }, { productId: products[4].id, quantity: 2, unitPrice: 132000, totalPrice: 264000, receivedQty: 2 }] } },
    include: { items: true },
  })
  const po2 = await prisma.purchaseOrder.create({
    data: { poNumber: 'PO-2026-0002', supplierId: sup2.id, status: 'confirmed', totalAmount: 440000, taxAmount: 79200, orderDate: new Date('2026-02-10'), expectedDate: new Date('2026-02-17'), items: { create: [{ productId: products[3].id, quantity: 2, unitPrice: 220000, totalPrice: 440000, receivedQty: 0 }] } },
    include: { items: true },
  })
  const po3 = await prisma.purchaseOrder.create({
    data: { poNumber: 'PO-2026-0003', supplierId: sup3.id, status: 'sent', totalAmount: 42000, taxAmount: 7560, orderDate: new Date('2026-03-01'), expectedDate: new Date('2026-03-11'), items: { create: [{ productId: products[6].id, quantity: 20, unitPrice: 2100, totalPrice: 42000, receivedQty: 0 }] } },
    include: { items: true },
  })
  await prisma.purchaseOrder.create({
    data: { poNumber: 'PO-2026-0004', supplierId: sup4.id, status: 'draft', totalAmount: 372000, taxAmount: 66960, orderDate: new Date('2026-03-15'), items: { create: [{ productId: products[18].id, quantity: 2, unitPrice: 100000, totalPrice: 200000, receivedQty: 0 }, { productId: products[20].id, quantity: 1, unitPrice: 172000, totalPrice: 172000, receivedQty: 0 }] } },
  })
  await prisma.purchaseOrder.create({
    data: { poNumber: 'PO-2026-0005', supplierId: sup1.id, status: 'partial', totalAmount: 320000, taxAmount: 57600, orderDate: new Date('2026-02-20'), expectedDate: new Date('2026-02-25'), items: { create: [{ productId: products[21].id, quantity: 5, unitPrice: 54400, totalPrice: 272000, receivedQty: 3 }, { productId: products[22].id, quantity: 1, unitPrice: 48000, totalPrice: 48000, receivedQty: 0 }] } },
  })
  await prisma.purchaseOrder.create({
    data: { poNumber: 'PO-2026-0006', supplierId: sup5.id, status: 'received', totalAmount: 15000, taxAmount: 2700, orderDate: new Date('2026-01-05'), expectedDate: new Date('2026-01-08'), items: { create: [{ productId: products[7].id, quantity: 50, unitPrice: 300, totalPrice: 15000, receivedQty: 50 }] } },
  })

  // ── Shipments ──
  await prisma.shipment.create({
    data: { shipmentNumber: 'SHP-2026-0001', purchaseOrderId: po1.id, status: 'delivered', carrier: 'BlueDart', trackingNumber: 'BD1234567890', origin: 'Mumbai', destination: 'Mumbai Vault', shippingDate: new Date('2026-01-18'), deliveryDate: new Date('2026-01-19'), cost: 500, items: { create: [{ productId: products[0].id, quantity: 2 }, { productId: products[4].id, quantity: 2 }] } },
  })
  await prisma.shipment.create({
    data: { shipmentNumber: 'SHP-2026-0002', purchaseOrderId: po2.id, status: 'in_transit', carrier: 'DTDC', trackingNumber: 'DT9876543210', origin: 'Surat', destination: 'Mumbai Vault', shippingDate: new Date('2026-02-12'), cost: 1200, items: { create: [{ productId: products[3].id, quantity: 2 }] } },
  })
  await prisma.shipment.create({
    data: { shipmentNumber: 'SHP-2026-0003', purchaseOrderId: po3.id, status: 'shipped', carrier: 'Delhivery', trackingNumber: 'DL5551234567', origin: 'Jaipur', destination: 'Delhi Hub', shippingDate: new Date('2026-03-03'), cost: 800, items: { create: [{ productId: products[6].id, quantity: 20 }] } },
  })
  await prisma.shipment.create({
    data: { shipmentNumber: 'SHP-2026-0004', status: 'pending', carrier: 'India Post', origin: 'Colombo', destination: 'Mumbai Vault', cost: 2500, items: { create: [{ productId: products[18].id, quantity: 2 }, { productId: products[20].id, quantity: 1 }] } },
  })

  // ── BOM Components (for manufactured products) ──
  // Gold Necklace needs: Gold Chain + Gemstone Ring (gold wire + findings)
  await prisma.bomComponent.createMany({
    data: [
      { productId: products[0].id, componentId: products[21].id, quantity: 1, notes: 'Base chain' },
      { productId: products[0].id, componentId: products[17].id, quantity: 2, notes: 'Pearl drops' },
      { productId: products[1].id, componentId: products[21].id, quantity: 1.5, notes: 'Heavy chain base' },
      { productId: products[1].id, componentId: products[17].id, quantity: 5, notes: 'Pearl accents' },
      { productId: products[3].id, componentId: products[21].id, quantity: 0.3, notes: 'Ring band wire' },
      { productId: products[4].id, componentId: products[21].id, quantity: 0.25, notes: 'Setting wire' },
      { productId: products[5].id, componentId: products[21].id, quantity: 0.35, notes: 'Band wire' },
      { productId: products[9].id, componentId: products[21].id, quantity: 0.5, notes: 'Bracelet chain' },
      { productId: products[11].id, componentId: products[21].id, quantity: 0.6, notes: 'Bangle wire' },
      { productId: products[12].id, componentId: products[21].id, quantity: 0.4, notes: 'Bangle base' },
      { productId: products[13].id, componentId: products[21].id, quantity: 0.8, notes: 'Heavy bangle wire' },
      { productId: products[15].id, componentId: products[21].id, quantity: 0.15, notes: 'Pendant cap wire' },
      { productId: products[16].id, componentId: products[21].id, quantity: 0.12, notes: 'Pendant cap wire' },
      { productId: products[17].id, componentId: products[21].id, quantity: 0.18, notes: 'Pendant cap wire' },
      { productId: products[18].id, componentId: products[21].id, quantity: 0.3, notes: 'Ring band wire' },
      { productId: products[19].id, componentId: products[21].id, quantity: 0.35, notes: 'Setting wire' },
      { productId: products[20].id, componentId: products[21].id, quantity: 0.28, notes: 'Ring band wire' },
    ],
  })

  // ── Work Orders ──
  await prisma.workOrder.create({
    data: { woNumber: 'WO-2026-0001', status: 'completed', priority: 'high', plannedStart: new Date('2026-01-10'), plannedEnd: new Date('2026-01-20'), actualStart: new Date('2026-01-10'), actualEnd: new Date('2026-01-18'), products: { create: [{ productId: products[0].id, targetQty: 5, completedQty: 5, wastageQty: 0 }] } },
  })
  await prisma.workOrder.create({
    data: { woNumber: 'WO-2026-0002', status: 'in_progress', priority: 'urgent', plannedStart: new Date('2026-03-01'), plannedEnd: new Date('2026-03-15'), actualStart: new Date('2026-03-01'), products: { create: [{ productId: products[1].id, targetQty: 3, completedQty: 1, wastageQty: 0 }] } },
  })
  await prisma.workOrder.create({
    data: { woNumber: 'WO-2026-0003', status: 'in_progress', priority: 'medium', plannedStart: new Date('2026-03-05'), plannedEnd: new Date('2026-03-20'), actualStart: new Date('2026-03-06'), products: { create: [{ productId: products[3].id, targetQty: 8, completedQty: 3, wastageQty: 1 }] } },
  })
  await prisma.workOrder.create({
    data: { woNumber: 'WO-2026-0004', status: 'planned', priority: 'low', plannedStart: new Date('2026-04-01'), plannedEnd: new Date('2026-04-15'), products: { create: [{ productId: products[12].id, targetQty: 10, completedQty: 0, wastageQty: 0 }] } },
  })
  await prisma.workOrder.create({
    data: { woNumber: 'WO-2026-0005', status: 'planned', priority: 'medium', plannedStart: new Date('2026-04-05'), plannedEnd: new Date('2026-04-20'), products: { create: [{ productId: products[15].id, targetQty: 6, completedQty: 0, wastageQty: 0 }] } },
  })

  // ── Customers ──
  const cust1 = await prisma.customer.create({ data: { name: 'Priya Kapoor', email: 'priya@email.com', phone: '+91-9812345678', city: 'Mumbai', type: 'retail' } })
  const cust2 = await prisma.customer.create({ data: { name: 'Arjun Malhotra', email: 'arjun@email.com', phone: '+91-9823456789', city: 'Delhi', type: 'wholesale', gstNumber: '07AABCM1234A1Z5' } })
  const cust3 = await prisma.customer.create({ data: { name: 'Nisha Reddy', email: 'nisha@email.com', phone: '+91-9834567890', city: 'Hyderabad', type: 'retail' } })
  const cust4 = await prisma.customer.create({ data: { name: 'Royal Jewellers', email: 'orders@royaljewels.in', phone: '+91-9845678901', city: 'Jaipur', type: 'wholesale', gstNumber: '08AABCR5678B2Z3' } })
  const cust5 = await prisma.customer.create({ data: { name: 'Kavita Singh', email: 'kavita@email.com', phone: '+91-9856789012', city: 'Bangalore', type: 'online' } })
  const cust6 = await prisma.customer.create({ data: { name: 'Deepak Gupta', email: 'deepak@email.com', phone: '+91-9867890123', city: 'Chennai', type: 'retail' } })
  const cust7 = await prisma.customer.create({ data: { name: 'Lakshmi Jewels', email: 'info@lakshmi.co.in', phone: '+91-9878901234', city: 'Kolkata', type: 'wholesale', gstNumber: '19AABCL9012C3Z1' } })
  const cust8 = await prisma.customer.create({ data: { name: 'Ritu Sharma', email: 'ritu@email.com', phone: '+91-9889012345', city: 'Pune', type: 'online' } })

  // ── Sales Orders ──
  await prisma.salesOrder.create({
    data: { soNumber: 'SO-2026-0001', customerId: cust2.id, userId: admin.id, status: 'delivered', orderDate: new Date('2026-01-20'), deliveryDate: new Date('2026-01-25'), totalAmount: 296000, taxAmount: 53280, items: { create: [{ productId: products[0].id, quantity: 1, unitPrice: 185000, totalPrice: 185000 }, { productId: products[21].id, quantity: 2, unitPrice: 55500, totalPrice: 111000 }] } },
  })
  await prisma.salesOrder.create({
    data: { soNumber: 'SO-2026-0002', customerId: cust4.id, userId: manager.id, status: 'shipped', orderDate: new Date('2026-02-15'), totalAmount: 620000, taxAmount: 111600, items: { create: [{ productId: products[3].id, quantity: 2, unitPrice: 275000, totalPrice: 550000 }, { productId: products[6].id, quantity: 20, unitPrice: 3500, totalPrice: 70000 }] } },
  })
  await prisma.salesOrder.create({
    data: { soNumber: 'SO-2026-0003', customerId: cust1.id, userId: admin.id, status: 'confirmed', orderDate: new Date('2026-03-10'), totalAmount: 325000, taxAmount: 58500, items: { create: [{ productId: products[1].id, quantity: 1, unitPrice: 325000, totalPrice: 325000 }] } },
  })
  await prisma.salesOrder.create({
    data: { soNumber: 'SO-2026-0004', customerId: cust3.id, status: 'draft', orderDate: new Date('2026-03-18'), totalAmount: 42000, taxAmount: 7560, items: { create: [{ productId: products[15].id, quantity: 1, unitPrice: 42000, totalPrice: 42000 }] } },
  })
  await prisma.salesOrder.create({
    data: { soNumber: 'SO-2026-0005', customerId: cust6.id, userId: manager.id, status: 'processing', orderDate: new Date('2026-03-20'), totalAmount: 155000, taxAmount: 27900, items: { create: [{ productId: products[13].id, quantity: 1, unitPrice: 155000, totalPrice: 155000 }] } },
  })

  // ── POS Transactions ──
  const posItems = [
    { productId: products[6].id, productName: 'Oxidized Jhumka Earrings', quantity: 2, unitPrice: 3500, totalPrice: 7000 },
    { productId: products[7].id, productName: 'Silver Stud Earrings', quantity: 3, unitPrice: 1800, totalPrice: 5400 },
    { productId: products[14].id, productName: 'Lightweight Daily Wear Bangle', quantity: 1, unitPrice: 35000, totalPrice: 35000 },
    { productId: products[21].id, productName: '22K Rope Chain 20in', quantity: 1, unitPrice: 68000, totalPrice: 68000 },
    { productId: products[8].id, productName: 'Pearl Drop Silver Earrings', quantity: 1, unitPrice: 5200, totalPrice: 5200 },
    { productId: products[14].id, productName: 'Lightweight Daily Wear Bangle', quantity: 2, unitPrice: 35000, totalPrice: 70000 },
    { productId: products[22].id, productName: '22K Box Chain 18in', quantity: 1, unitPrice: 52000, totalPrice: 52000 },
    { productId: products[6].id, productName: 'Oxidized Jhumka Earrings', quantity: 4, unitPrice: 3500, totalPrice: 14000 },
  ]
  for (let i = 0; i < 8; i++) {
    const item = posItems[i]
    const subtotal = item.totalPrice
    const tax = Math.round(subtotal * 0.03)
    const discount = i % 3 === 0 ? 500 : 0
    await prisma.posTransaction.create({
      data: {
        transactionNumber: `TRX-2026-${String(i + 1).padStart(5, '0')}`,
        userId: i % 2 === 0 ? cashier.id : admin.id,
        customerName: i < 3 ? ['Priya Kapoor', 'Nisha Reddy', 'Walk-in Customer'][i] : 'Walk-in Customer',
        subtotal,
        taxAmount: tax,
        discount,
        totalAmount: subtotal + tax - discount,
        paymentMethod: ['cash', 'card', 'upi'][i % 3],
        status: 'completed',
        createdAt: new Date(Date.now() - (8 - i) * 86400000),
        items: { create: [item] },
      },
    })
  }

  // ── E-Commerce Orders ──
  await prisma.ecommerceOrder.create({
    data: { orderNumber: 'ORD-2026-00001', customerId: cust5.id, status: 'delivered', orderDate: new Date('2026-01-25'), shippingAddress: 'Kavita Singh, Koramangala, Bangalore 560034', totalAmount: 45000, taxAmount: 8100, shippingCost: 0, paymentMethod: 'online', paymentStatus: 'paid', items: { create: [{ productId: products[2].id, productName: 'Daily Wear Gold Chain Necklace', quantity: 1, unitPrice: 45000, totalPrice: 45000 }] } },
  })
  await prisma.ecommerceOrder.create({
    data: { orderNumber: 'ORD-2026-00002', customerId: cust8.id, status: 'shipped', orderDate: new Date('2026-02-20'), shippingAddress: 'Ritu Sharma, Kothrud, Pune 411038', totalAmount: 3500, taxAmount: 630, shippingCost: 99, paymentMethod: 'online', paymentStatus: 'paid', items: { create: [{ productId: products[6].id, productName: 'Oxidized Jhumka Earrings', quantity: 1, unitPrice: 3500, totalPrice: 3500 }] } },
  })
  await prisma.ecommerceOrder.create({
    data: { orderNumber: 'ORD-2026-00003', customerId: cust5.id, status: 'processing', orderDate: new Date('2026-03-15'), shippingAddress: 'Kavita Singh, Koramangala, Bangalore 560034', totalAmount: 78000, taxAmount: 14040, shippingCost: 0, paymentMethod: 'card', paymentStatus: 'paid', items: { create: [{ productId: products[12].id, productName: '22K Plain Gold Bangle', quantity: 1, unitPrice: 78000, totalPrice: 78000 }] } },
  })
  await prisma.ecommerceOrder.create({
    data: { orderNumber: 'ORD-2026-00004', customerId: cust8.id, status: 'confirmed', orderDate: new Date('2026-03-20'), shippingAddress: 'Ritu Sharma, Kothrud, Pune 411038', totalAmount: 52000, taxAmount: 9360, shippingCost: 0, paymentMethod: 'upi', paymentStatus: 'paid', items: { create: [{ productId: products[22].id, productName: '22K Box Chain 18in', quantity: 1, unitPrice: 52000, totalPrice: 52000 }] } },
  })
  await prisma.ecommerceOrder.create({
    data: { orderNumber: 'ORD-2026-00005', customerId: cust3.id, status: 'pending', orderDate: new Date('2026-03-22'), shippingAddress: 'Nisha Reddy, Banjara Hills, Hyderabad 500034', totalAmount: 5200, taxAmount: 936, shippingCost: 99, paymentMethod: 'online', paymentStatus: 'pending', items: { create: [{ productId: products[8].id, productName: 'Pearl Drop Silver Earrings', quantity: 1, unitPrice: 5200, totalPrice: 5200 }] } },
  })

  // ── Demand Forecasts ──
  for (let i = 0; i < 4; i++) {
    const p = products[i * 6] // Every 6th product
    for (let m = 0; m < 3; m++) {
      await prisma.demandForecast.create({
        data: {
          productId: p.id,
          period: `2026-${String(m + 4).padStart(2, '0')}`,
          predictedDemand: 8 + Math.floor(Math.random() * 15),
          confidence: 0.6 + Math.random() * 0.3,
          model: ['prophet', 'arima', 'moving_avg'][m % 3],
        },
      })
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log(`   Users: 3 | Categories: ${categories.length} | Products: ${products.length}`)
  console.log('   Warehouses: 3 | Suppliers: 5 | Customers: 8')
  console.log('   Purchase Orders: 6 | Sales Orders: 5 | POS Transactions: 8')
  console.log('   E-Commerce Orders: 5 | Work Orders: 5 | Shipments: 4')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
