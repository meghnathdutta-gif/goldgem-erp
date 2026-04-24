import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.demandForecast.deleteMany()
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
  await prisma.warehouse.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // 1. Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@goldgem.com',
      name: 'Rajesh Mehta',
      password: 'admin123',
      role: 'admin',
      phone: '+91-9876543210',
      isActive: true,
    },
  })

  // 2. Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Gold Necklaces', description: 'Handcrafted gold necklaces', icon: 'necklace', color: '#F59E0B' } }),
    prisma.category.create({ data: { name: 'Diamond Rings', description: 'Certified diamond rings', icon: 'ring', color: '#8B5CF6' } }),
    prisma.category.create({ data: { name: 'Silver Earrings', description: 'Sterling silver earrings', icon: 'earring', color: '#6B7280' } }),
    prisma.category.create({ data: { name: 'Platinum Bracelets', description: 'Premium platinum bracelets', icon: 'bracelet', color: '#E5E7EB' } }),
    prisma.category.create({ data: { name: 'Gold Bangles', description: 'Traditional gold bangles', icon: 'bangle', color: '#D97706' } }),
    prisma.category.create({ data: { name: 'Pearl Pendants', description: 'Elegant pearl pendants', icon: 'pendant', color: '#FDF2F8' } }),
    prisma.category.create({ data: { name: 'Gemstone Rings', description: 'Colored gemstone rings', icon: 'gem', color: '#10B981' } }),
    prisma.category.create({ data: { name: 'Gold Chains', description: '22K & 18K gold chains', icon: 'chain', color: '#FBBF24' } }),
  ])

  // 3. Products (3 per category = 24)
  const productData = [
    // Gold Necklaces
    { name: 'Temple Gold Necklace', sku: 'GN-001', price: 185000, costPrice: 148000, description: 'Traditional South Indian temple design necklace in 22K gold', minStockLevel: 5, isManufactured: true },
    { name: 'Kundan Necklace Set', sku: 'GN-002', price: 245000, costPrice: 192000, description: 'Royal Kundan necklace with matching earrings', minStockLevel: 3, isManufactured: true },
    { name: 'Modern Chain Necklace', sku: 'GN-003', price: 78000, costPrice: 62000, description: 'Contemporary link chain necklace in 18K gold', minStockLevel: 8, isManufactured: false },
    // Diamond Rings
    { name: 'Solitaire Diamond Ring', sku: 'DR-001', price: 350000, costPrice: 265000, description: '1 carat VS1 solitaire in platinum setting', minStockLevel: 4, isManufactured: true },
    { name: 'Halo Diamond Ring', sku: 'DR-002', price: 195000, costPrice: 148000, description: '0.5 carat center with halo setting in 18K gold', minStockLevel: 6, isManufactured: true },
    { name: 'Three-Stone Diamond Ring', sku: 'DR-003', price: 275000, costPrice: 210000, description: 'Past-present-future three diamond ring', minStockLevel: 3, isManufactured: true },
    // Silver Earrings
    { name: 'Jhumka Silver Earrings', sku: 'SE-001', price: 4500, costPrice: 2800, description: 'Traditional bell-shaped jhumka in sterling silver', minStockLevel: 20, isManufactured: false },
    { name: 'Chandbali Earrings', sku: 'SE-002', price: 6800, costPrice: 4200, description: 'Moon-shaped chandbali with filigree work', minStockLevel: 15, isManufactured: false },
    { name: 'Stud Pearl Earrings', sku: 'SE-003', price: 3200, costPrice: 1900, description: 'Minimalist pearl stud earrings in silver', minStockLevel: 25, isManufactured: false },
    // Platinum Bracelets
    { name: 'Platinum Love Bracelet', sku: 'PB-001', price: 125000, costPrice: 95000, description: 'Minimalist platinum bracelet with clasp', minStockLevel: 5, isManufactured: true },
    { name: 'Diamond Cut Platinum Cuff', sku: 'PB-002', price: 185000, costPrice: 140000, description: 'Diamond-cut texture platinum cuff bracelet', minStockLevel: 3, isManufactured: true },
    { name: 'Platinum Chain Bracelet', sku: 'PB-003', price: 88000, costPrice: 66000, description: 'Delicate chain link platinum bracelet', minStockLevel: 6, isManufactured: false },
    // Gold Bangles
    { name: '22K Gold Bangle Set', sku: 'GB-001', price: 156000, costPrice: 128000, description: 'Set of 4 traditional 22K gold bangles', minStockLevel: 5, isManufactured: true },
    { name: 'Filigree Gold Bangle', sku: 'GB-002', price: 98000, costPrice: 76000, description: 'Intricate filigree work gold bangle', minStockLevel: 8, isManufactured: true },
    { name: 'Modern Geometric Bangle', sku: 'GB-003', price: 67000, costPrice: 52000, description: 'Contemporary geometric pattern bangle in 18K gold', minStockLevel: 10, isManufactured: false },
    // Pearl Pendants
    { name: 'South Sea Pearl Pendant', sku: 'PP-001', price: 45000, costPrice: 32000, description: '12mm South Sea pearl in gold setting', minStockLevel: 7, isManufactured: true },
    { name: 'Tahitian Pearl Pendant', sku: 'PP-002', price: 62000, costPrice: 45000, description: 'Rare black Tahitian pearl pendant', minStockLevel: 4, isManufactured: true },
    { name: 'Freshwater Pearl Drop', sku: 'PP-003', price: 15000, costPrice: 9500, description: 'Elegant freshwater pearl drop pendant', minStockLevel: 12, isManufactured: false },
    // Gemstone Rings
    { name: 'Emerald Cocktail Ring', sku: 'GR-001', price: 135000, costPrice: 98000, description: '3 carat Colombian emerald in gold setting', minStockLevel: 4, isManufactured: true },
    { name: 'Ruby Statement Ring', sku: 'GR-002', price: 168000, costPrice: 125000, description: '2.5 carat Burmese ruby surrounded by diamonds', minStockLevel: 3, isManufactured: true },
    { name: 'Sapphire Band Ring', sku: 'GR-003', price: 89000, costPrice: 65000, description: 'Blue sapphire eternity band in white gold', minStockLevel: 6, isManufactured: true },
    // Gold Chains
    { name: '22K Rope Chain', sku: 'GC-001', price: 112000, costPrice: 88000, description: 'Classic rope chain in 22K gold, 20 inches', minStockLevel: 8, isManufactured: false },
    { name: '18K Box Chain', sku: 'GC-002', price: 58000, costPrice: 45000, description: 'Elegant box chain in 18K gold, 18 inches', minStockLevel: 10, isManufactured: false },
    { name: '22K Singapore Chain', sku: 'GC-003', price: 94000, costPrice: 74000, description: 'Twisted Singapore chain in 22K gold, 22 inches', minStockLevel: 7, isManufactured: false },
  ]

  const products: Awaited<ReturnType<typeof prisma.product.create>>[] = []
  for (let i = 0; i < productData.length; i++) {
    const p = await prisma.product.create({
      data: {
        ...productData[i],
        categoryId: categories[i % 8 >= 3 ? Math.floor(i / 3) : Math.floor(i / 3)].id,
        unit: 'piece',
        isActive: true,
      },
    })
    products.push(p)
  }

  // Fix: assign correct category for each group of 3
  // We need to update the products with correct categories
  for (let i = 0; i < products.length; i++) {
    const catIndex = Math.floor(i / 3)
    if (catIndex < categories.length) {
      await prisma.product.update({
        where: { id: products[i].id },
        data: { categoryId: categories[catIndex].id },
      })
    }
  }

  // 4. Warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: { name: 'Main Vault', code: 'MUM-VAULT', address: '123 Zaveri Bazaar', city: 'Mumbai', phone: '+91-22-23456789', manager: 'Arun Sharma', capacity: 5000, isActive: true },
    }),
    prisma.warehouse.create({
      data: { name: 'Workshop (Karigarkhana)', code: 'JAI-WORK', address: '456 Johari Bazaar', city: 'Jaipur', phone: '+91-141-2345678', manager: 'Vikram Singh', capacity: 2000, isActive: true },
    }),
    prisma.warehouse.create({
      data: { name: 'Distribution Hub', code: 'DEL-DIST', address: '789 Chandni Chowk', city: 'Delhi', phone: '+91-11-23456789', manager: 'Priya Gupta', capacity: 8000, isActive: true },
    }),
  ])

  // 5. Inventory Items
  const inventoryItems: Awaited<ReturnType<typeof prisma.inventoryItem.create>>[] = []
  for (let i = 0; i < products.length; i++) {
    const warehouseIndex = i % 3
    const qty = Math.floor(Math.random() * 80) + 5
    const reserved = Math.floor(Math.random() * Math.min(qty, 10))
    inventoryItems.push(
      await prisma.inventoryItem.create({
        data: {
          productId: products[i].id,
          warehouseId: warehouses[warehouseIndex].id,
          quantity: qty,
          reservedQty: reserved,
          reorderPoint: productData[i].minStockLevel,
          reorderQty: productData[i].minStockLevel * 5,
        },
      })
    )
  }
  // Also add some items to second warehouse for high-value products
  for (let i = 0; i < 6; i++) {
    inventoryItems.push(
      await prisma.inventoryItem.create({
        data: {
          productId: products[i].id,
          warehouseId: warehouses[(i + 1) % 3].id,
          quantity: Math.floor(Math.random() * 20) + 2,
          reservedQty: 0,
          reorderPoint: productData[i].minStockLevel,
          reorderQty: productData[i].minStockLevel * 3,
        },
      })
    )
  }

  // 6. Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: { name: 'Swarnalakshmi Gold Traders', code: 'SLG', email: 'info@swarnalakshmi.com', phone: '+91-22-23450001', address: '12 Zaveri Bazaar', city: 'Mumbai', country: 'India', gstNumber: '27AABCS1234F1Z5', rating: 4.5, leadTimeDays: 5, paymentTerms: 'Net 30', isActive: true },
    }),
    prisma.supplier.create({
      data: { name: 'Krystal Diamonds Ltd', code: 'KDL', email: 'sales@krystaldiamonds.com', phone: '+91-22-23450002', address: '34 Diamond Market', city: 'Surat', country: 'India', gstNumber: '24AABCK5678G2H7', rating: 4.8, leadTimeDays: 10, paymentTerms: 'Net 15', isActive: true },
    }),
    prisma.supplier.create({
      data: { name: 'Rajasthan Silver Arts', code: 'RSA', email: 'contact@rssilver.com', phone: '+91-141-2345003', address: '56 Silver Street', city: 'Jaipur', country: 'India', gstNumber: '08AABCR9012H3I9', rating: 3.8, leadTimeDays: 7, paymentTerms: 'Net 45', isActive: true },
    }),
    prisma.supplier.create({
      data: { name: 'Gems International', code: 'GMI', email: 'order@gemsintl.com', phone: '+91-80-2345004', address: '78 Gem Lane', city: 'Bangalore', country: 'India', gstNumber: '29AABCG3456I4J1', rating: 4.2, leadTimeDays: 14, paymentTerms: 'Net 30', isActive: true },
    }),
    prisma.supplier.create({
      data: { name: 'PackRight Solutions', code: 'PRS', email: 'info@packright.com', phone: '+91-11-2345005', address: '90 Industrial Area', city: 'Delhi', country: 'India', gstNumber: '07AABCP7890J5K3', rating: 3.5, leadTimeDays: 3, paymentTerms: 'COD', isActive: true },
    }),
  ])

  // 7. Purchase Orders
  const pos = await Promise.all([
    prisma.purchaseOrder.create({
      data: {
        poNumber: 'PO-2025-001', supplierId: suppliers[0].id, status: 'received', orderDate: new Date('2025-01-15'), expectedDate: new Date('2025-01-20'), totalAmount: 580000, taxAmount: 104400, notes: 'Gold raw material replenishment',
        items: { create: [
          { productId: products[0].id, quantity: 10, unitPrice: 14800, totalPrice: 148000, receivedQty: 10 },
          { productId: products[1].id, quantity: 5, unitPrice: 19200, totalPrice: 96000, receivedQty: 5 },
          { productId: products[13].id, quantity: 20, unitPrice: 12800, totalPrice: 256000, receivedQty: 20 },
          { productId: products[14].id, quantity: 5, unitPrice: 15200, totalPrice: 76000, receivedQty: 5 },
        ] },
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: 'PO-2025-002', supplierId: suppliers[1].id, status: 'delivered', orderDate: new Date('2025-02-01'), expectedDate: new Date('2025-02-11'), totalAmount: 425000, taxAmount: 76500, notes: 'Diamond consignment for Q2',
        items: { create: [
          { productId: products[3].id, quantity: 4, unitPrice: 52500, totalPrice: 210000, receivedQty: 4 },
          { productId: products[4].id, quantity: 8, unitPrice: 18500, totalPrice: 148000, receivedQty: 8 },
          { productId: products[5].id, quantity: 3, unitPrice: 22333, totalPrice: 67000, receivedQty: 3 },
        ] },
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: 'PO-2025-003', supplierId: suppliers[2].id, status: 'approved', orderDate: new Date('2025-03-01'), expectedDate: new Date('2025-03-08'), totalAmount: 89000, taxAmount: 16020,
        items: { create: [
          { productId: products[6].id, quantity: 50, unitPrice: 1120, totalPrice: 56000, receivedQty: 0 },
          { productId: products[7].id, quantity: 30, unitPrice: 1100, totalPrice: 33000, receivedQty: 0 },
        ] },
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: 'PO-2025-004', supplierId: suppliers[3].id, status: 'draft', orderDate: new Date('2025-03-10'), expectedDate: new Date('2025-03-24'), totalAmount: 356000, taxAmount: 64080,
        items: { create: [
          { productId: products[19].id, quantity: 5, unitPrice: 39200, totalPrice: 196000, receivedQty: 0 },
          { productId: products[20].id, quantity: 4, unitPrice: 40000, totalPrice: 160000, receivedQty: 0 },
        ] },
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: 'PO-2025-005', supplierId: suppliers[0].id, status: 'pending', orderDate: new Date('2025-03-15'), expectedDate: new Date('2025-03-20'), totalAmount: 220000, taxAmount: 39600,
        items: { create: [
          { productId: products[21].id, quantity: 6, unitPrice: 21667, totalPrice: 130000, receivedQty: 0 },
          { productId: products[22].id, quantity: 5, unitPrice: 18000, totalPrice: 90000, receivedQty: 0 },
        ] },
      },
    }),
    prisma.purchaseOrder.create({
      data: {
        poNumber: 'PO-2025-006', supplierId: suppliers[4].id, status: 'received', orderDate: new Date('2025-02-20'), expectedDate: new Date('2025-02-23'), totalAmount: 35000, taxAmount: 6300, notes: 'Packaging materials for all product lines',
        items: { create: [
          { productId: products[8].id, quantity: 100, unitPrice: 190, totalPrice: 19000, receivedQty: 100 },
          { productId: products[11].id, quantity: 50, unitPrice: 320, totalPrice: 16000, receivedQty: 50 },
        ] },
      },
    }),
  ])

  // 8. Shipments
  const shipments = await Promise.all([
    prisma.shipment.create({
      data: {
        shipmentNumber: 'SHP-2025-001', purchaseOrderId: pos[0].id, status: 'delivered', carrier: 'BlueDart', trackingNumber: 'BD1234567890', shippingDate: new Date('2025-01-16'), deliveryDate: new Date('2025-01-19'), origin: 'Mumbai', destination: 'Mumbai Vault', cost: 2500,
        items: { create: [
          { productId: products[0].id, quantity: 10 },
          { productId: products[1].id, quantity: 5 },
          { productId: products[13].id, quantity: 20 },
          { productId: products[14].id, quantity: 5 },
        ] },
      },
    }),
    prisma.shipment.create({
      data: {
        shipmentNumber: 'SHP-2025-002', purchaseOrderId: pos[1].id, status: 'in_transit', carrier: 'DTDC', trackingNumber: 'DT9876543210', shippingDate: new Date('2025-02-02'), origin: 'Surat', destination: 'Mumbai Vault', cost: 8500,
        items: { create: [
          { productId: products[3].id, quantity: 4 },
          { productId: products[4].id, quantity: 8 },
        ] },
      },
    }),
    prisma.shipment.create({
      data: {
        shipmentNumber: 'SHP-2025-003', purchaseOrderId: pos[2].id, status: 'pending', carrier: 'Delhivery', trackingNumber: 'DL5551234567', origin: 'Jaipur', destination: 'Delhi Hub', cost: 3200,
        items: { create: [
          { productId: products[6].id, quantity: 50 },
          { productId: products[7].id, quantity: 30 },
        ] },
      },
    }),
    prisma.shipment.create({
      data: {
        shipmentNumber: 'SHP-2025-004', purchaseOrderId: pos[5].id, status: 'delivered', carrier: 'India Post', trackingNumber: 'IP3334445556', shippingDate: new Date('2025-02-20'), deliveryDate: new Date('2025-02-22'), origin: 'Delhi', destination: 'Jaipur Workshop', cost: 1200,
        items: { create: [
          { productId: products[8].id, quantity: 100 },
        ] },
      },
    }),
  ])

  // 9. BOM Components (for manufactured products)
  // Product 0: Temple Gold Necklace needs Gold Chain (22) and Pearl Pendant (16)
  await prisma.bomComponent.createMany({
    data: [
      { productId: products[0].id, componentId: products[22].id, quantity: 1, notes: 'Base 22K gold chain' },
      { productId: products[0].id, componentId: products[16].id, quantity: 2, notes: 'Pearl drops for pendant' },
      // Product 3: Solitaire Diamond Ring needs Gold Chain component
      { productId: products[3].id, componentId: products[22].id, quantity: 0.5, notes: 'Gold band material' },
      // Product 4: Halo Diamond Ring
      { productId: products[4].id, componentId: products[22].id, quantity: 0.3, notes: '18K gold for ring band' },
      // Product 13: 22K Gold Bangle Set
      { productId: products[13].id, componentId: products[22].id, quantity: 2, notes: '22K gold wire for bangles' },
      // Product 14: Filigree Gold Bangle
      { productId: products[14].id, componentId: products[23].id, quantity: 1.5, notes: '18K gold for filigree work' },
      // Product 16: South Sea Pearl Pendant
      { productId: products[16].id, componentId: products[23].id, quantity: 0.5, notes: '18K gold setting' },
      // Product 19: Emerald Cocktail Ring
      { productId: products[19].id, componentId: products[22].id, quantity: 0.4, notes: 'Gold band for ring' },
      // Product 20: Ruby Statement Ring
      { productId: products[20].id, componentId: products[22].id, quantity: 0.5, notes: 'Gold band for ring' },
      // Product 9: Platinum Love Bracelet needs chain
      { productId: products[9].id, componentId: products[24].id, quantity: 0.8, notes: 'Platinum chain link material' },
    ],
  })

  // 10. Work Orders
  const workOrders = await Promise.all([
    prisma.workOrder.create({
      data: {
        woNumber: 'WO-2025-001', status: 'completed', priority: 'high', plannedStart: new Date('2025-02-01'), plannedEnd: new Date('2025-02-10'), actualStart: new Date('2025-02-01'), actualEnd: new Date('2025-02-09'), notes: 'Temple necklace order for wedding season',
        products: { create: [
          { productId: products[0].id, targetQty: 8, completedQty: 8, wastageQty: 1 },
        ] },
      },
    }),
    prisma.workOrder.create({
      data: {
        woNumber: 'WO-2025-002', status: 'in_progress', priority: 'high', plannedStart: new Date('2025-03-01'), plannedEnd: new Date('2025-03-15'), actualStart: new Date('2025-03-02'), notes: 'Diamond ring batch for Akshaya Tritiya',
        products: { create: [
          { productId: products[3].id, targetQty: 5, completedQty: 3, wastageQty: 0 },
          { productId: products[4].id, targetQty: 10, completedQty: 6, wastageQty: 1 },
        ] },
      },
    }),
    prisma.workOrder.create({
      data: {
        woNumber: 'WO-2025-003', status: 'in_progress', priority: 'medium', plannedStart: new Date('2025-03-05'), plannedEnd: new Date('2025-03-20'), actualStart: new Date('2025-03-06'), notes: 'Gold bangle production run',
        products: { create: [
          { productId: products[13].id, targetQty: 15, completedQty: 8, wastageQty: 2 },
          { productId: products[14].id, targetQty: 10, completedQty: 4, wastageQty: 1 },
        ] },
      },
    }),
    prisma.workOrder.create({
      data: {
        woNumber: 'WO-2025-004', status: 'planned', priority: 'low', plannedStart: new Date('2025-04-01'), plannedEnd: new Date('2025-04-15'), notes: 'Gemstone ring collection for festive season',
        products: { create: [
          { productId: products[19].id, targetQty: 6, completedQty: 0, wastageQty: 0 },
          { productId: products[20].id, targetQty: 4, completedQty: 0, wastageQty: 0 },
          { productId: products[21].id, targetQty: 8, completedQty: 0, wastageQty: 0 },
        ] },
      },
    }),
    prisma.workOrder.create({
      data: {
        woNumber: 'WO-2025-005', status: 'planned', priority: 'medium', plannedStart: new Date('2025-04-10'), plannedEnd: new Date('2025-04-25'), notes: 'Platinum bracelet special order',
        products: { create: [
          { productId: products[9].id, targetQty: 5, completedQty: 0, wastageQty: 0 },
          { productId: products[10].id, targetQty: 3, completedQty: 0, wastageQty: 0 },
        ] },
      },
    }),
  ])

  // 11. Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Anita Kapoor', email: 'anita@email.com', phone: '+91-9876543201', address: '12 Pali Hill', city: 'Mumbai', type: 'retail' } }),
    prisma.customer.create({ data: { name: 'Deepam Jewellers', email: 'purchase@deepam.com', phone: '+91-9876543202', address: '45 MG Road', city: 'Chennai', gstNumber: '33AABCD5678E1F2', type: 'wholesale' } }),
    prisma.customer.create({ data: { name: 'Priyanka Sharma', email: 'priyanka.s@email.com', phone: '+91-9876543203', address: '78 Civil Lines', city: 'Delhi', type: 'retail' } }),
    prisma.customer.create({ data: { name: 'Lakshmi Gold House', email: 'orders@lakshmigold.com', phone: '+91-9876543204', address: '90 Broadway', city: 'Coimbatore', gstNumber: '33AABCL9012F2G4', type: 'wholesale' } }),
    prisma.customer.create({ data: { name: 'Rohan Patel', email: 'rohan.p@email.com', phone: '+91-9876543205', address: '23 SG Highway', city: 'Ahmedabad', type: 'online' } }),
    prisma.customer.create({ data: { name: 'Meera Iyer', email: 'meera.i@email.com', phone: '+91-9876543206', address: '56 Indiranagar', city: 'Bangalore', type: 'retail' } }),
    prisma.customer.create({ data: { name: 'Royal Orchid Jewels', email: 'bulk@royalorchid.com', phone: '+91-9876543207', address: '34 Park Street', city: 'Kolkata', gstNumber: '19AABCR3456G3H6', type: 'wholesale' } }),
    prisma.customer.create({ data: { name: 'Sneha Reddy', email: 'sneha.r@email.com', phone: '+91-9876543208', address: '67 Jubilee Hills', city: 'Hyderabad', type: 'online' } }),
  ])

  // 12. Sales Orders
  await Promise.all([
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2025-001', customerId: customers[0].id, userId: admin.id, status: 'delivered', orderDate: new Date('2025-01-20'), deliveryDate: new Date('2025-01-25'), totalAmount: 245000, taxAmount: 44100, discount: 5000,
        items: { create: [
          { productId: products[0].id, quantity: 1, unitPrice: 185000, totalPrice: 185000 },
          { productId: products[16].id, quantity: 2, unitPrice: 30000, totalPrice: 60000 },
        ] },
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2025-002', customerId: customers[1].id, status: 'confirmed', orderDate: new Date('2025-02-10'), deliveryDate: new Date('2025-02-20'), totalAmount: 935000, taxAmount: 168300, discount: 0,
        items: { create: [
          { productId: products[13].id, quantity: 3, unitPrice: 156000, totalPrice: 468000 },
          { productId: products[14].id, quantity: 3, unitPrice: 98000, totalPrice: 294000 },
          { productId: products[12].id, quantity: 2, unitPrice: 86500, totalPrice: 173000 },
        ] },
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2025-003', customerId: customers[2].id, userId: admin.id, status: 'processing', orderDate: new Date('2025-03-01'), totalAmount: 350000, taxAmount: 63000, discount: 10000,
        items: { create: [
          { productId: products[3].id, quantity: 1, unitPrice: 350000, totalPrice: 350000 },
        ] },
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2025-004', customerId: customers[3].id, status: 'draft', orderDate: new Date('2025-03-10'), totalAmount: 628000, taxAmount: 113040,
        items: { create: [
          { productId: products[0].id, quantity: 2, unitPrice: 185000, totalPrice: 370000 },
          { productId: products[1].id, quantity: 1, unitPrice: 245000, totalPrice: 245000 },
          { productId: products[15].id, quantity: 2, unitPrice: 6500, totalPrice: 13000 },
        ] },
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2025-005', customerId: customers[5].id, userId: admin.id, status: 'confirmed', orderDate: new Date('2025-03-12'), totalAmount: 172000, taxAmount: 30960, discount: 2000,
        items: { create: [
          { productId: products[9].id, quantity: 1, unitPrice: 125000, totalPrice: 125000 },
          { productId: products[15].id, quantity: 3, unitPrice: 15000, totalPrice: 45000 },
          { productId: products[23].id, quantity: 1, unitPrice: 58000, totalPrice: 58000 },
        ] },
      },
    }),
  ])

  // 13. POS Transactions
  await Promise.all([
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-001', userId: admin.id, customerName: 'Walk-in Customer', subtotal: 6800, taxAmount: 1224, totalAmount: 8024, paymentMethod: 'cash', status: 'completed',
        items: { create: [
          { productId: products[6].id, productName: 'Jhumka Silver Earrings', quantity: 1, unitPrice: 4500, totalPrice: 4500 },
          { productId: products[8].id, productName: 'Stud Pearl Earrings', quantity: 1, unitPrice: 3200, totalPrice: 3200 },
        ] },
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-002', userId: admin.id, customerName: 'Vikram Joshi', subtotal: 94000, taxAmount: 16920, totalAmount: 110920, paymentMethod: 'card', status: 'completed',
        items: { create: [
          { productId: products[23].id, productName: '18K Box Chain', quantity: 1, unitPrice: 58000, totalPrice: 58000 },
          { productId: products[15].id, productName: 'Freshwater Pearl Drop', quantity: 2, unitPrice: 15000, totalPrice: 30000 },
          { productId: products[8].id, productName: 'Stud Pearl Earrings', quantity: 1, unitPrice: 3200, totalPrice: 3200 },
        ] },
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-003', userId: admin.id, customerName: 'Sunita Rani', subtotal: 67000, taxAmount: 12060, totalAmount: 79060, paymentMethod: 'upi', status: 'completed',
        items: { create: [
          { productId: products[15].id, productName: 'Modern Geometric Bangle', quantity: 1, unitPrice: 67000, totalPrice: 67000 },
        ] },
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-004', userId: admin.id, customerName: 'Walk-in Customer', subtotal: 4500, taxAmount: 810, totalAmount: 5310, paymentMethod: 'cash', status: 'completed',
        items: { create: [
          { productId: products[6].id, productName: 'Jhumka Silver Earrings', quantity: 1, unitPrice: 4500, totalPrice: 4500 },
        ] },
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-005', userId: admin.id, customerName: 'Rekha Shah', subtotal: 283000, taxAmount: 50940, discount: 5000, totalAmount: 328940, paymentMethod: 'card', status: 'completed',
        items: { create: [
          { productId: products[1].id, productName: 'Kundan Necklace Set', quantity: 1, unitPrice: 245000, totalPrice: 245000 },
          { productId: products[7].id, productName: 'Chandbali Earrings', quantity: 1, unitPrice: 6800, totalPrice: 6800 },
          { productId: products[15].id, productName: 'Freshwater Pearl Drop', quantity: 2, unitPrice: 15000, totalPrice: 30000 },
        ] },
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-006', userId: admin.id, customerName: 'Walk-in Customer', subtotal: 185000, taxAmount: 33300, totalAmount: 218300, paymentMethod: 'upi', status: 'completed',
        items: { create: [
          { productId: products[0].id, productName: 'Temple Gold Necklace', quantity: 1, unitPrice: 185000, totalPrice: 185000 },
        ] },
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-007', userId: admin.id, customerName: 'Kavita Nair', subtotal: 233000, taxAmount: 41940, discount: 3000, totalAmount: 271940, paymentMethod: 'card', status: 'completed',
        items: { create: [
          { productId: products[9].id, productName: 'Platinum Love Bracelet', quantity: 1, unitPrice: 125000, totalPrice: 125000 },
          { productId: products[16].id, productName: 'South Sea Pearl Pendant', quantity: 1, unitPrice: 45000, totalPrice: 45000 },
          { productId: products[24].id, productName: '22K Singapore Chain', quantity: 1, unitPrice: 94000, totalPrice: 94000 },
        ] },
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-2025-008', userId: admin.id, customerName: 'Amit Verma', subtotal: 112000, taxAmount: 20160, totalAmount: 132160, paymentMethod: 'cash', status: 'completed',
        items: { create: [
          { productId: products[22].id, productName: '22K Rope Chain', quantity: 1, unitPrice: 112000, totalPrice: 112000 },
        ] },
      },
    }),
  ])

  // 14. E-Commerce Orders
  await Promise.all([
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2025-001', customerId: customers[4].id, status: 'shipped', orderDate: new Date('2025-02-15'), shippingAddress: '23 SG Highway, Ahmedabad 380054', totalAmount: 6800, taxAmount: 1224, shippingCost: 200, paymentMethod: 'online', paymentStatus: 'paid',
        items: { create: [
          { productId: products[7].id, productName: 'Chandbali Earrings', quantity: 1, unitPrice: 6800, totalPrice: 6800 },
        ] },
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2025-002', customerId: customers[7].id, status: 'processing', orderDate: new Date('2025-03-01'), shippingAddress: '67 Jubilee Hills, Hyderabad 500033', totalAmount: 15000, taxAmount: 2700, shippingCost: 150, paymentMethod: 'online', paymentStatus: 'paid',
        items: { create: [
          { productId: products[17].id, productName: 'Freshwater Pearl Drop', quantity: 1, unitPrice: 15000, totalPrice: 15000 },
        ] },
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2025-003', customerId: customers[4].id, status: 'delivered', orderDate: new Date('2025-01-20'), shippingAddress: '23 SG Highway, Ahmedabad 380054', totalAmount: 4500, taxAmount: 810, shippingCost: 100, paymentMethod: 'online', paymentStatus: 'paid',
        items: { create: [
          { productId: products[6].id, productName: 'Jhumka Silver Earrings', quantity: 1, unitPrice: 4500, totalPrice: 4500 },
        ] },
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2025-004', customerId: customers[7].id, status: 'pending', orderDate: new Date('2025-03-10'), shippingAddress: '67 Jubilee Hills, Hyderabad 500033', totalAmount: 58000, taxAmount: 10440, shippingCost: 500, paymentMethod: 'online', paymentStatus: 'pending',
        items: { create: [
          { productId: products[23].id, productName: '18K Box Chain', quantity: 1, unitPrice: 58000, totalPrice: 58000 },
        ] },
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2025-005', customerId: customers[4].id, status: 'cancelled', orderDate: new Date('2025-02-28'), shippingAddress: '23 SG Highway, Ahmedabad 380054', totalAmount: 156000, taxAmount: 28080, shippingCost: 500, paymentMethod: 'online', paymentStatus: 'refunded', notes: 'Customer changed mind - full refund issued',
        items: { create: [
          { productId: products[13].id, productName: '22K Gold Bangle Set', quantity: 1, unitPrice: 156000, totalPrice: 156000 },
        ] },
      },
    }),
  ])

  // 15. Demand Forecasts
  await prisma.demandForecast.createMany({
    data: [
      { productId: products[0].id, period: '2025-04', predictedDemand: 12, confidence: 0.85, model: 'prophet' },
      { productId: products[0].id, period: '2025-05', predictedDemand: 15, confidence: 0.78, model: 'prophet' },
      { productId: products[3].id, period: '2025-04', predictedDemand: 8, confidence: 0.72, model: 'prophet' },
      { productId: products[3].id, period: '2025-05', predictedDemand: 10, confidence: 0.68, model: 'prophet' },
      { productId: products[13].id, period: '2025-04', predictedDemand: 20, confidence: 0.80, model: 'prophet' },
      { productId: products[13].id, period: '2025-05', predictedDemand: 25, confidence: 0.75, model: 'prophet' },
      { productId: products[6].id, period: '2025-04', predictedDemand: 45, confidence: 0.90, model: 'prophet' },
      { productId: products[6].id, period: '2025-05', predictedDemand: 50, confidence: 0.88, model: 'prophet' },
      { productId: products[9].id, period: '2025-04', predictedDemand: 6, confidence: 0.65, model: 'prophet' },
      { productId: products[9].id, period: '2025-05', predictedDemand: 8, confidence: 0.60, model: 'prophet' },
      { productId: products[19].id, period: '2025-04', predictedDemand: 5, confidence: 0.70, model: 'prophet' },
      { productId: products[22].id, period: '2025-04', predictedDemand: 18, confidence: 0.82, model: 'prophet' },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log(`  - 1 User`)
  console.log(`  - ${categories.length} Categories`)
  console.log(`  - ${products.length} Products`)
  console.log(`  - ${warehouses.length} Warehouses`)
  console.log(`  - ${inventoryItems.length} Inventory Items`)
  console.log(`  - ${suppliers.length} Suppliers`)
  console.log(`  - ${pos.length} Purchase Orders`)
  console.log(`  - ${shipments.length} Shipments`)
  console.log(`  - ${workOrders.length} Work Orders`)
  console.log(`  - ${customers.length} Customers`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
