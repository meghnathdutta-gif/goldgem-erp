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
    const admin = await db.user.create({ data: { email: 'admin@erppro.com', name: 'Admin User', password: 'hashed_admin', role: 'admin' } })
    const manager = await db.user.create({ data: { email: 'manager@erppro.com', name: 'Rahul Sharma', password: 'hashed_mgr', role: 'manager' } })
    const cashier = await db.user.create({ data: { email: 'cashier@erppro.com', name: 'Priya Patel', password: 'hashed_cash', role: 'cashier' } })
    const staff1 = await db.user.create({ data: { email: 'staff1@erppro.com', name: 'Amit Kumar', password: 'hashed_s1', role: 'staff' } })
    const staff2 = await db.user.create({ data: { email: 'staff2@erppro.com', name: 'Neha Singh', password: 'hashed_s2', role: 'staff' } })

    // Create Categories
    const electronics = await db.category.create({ data: { name: 'Electronics', description: 'Electronic devices and components', icon: 'Monitor', color: '#10b981' } })
    const clothing = await db.category.create({ data: { name: 'Clothing', description: 'Apparel and fashion items', icon: 'Shirt', color: '#8b5cf6' } })
    const food = await db.category.create({ data: { name: 'Food & Beverages', description: 'Consumable food and drink items', icon: 'Coffee', color: '#f59e0b' } })
    const furniture = await db.category.create({ data: { name: 'Furniture', description: 'Office and home furniture', icon: 'Armchair', color: '#ef4444' } })
    const rawMaterials = await db.category.create({ data: { name: 'Raw Materials', description: 'Raw materials for manufacturing', icon: 'Box', color: '#6366f1' } })

    // Create Products
    const productsData = [
      // Electronics
      { name: 'Laptop Pro 15', sku: 'ELEC-LP-001', price: 54999, costPrice: 38000, categoryId: electronics.id, minStockLevel: 20, isManufactured: true, unit: 'piece' },
      { name: 'Wireless Mouse', sku: 'ELEC-WM-002', price: 899, costPrice: 450, categoryId: electronics.id, minStockLevel: 50, unit: 'piece' },
      { name: 'USB-C Hub', sku: 'ELEC-UCH-003', price: 2499, costPrice: 1200, categoryId: electronics.id, minStockLevel: 30, unit: 'piece' },
      { name: 'Mechanical Keyboard', sku: 'ELEC-MK-004', price: 3499, costPrice: 1800, categoryId: electronics.id, minStockLevel: 25, unit: 'piece' },
      { name: 'Monitor 27"', sku: 'ELEC-MON-005', price: 18999, costPrice: 12000, categoryId: electronics.id, minStockLevel: 15, isManufactured: true, unit: 'piece' },
      { name: 'Webcam HD', sku: 'ELEC-WC-006', price: 2999, costPrice: 1500, categoryId: electronics.id, minStockLevel: 20, unit: 'piece' },
      { name: 'RAM 8GB DDR4', sku: 'ELEC-RAM-007', price: 1999, costPrice: 900, categoryId: electronics.id, minStockLevel: 100, unit: 'piece' },
      { name: 'SSD 256GB', sku: 'ELEC-SSD-008', price: 2999, costPrice: 1400, categoryId: electronics.id, minStockLevel: 80, unit: 'piece' },
      { name: 'LCD Panel 15"', sku: 'ELEC-LCD-009', price: 4500, costPrice: 2500, categoryId: electronics.id, minStockLevel: 40, unit: 'piece' },
      { name: 'Power Supply Unit', sku: 'ELEC-PSU-010', price: 3500, costPrice: 1800, categoryId: electronics.id, minStockLevel: 30, unit: 'piece' },
      // Clothing
      { name: 'Cotton T-Shirt', sku: 'CLTH-CT-001', price: 599, costPrice: 250, categoryId: clothing.id, minStockLevel: 100, unit: 'piece' },
      { name: 'Denim Jeans', sku: 'CLTH-DJ-002', price: 1499, costPrice: 700, categoryId: clothing.id, minStockLevel: 60, unit: 'piece' },
      { name: 'Formal Shirt', sku: 'CLTH-FS-003', price: 1299, costPrice: 550, categoryId: clothing.id, minStockLevel: 50, unit: 'piece' },
      { name: 'Sports Jacket', sku: 'CLTH-SJ-004', price: 2499, costPrice: 1100, categoryId: clothing.id, minStockLevel: 30, unit: 'piece' },
      { name: 'Wool Sweater', sku: 'CLTH-WS-005', price: 1899, costPrice: 800, categoryId: clothing.id, minStockLevel: 40, unit: 'piece' },
      // Food & Beverages
      { name: 'Organic Coffee 500g', sku: 'FOOD-OC-001', price: 499, costPrice: 280, categoryId: food.id, minStockLevel: 200, unit: 'piece' },
      { name: 'Green Tea Pack', sku: 'FOOD-GT-002', price: 299, costPrice: 150, categoryId: food.id, minStockLevel: 150, unit: 'piece' },
      { name: 'Protein Bar (12pk)', sku: 'FOOD-PB-003', price: 899, costPrice: 500, categoryId: food.id, minStockLevel: 80, unit: 'piece' },
      { name: 'Almond Butter 350g', sku: 'FOOD-AB-004', price: 699, costPrice: 380, categoryId: food.id, minStockLevel: 60, unit: 'piece' },
      { name: 'Mineral Water 1L (12pk)', sku: 'FOOD-MW-005', price: 399, costPrice: 180, categoryId: food.id, minStockLevel: 300, unit: 'piece' },
      // Furniture
      { name: 'Ergonomic Chair', sku: 'FURN-EC-001', price: 12999, costPrice: 7000, categoryId: furniture.id, minStockLevel: 10, isManufactured: true, unit: 'piece' },
      { name: 'Standing Desk', sku: 'FURN-SD-002', price: 18999, costPrice: 10000, categoryId: furniture.id, minStockLevel: 8, isManufactured: true, unit: 'piece' },
      { name: 'Bookshelf Oak', sku: 'FURN-BO-003', price: 8999, costPrice: 4500, categoryId: furniture.id, minStockLevel: 12, unit: 'piece' },
      { name: 'Filing Cabinet', sku: 'FURN-FC-004', price: 4999, costPrice: 2500, categoryId: furniture.id, minStockLevel: 15, unit: 'piece' },
      // Raw Materials
      { name: 'Steel Rod 2m', sku: 'RAW-SR-001', price: 450, costPrice: 280, categoryId: rawMaterials.id, minStockLevel: 500, unit: 'piece' },
      { name: 'Plywood Sheet 4x8', sku: 'RAW-PS-002', price: 1200, costPrice: 700, categoryId: rawMaterials.id, minStockLevel: 200, unit: 'piece' },
      { name: 'Copper Wire 100m', sku: 'RAW-CW-003', price: 2500, costPrice: 1500, categoryId: rawMaterials.id, minStockLevel: 100, unit: 'piece' },
      { name: 'Plastic Granules 1kg', sku: 'RAW-PG-004', price: 120, costPrice: 65, categoryId: rawMaterials.id, minStockLevel: 1000, unit: 'kg' },
      { name: 'Fabric Roll 10m', sku: 'RAW-FR-005', price: 800, costPrice: 420, categoryId: rawMaterials.id, minStockLevel: 150, unit: 'piece' },
    ]
    const products = []
    for (const p of productsData) {
      products.push(await db.product.create({ data: p }))
    }

    // Create Warehouses
    const wh1 = await db.warehouse.create({ data: { name: 'Main Warehouse', code: 'WH-MAIN', address: 'Industrial Area, Sector 12', city: 'Noida', manager: 'Amit Kumar', capacity: 5000 } })
    const wh2 = await db.warehouse.create({ data: { name: 'East Depot', code: 'WH-EAST', address: 'Guru Nagar, Road 5', city: 'Delhi', manager: 'Neha Singh', capacity: 3000 } })
    const wh3 = await db.warehouse.create({ data: { name: 'West Depot', code: 'WH-WEST', address: 'MIDC, Plot 45', city: 'Gurgaon', manager: 'Priya Patel', capacity: 2000 } })

    // Create Inventory Items
    for (const product of products) {
      const stockLevels = [Math.floor(Math.random() * 200) + 5, Math.floor(Math.random() * 100) + 2, Math.floor(Math.random() * 50)]
      const warehouses = [wh1, wh2, wh3]
      for (let i = 0; i < 3; i++) {
        await db.inventoryItem.create({
          data: {
            productId: product.id,
            warehouseId: warehouses[i].id,
            quantity: stockLevels[i],
            reservedQty: Math.floor(stockLevels[i] * 0.1),
            reorderPoint: product.minStockLevel,
            reorderQty: product.minStockLevel * 5,
          }
        })
      }
    }

    // Create Suppliers
    const suppliers = []
    const suppliersData = [
      { name: 'TechVista Components', code: 'SUP-TV', email: 'sales@techvista.com', phone: '+91-9876543210', city: 'Bangalore', country: 'India', rating: 4.5, leadTimeDays: 5, paymentTerms: 'Net 30' },
      { name: 'ShreeRam Industries', code: 'SUP-SR', email: 'info@shreeram.com', phone: '+91-9812345678', city: 'Mumbai', country: 'India', rating: 4.0, leadTimeDays: 7, paymentTerms: 'Net 45' },
      { name: 'Global Parts Ltd', code: 'SUP-GP', email: 'orders@globalparts.com', phone: '+91-9898765432', city: 'Chennai', country: 'India', rating: 3.8, leadTimeDays: 10, paymentTerms: 'Net 30' },
      { name: 'FabriCare Materials', code: 'SUP-FC', email: 'supply@fabricare.com', phone: '+91-9765432109', city: 'Surat', country: 'India', rating: 4.2, leadTimeDays: 4, paymentTerms: 'Net 15' },
      { name: 'WoodCraft Supplies', code: 'SUP-WC', email: 'hello@woodcraft.com', phone: '+91-9654321098', city: 'Jaipur', country: 'India', rating: 3.5, leadTimeDays: 12, paymentTerms: 'Net 60' },
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
        const qty = Math.floor(Math.random() * 100) + 10
        items.push({ productId: product.id, quantity: qty, unitPrice: product.costPrice, totalPrice: product.costPrice * qty, receivedQty: Math.floor(qty * Math.random()) })
      }
      const totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0)
      const po = await db.purchaseOrder.create({
        data: {
          poNumber: `PO-2026-${String(i + 1).padStart(4, '0')}`,
          supplierId: supplier.id,
          status: poStatuses[i % poStatuses.length],
          orderDate: new Date(2026, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1),
          expectedDate: new Date(2026, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 28) + 1),
          totalAmount,
          taxAmount: totalAmount * 0.18,
          items: { create: items }
        }
      })
    }

    // Create BOMs
    const laptopProduct = products[0] // Laptop Pro 15
    const monitorProduct = products[4] // Monitor 27"
    const chairProduct = products[20] // Ergonomic Chair
    const deskProduct = products[21] // Standing Desk
    const bomRelations = [
      { productId: laptopProduct.id, componentId: products[6].id, quantity: 2 },  // RAM
      { productId: laptopProduct.id, componentId: products[7].id, quantity: 1 },  // SSD
      { productId: laptopProduct.id, componentId: products[8].id, quantity: 1 },  // LCD Panel
      { productId: laptopProduct.id, componentId: products[9].id, quantity: 1 },  // PSU
      { productId: monitorProduct.id, componentId: products[8].id, quantity: 1 }, // LCD Panel
      { productId: monitorProduct.id, componentId: products[9].id, quantity: 1 }, // PSU
      { productId: chairProduct.id, componentId: products[24].id, quantity: 4 },  // Steel Rod
      { productId: chairProduct.id, componentId: products[26].id, quantity: 2 },  // Copper Wire
      { productId: chairProduct.id, componentId: products[27].id, quantity: 5 },  // Plastic Granules
      { productId: deskProduct.id, componentId: products[24].id, quantity: 6 },   // Steel Rod
      { productId: deskProduct.id, componentId: products[25].id, quantity: 2 },   // Plywood Sheet
      { productId: deskProduct.id, componentId: products[27].id, quantity: 3 },   // Plastic Granules
    ]
    for (const bom of bomRelations) {
      await db.bomComponent.create({ data: bom })
    }

    // Create Work Orders
    const woStatuses = ['planned', 'in_progress', 'completed', 'cancelled']
    const woPriorities = ['low', 'medium', 'high', 'urgent']
    const woProducts = [laptopProduct, monitorProduct, chairProduct, deskProduct]
    for (let i = 0; i < 12; i++) {
      const product = woProducts[i % woProducts.length]
      const targetQty = Math.floor(Math.random() * 50) + 10
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
              wastageQty: Math.floor(targetQty * 0.02 * Math.random()),
            }
          }
        }
      })
    }

    // Create Customers
    const customers = []
    const customerNames = ['Rajesh Enterprises', 'Mehta & Sons', 'Patel Traders', 'Singh Communications', 'Kumar Electronics', 'Verma Industries', 'Gupta Retail', 'Sharma Stores', 'Jain Distributors', 'Agarwal Wholesale', 'Deepak Mobiles', 'Ravi Textiles', 'Suresh Pharma', 'Mahesh Furniture', 'Vikram Auto', 'Anita Boutique', 'Pooja Cosmetics', 'Sunil Sports', 'Kavita Gifts', 'Manoj Books']
    for (let i = 0; i < customerNames.length; i++) {
      const type = i < 5 ? 'wholesale' : i < 10 ? 'retail' : 'online'
      customers.push(await db.customer.create({
        data: {
          name: customerNames[i],
          email: `${customerNames[i].toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
          phone: `+91-${9700000000 + i * 111111}`,
          city: ['Noida', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai'][i % 5],
          type,
        }
      }))
    }

    // Create Sales Orders
    const soStatuses = ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    for (let i = 0; i < 18; i++) {
      const customer = customers[i % customers.length]
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const qty = Math.floor(Math.random() * 20) + 1
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
          taxAmount: totalAmount * 0.18,
          discount: Math.random() > 0.7 ? totalAmount * 0.05 : 0,
          items: { create: items }
        }
      })
    }

    // Create POS Transactions
    for (let i = 0; i < 60; i++) {
      const numItems = Math.floor(Math.random() * 4) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * 15)] // mostly retail products
        const qty = Math.floor(Math.random() * 5) + 1
        items.push({ productId: product.id, productName: product.name, quantity: qty, unitPrice: product.price, totalPrice: product.price * qty })
      }
      const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0)
      await db.posTransaction.create({
        data: {
          transactionNumber: `TRX-2026-${String(i + 1).padStart(5, '0')}`,
          userId: [cashier.id, staff1.id, staff2.id][i % 3],
          customerName: Math.random() > 0.5 ? customerNames[Math.floor(Math.random() * customerNames.length)] : null,
          subtotal,
          taxAmount: subtotal * 0.05,
          discount: Math.random() > 0.8 ? subtotal * 0.1 : 0,
          totalAmount: subtotal + subtotal * 0.05 - (Math.random() > 0.8 ? subtotal * 0.1 : 0),
          paymentMethod: ['cash', 'card', 'upi'][i % 3],
          status: i % 20 === 0 ? 'refunded' : 'completed',
          createdAt: new Date(2026, 3, Math.floor(Math.random() * 22) + 1, Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60)),
          items: { create: items }
        }
      })
    }

    // Create E-commerce Orders
    for (let i = 0; i < 15; i++) {
      const customer = customers[(i + 10) % customers.length]
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * 20)]
        const qty = Math.floor(Math.random() * 3) + 1
        items.push({ productId: product.id, productName: product.name, quantity: qty, unitPrice: product.price, totalPrice: product.price * qty })
      }
      const totalAmount = items.reduce((sum, it) => sum + it.totalPrice, 0)
      await db.ecommerceOrder.create({
        data: {
          orderNumber: `ORD-2026-${String(i + 1).padStart(5, '0')}`,
          customerId: customer.id,
          status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'][i % 6],
          orderDate: new Date(2026, 3, Math.floor(Math.random() * 22) + 1),
          shippingAddress: `${customer.city}, India`,
          billingAddress: `${customer.city}, India`,
          totalAmount,
          taxAmount: totalAmount * 0.18,
          shippingCost: totalAmount > 5000 ? 0 : 99,
          paymentMethod: ['online', 'cod', 'upi'][i % 3],
          paymentStatus: i % 5 === 0 ? 'pending' : 'paid',
          items: { create: items }
        }
      })
    }

    // Create Shipments
    for (let i = 0; i < 10; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        items.push({ productId: product.id, quantity: Math.floor(Math.random() * 50) + 5 })
      }
      await db.shipment.create({
        data: {
          shipmentNumber: `SHP-2026-${String(i + 1).padStart(4, '0')}`,
          status: ['pending', 'shipped', 'in_transit', 'delivered', 'cancelled'][i % 5],
          carrier: ['BlueDart', 'Delhivery', 'DTDC', 'India Post', 'FedEx'][i % 5],
          trackingNumber: `TRK${Date.now()}${i}`,
          shippingDate: new Date(2026, 3, Math.floor(Math.random() * 20) + 1),
          deliveryDate: i % 5 === 3 ? new Date(2026, 3, Math.floor(Math.random() * 10) + 20) : null,
          origin: ['Mumbai', 'Delhi', 'Bangalore'][i % 3],
          destination: ['Noida', 'Chennai', 'Pune'][i % 3],
          cost: Math.floor(Math.random() * 5000) + 500,
          items: { create: items }
        }
      })
    }

    // Create Demand Forecasts
    for (const product of products.slice(0, 15)) {
      for (let m = 0; m < 3; m++) {
        const baseDemand = Math.floor(Math.random() * 200) + 20
        await db.demandForecast.create({
          data: {
            productId: product.id,
            period: `2026-${String(m + 5).padStart(2, '0')}`,
            predictedDemand: baseDemand + Math.floor(Math.random() * 50),
            confidence: 0.6 + Math.random() * 0.35,
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
            quantity: Math.floor(Math.random() * 50) + 1,
            reference: i % 5 === 0 ? `PO-2026-${String(i + 1).padStart(4, '0')}` : i % 5 === 1 ? `SO-2026-${String(i + 1).padStart(4, '0')}` : null,
            notes: ['Stock received', 'Order fulfilled', 'Warehouse transfer', 'Stock adjustment', 'Customer return'][i % 5],
            performedBy: [admin.name, manager.name, staff1.name][i % 3],
          }
        })
      }
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully with comprehensive demo data' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
