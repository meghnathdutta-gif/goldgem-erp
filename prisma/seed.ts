import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ──────────────────────────────────────────────
  // Clean all tables in reverse dependency order
  // ──────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.demandForecast.deleteMany();
  await prisma.ecommerceOrder.deleteMany();
  await prisma.posTransaction.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.workOrderProduct.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.bomComponent.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ All tables cleaned.');

  // ──────────────────────────────────────────────
  // 1. Users
  // ──────────────────────────────────────────────
  const userVikram = await prisma.user.create({
    data: {
      email: 'vikram@goldgem.com',
      name: 'Vikram Sharma',
      password: '$2a$10$dummyhashedpwd001admin VikramSharma',
      role: 'admin',
    },
  });

  const userMeena = await prisma.user.create({
    data: {
      email: 'meena@goldgem.com',
      name: 'Meena Patel',
      password: '$2a$10$dummyhashedpwd002manager MeenaPatel',
      role: 'manager',
    },
  });

  const userRaj = await prisma.user.create({
    data: {
      email: 'raj@goldgem.com',
      name: 'Raj Verma',
      password: '$2a$10$dummyhashedpwd003cashier RajVerma',
      role: 'cashier',
    },
  });

  console.log('✅ 3 Users created.');

  // ──────────────────────────────────────────────
  // 2. Categories
  // ──────────────────────────────────────────────
  const catGoldNecklaces = await prisma.category.create({
    data: { name: 'Gold Necklaces', icon: 'Necklace', color: '#D4A017' },
  });
  const catDiamondRings = await prisma.category.create({
    data: { name: 'Diamond Rings', icon: 'Gem', color: '#B9F2FF' },
  });
  const catSilverEarrings = await prisma.category.create({
    data: { name: 'Silver Earrings', icon: 'Ear', color: '#C0C0C0' },
  });
  const catPlatinumBracelets = await prisma.category.create({
    data: { name: 'Platinum Bracelets', icon: 'CircleDot', color: '#E5E4E2' },
  });
  const catPearlSets = await prisma.category.create({
    data: { name: 'Pearl Sets', icon: 'Sparkles', color: '#FDEEF4' },
  });
  const catTempleJewellery = await prisma.category.create({
    data: { name: 'Temple Jewellery', icon: 'Crown', color: '#B8860B' },
  });
  const catKundanSets = await prisma.category.create({
    data: { name: 'Kundan Sets', icon: 'Star', color: '#8B0000' },
  });
  const catBridalSets = await prisma.category.create({
    data: { name: 'Bridal Sets', icon: 'Heart', color: '#C71585' },
  });

  const categories = [
    catGoldNecklaces,
    catDiamondRings,
    catSilverEarrings,
    catPlatinumBracelets,
    catPearlSets,
    catTempleJewellery,
    catKundanSets,
    catBridalSets,
  ];

  console.log('✅ 8 Categories created.');

  // ──────────────────────────────────────────────
  // 3. Products (24)
  // ──────────────────────────────────────────────

  // --- Gold Necklaces ---
  const pGld001 = await prisma.product.create({
    data: {
      name: 'Lakshmi Temple Gold Necklace',
      sku: 'GLD-001',
      description: 'Exquisite 22K gold necklace featuring Goddess Lakshmi motif with intricate temple work and ruby accents. Handcrafted by master karigars.',
      categoryId: catGoldNecklaces.id,
      price: 285000,
      costPrice: 228000,
      weight: 42.5,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 3,
    },
  });

  const pGld002 = await prisma.product.create({
    data: {
      name: 'Mango Motif Haram',
      sku: 'GLD-002',
      description: 'Traditional mango motif haram in 22K gold with meenakari work. A timeless South Indian design perfect for festive occasions.',
      categoryId: catGoldNecklaces.id,
      price: 350000,
      costPrice: 280000,
      weight: 58.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 2,
    },
  });

  const pGld003 = await prisma.product.create({
    data: {
      name: 'Simple Gold Chain',
      sku: 'GLD-003',
      description: 'Classic 22K gold chain with box link pattern. Versatile everyday wear piece, also used as a base component in necklace crafting.',
      categoryId: catGoldNecklaces.id,
      price: 45000,
      costPrice: 36000,
      weight: 12.0,
      purity: '22K',
      isManufactured: false,
      minStockLevel: 15,
    },
  });

  // --- Diamond Rings ---
  const pDmd001 = await prisma.product.create({
    data: {
      name: 'Solitaire Diamond Ring',
      sku: 'DMD-001',
      description: 'Stunning 1.2 carat solitaire diamond set in 18K white gold with six-prong setting. IGI certified, VS1 clarity, F colour.',
      categoryId: catDiamondRings.id,
      price: 245000,
      costPrice: 196000,
      weight: 5.8,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 4,
    },
  });

  const pDmd002 = await prisma.product.create({
    data: {
      name: 'Cluster Diamond Ring',
      sku: 'DMD-002',
      description: 'Elegant cluster ring with 0.65 carat total weight diamonds set in 18K yellow gold. Halo design with pave-set accent diamonds.',
      categoryId: catDiamondRings.id,
      price: 185000,
      costPrice: 148000,
      weight: 4.2,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 5,
    },
  });

  const pDmd003 = await prisma.product.create({
    data: {
      name: 'Diamond Eternity Band',
      sku: 'DMD-003',
      description: 'Full eternity band with 0.40 carat round brilliant diamonds channel-set in 14K white gold. Perfect as a wedding band.',
      categoryId: catDiamondRings.id,
      price: 95000,
      costPrice: 76000,
      weight: 3.5,
      purity: '14K',
      isManufactured: false,
      minStockLevel: 8,
    },
  });

  // --- Silver Earrings ---
  const pSlv001 = await prisma.product.create({
    data: {
      name: 'Filigree Jhumka',
      sku: 'SLV-001',
      description: 'Handcrafted 92.5 sterling silver jhumka with intricate filigree work. Lightweight and elegant, perfect for daily and occasion wear.',
      categoryId: catSilverEarrings.id,
      price: 28000,
      costPrice: 19600,
      weight: 14.0,
      purity: '92.5',
      isManufactured: true,
      minStockLevel: 10,
    },
  });

  const pSlv002 = await prisma.product.create({
    data: {
      name: 'Chandbali Earrings',
      sku: 'SLV-002',
      description: 'Ornate chandbali earrings in oxidised sterling silver with pearl drops. Mughal-inspired crescent design with delicate ghungroo detailing.',
      categoryId: catSilverEarrings.id,
      price: 35000,
      costPrice: 24500,
      weight: 18.0,
      purity: '92.5',
      isManufactured: true,
      minStockLevel: 8,
    },
  });

  const pSlv003 = await prisma.product.create({
    data: {
      name: 'Silver Studs',
      sku: 'SLV-003',
      description: 'Classic 92.5 sterling silver stud earrings with push-back closure. Simple polished finish, ideal as base component for jhumka crafting.',
      categoryId: catSilverEarrings.id,
      price: 15000,
      costPrice: 10500,
      weight: 4.0,
      purity: '92.5',
      isManufactured: false,
      minStockLevel: 25,
    },
  });

  // --- Platinum Bracelets ---
  const pPlt001 = await prisma.product.create({
    data: {
      name: 'Platinum Love Band',
      sku: 'PLT-001',
      description: 'Sleek platinum love band with brushed matte finish. 95% pure platinum, comfort-fit design. Ideal for couples.',
      categoryId: catPlatinumBracelets.id,
      price: 125000,
      costPrice: 106250,
      weight: 8.0,
      purity: '95%',
      isManufactured: false,
      minStockLevel: 6,
    },
  });

  const pPlt002 = await prisma.product.create({
    data: {
      name: 'Diamond Cut Platinum Bangle',
      sku: 'PLT-002',
      description: 'Premium diamond-cut platinum bangle with alternating polished and frosted facets. 95% pure platinum with secure clasp mechanism.',
      categoryId: catPlatinumBracelets.id,
      price: 210000,
      costPrice: 178500,
      weight: 16.0,
      purity: '95%',
      isManufactured: true,
      minStockLevel: 3,
    },
  });

  const pPlt003 = await prisma.product.create({
    data: {
      name: 'Platinum Chain Bracelet',
      sku: 'PLT-003',
      description: 'Delicate platinum chain bracelet with lobster clasp. 95% pure platinum with cable link pattern. Serves as a base for charm additions.',
      categoryId: catPlatinumBracelets.id,
      price: 85000,
      costPrice: 72250,
      weight: 6.5,
      purity: '95%',
      isManufactured: false,
      minStockLevel: 8,
    },
  });

  // --- Pearl Sets ---
  const pPrl001 = await prisma.product.create({
    data: {
      name: 'South Sea Pearl Necklace Set',
      sku: 'PRL-001',
      description: 'Luxurious South Sea pearl necklace with matching earrings. 10-12mm AAA grade pearls with 18K gold clasp and diamond accent.',
      categoryId: catPearlSets.id,
      price: 165000,
      costPrice: 132000,
      weight: 28.0,
      purity: '18K',
      isManufactured: false,
      minStockLevel: 4,
    },
  });

  const pPrl002 = await prisma.product.create({
    data: {
      name: 'Pearl Drop Earring & Pendant Set',
      sku: 'PRL-002',
      description: 'Elegant freshwater pearl drop earrings with matching pendant on 18K gold chain. Perfect for formal occasions and gifting.',
      categoryId: catPearlSets.id,
      price: 55000,
      costPrice: 44000,
      weight: 10.0,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 10,
    },
  });

  const pPrl003 = await prisma.product.create({
    data: {
      name: 'Freshwater Pearl String',
      sku: 'PRL-003',
      description: 'Single strand of 7-8mm AA grade freshwater pearls with 14K gold clasp. Versatile base piece for layering or standalone wear.',
      categoryId: catPearlSets.id,
      price: 35000,
      costPrice: 28000,
      weight: 15.0,
      purity: '14K',
      isManufactured: false,
      minStockLevel: 12,
    },
  });

  // --- Temple Jewellery ---
  const pTmp001 = await prisma.product.create({
    data: {
      name: 'Naga Temple Choker',
      sku: 'TMP-001',
      description: 'Majestic Naga (serpent god) motif choker in 22K gold with ruby and emerald cabochons. Inspired by ancient Chola dynasty temple ornaments.',
      categoryId: catTempleJewellery.id,
      price: 295000,
      costPrice: 236000,
      weight: 48.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 2,
    },
  });

  const pTmp002 = await prisma.product.create({
    data: {
      name: 'Goddess Lakshmi Oddiyanam',
      sku: 'TMP-002',
      description: 'Traditional waist belt (oddiyanam) featuring Goddess Lakshmi centrepiece in 22K gold with navaratna stones. A bridal must-have.',
      categoryId: catTempleJewellery.id,
      price: 325000,
      costPrice: 260000,
      weight: 65.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 2,
    },
  });

  const pTmp003 = await prisma.product.create({
    data: {
      name: 'Temple Jhumki',
      sku: 'TMP-003',
      description: 'Traditional temple-style jhumki earrings in 22K gold with Lakshmi coin motif and pearl jhalars. Lightweight for extended wear.',
      categoryId: catTempleJewellery.id,
      price: 75000,
      costPrice: 60000,
      weight: 12.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 8,
    },
  });

  // --- Kundan Sets ---
  const pKnd001 = await prisma.product.create({
    data: {
      name: 'Royal Kundan Bridal Set',
      sku: 'KND-001',
      description: 'Magnificent kundan bridal set with necklace, earrings, and maang tikka. Uncut polki diamonds set in 22K gold with meenakari reverse.',
      categoryId: catKundanSets.id,
      price: 345000,
      costPrice: 276000,
      weight: 72.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 2,
    },
  });

  const pKnd002 = await prisma.product.create({
    data: {
      name: 'Kundan Choker Necklace',
      sku: 'KND-002',
      description: 'Contemporary kundan choker with uncut diamond setting and enamel reverse. 22K gold base with pearl stringing along the edges.',
      categoryId: catKundanSets.id,
      price: 195000,
      costPrice: 156000,
      weight: 32.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 4,
    },
  });

  const pKnd003 = await prisma.product.create({
    data: {
      name: 'Kundan Maang Tikka',
      sku: 'KND-003',
      description: 'Elegant kundan maang tikka with central uncut diamond and pearl drops. 22K gold setting with delicate chain for comfortable wear.',
      categoryId: catKundanSets.id,
      price: 42000,
      costPrice: 33600,
      weight: 8.0,
      purity: '22K',
      isManufactured: false,
      minStockLevel: 12,
    },
  });

  // --- Bridal Sets ---
  const pBrd001 = await prisma.product.create({
    data: {
      name: 'Traditional South Indian Bridal Set',
      sku: 'BRD-001',
      description: 'Complete South Indian bridal set comprising long haram, choker, jhumki, oddiyanam, and vanki. 22K gold with temple motifs.',
      categoryId: catBridalSets.id,
      price: 335000,
      costPrice: 268000,
      weight: 120.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 1,
    },
  });

  const pBrd002 = await prisma.product.create({
    data: {
      name: 'North Indian Bridal Necklace Set',
      sku: 'BRD-002',
      description: 'Grand North Indian bridal set with rani haar, choker, and chandelier earrings. Kundan and polki work in 22K gold.',
      categoryId: catBridalSets.id,
      price: 275000,
      costPrice: 220000,
      weight: 95.0,
      purity: '22K',
      isManufactured: true,
      minStockLevel: 1,
    },
  });

  const pBrd003 = await prisma.product.create({
    data: {
      name: 'Contemporary Bridal Set',
      sku: 'BRD-003',
      description: 'Modern minimalist bridal set with geometric necklace and matching studs. 18K white gold with diamond accents for the new-age bride.',
      categoryId: catBridalSets.id,
      price: 155000,
      costPrice: 124000,
      weight: 35.0,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 3,
    },
  });

  const products = [
    pGld001, pGld002, pGld003,
    pDmd001, pDmd002, pDmd003,
    pSlv001, pSlv002, pSlv003,
    pPlt001, pPlt002, pPlt003,
    pPrl001, pPrl002, pPrl003,
    pTmp001, pTmp002, pTmp003,
    pKnd001, pKnd002, pKnd003,
    pBrd001, pBrd002, pBrd003,
  ];

  console.log('✅ 24 Products created.');

  // ──────────────────────────────────────────────
  // 4. Warehouses
  // ──────────────────────────────────────────────
  const whMainVault = await prisma.warehouse.create({
    data: {
      name: 'Main Vault',
      code: 'MUM-VLT',
      city: 'Mumbai',
      capacity: 5000,
    },
  });

  const whKarigarkhana = await prisma.warehouse.create({
    data: {
      name: 'Karigarkhana',
      code: 'JAI-KGK',
      city: 'Jaipur',
      capacity: 2000,
    },
  });

  const whDistHub = await prisma.warehouse.create({
    data: {
      name: 'Distribution Hub',
      code: 'DEL-DST',
      city: 'Delhi',
      capacity: 3000,
    },
  });

  const warehouses = [whMainVault, whKarigarkhana, whDistHub];

  console.log('✅ 3 Warehouses created.');

  // ──────────────────────────────────────────────
  // 5. Inventory Items
  // ──────────────────────────────────────────────
  // Distribute products across warehouses. Note: @@unique([productId, warehouseId])

  const inventoryData: Array<{
    productId: string;
    warehouseId: string;
    quantity: number;
    reservedQty: number;
    reorderPoint: number;
  }> = [
    // Main Vault - high-value finished goods
    { productId: pGld001.id, warehouseId: whMainVault.id, quantity: 5, reservedQty: 1, reorderPoint: 3 },
    { productId: pGld002.id, warehouseId: whMainVault.id, quantity: 3, reservedQty: 0, reorderPoint: 2 },
    { productId: pGld003.id, warehouseId: whMainVault.id, quantity: 20, reservedQty: 3, reorderPoint: 10 },
    { productId: pDmd001.id, warehouseId: whMainVault.id, quantity: 4, reservedQty: 1, reorderPoint: 3 },
    { productId: pDmd002.id, warehouseId: whMainVault.id, quantity: 6, reservedQty: 2, reorderPoint: 4 },
    { productId: pDmd003.id, warehouseId: whMainVault.id, quantity: 10, reservedQty: 1, reorderPoint: 6 },
    { productId: pPrl001.id, warehouseId: whMainVault.id, quantity: 3, reservedQty: 0, reorderPoint: 3 },
    { productId: pKnd001.id, warehouseId: whMainVault.id, quantity: 2, reservedQty: 0, reorderPoint: 2 },
    { productId: pBrd001.id, warehouseId: whMainVault.id, quantity: 1, reservedQty: 0, reorderPoint: 1 },
    { productId: pBrd002.id, warehouseId: whMainVault.id, quantity: 1, reservedQty: 0, reorderPoint: 1 },

    // Karigarkhana - raw materials and WIP
    { productId: pGld003.id, warehouseId: whKarigarkhana.id, quantity: 35, reservedQty: 5, reorderPoint: 15 },
    { productId: pSlv003.id, warehouseId: whKarigarkhana.id, quantity: 40, reservedQty: 8, reorderPoint: 20 },
    { productId: pSlv001.id, warehouseId: whKarigarkhana.id, quantity: 12, reservedQty: 2, reorderPoint: 8 },
    { productId: pSlv002.id, warehouseId: whKarigarkhana.id, quantity: 8, reservedQty: 1, reorderPoint: 6 },
    { productId: pTmp001.id, warehouseId: whKarigarkhana.id, quantity: 3, reservedQty: 1, reorderPoint: 2 },
    { productId: pTmp002.id, warehouseId: whKarigarkhana.id, quantity: 2, reservedQty: 0, reorderPoint: 2 },
    { productId: pTmp003.id, warehouseId: whKarigarkhana.id, quantity: 10, reservedQty: 2, reorderPoint: 6 },
    { productId: pPrl003.id, warehouseId: whKarigarkhana.id, quantity: 18, reservedQty: 3, reorderPoint: 10 },

    // Distribution Hub - finished goods for retail/online
    { productId: pPlt001.id, warehouseId: whDistHub.id, quantity: 8, reservedQty: 1, reorderPoint: 5 },
    { productId: pPlt002.id, warehouseId: whDistHub.id, quantity: 4, reservedQty: 0, reorderPoint: 3 },
    { productId: pPlt003.id, warehouseId: whDistHub.id, quantity: 10, reservedQty: 2, reorderPoint: 6 },
    { productId: pPrl002.id, warehouseId: whDistHub.id, quantity: 12, reservedQty: 3, reorderPoint: 8 },
    { productId: pKnd002.id, warehouseId: whDistHub.id, quantity: 5, reservedQty: 1, reorderPoint: 3 },
    { productId: pKnd003.id, warehouseId: whDistHub.id, quantity: 15, reservedQty: 2, reorderPoint: 10 },
    { productId: pBrd003.id, warehouseId: whDistHub.id, quantity: 4, reservedQty: 1, reorderPoint: 3 },
    { productId: pPrl001.id, warehouseId: whDistHub.id, quantity: 2, reservedQty: 0, reorderPoint: 2 },
  ];

  const inventoryItems: Array<{ id: string }> = [];
  for (const inv of inventoryData) {
    const item = await prisma.inventoryItem.create({ data: inv });
    inventoryItems.push(item);
  }

  console.log(`✅ ${inventoryData.length} Inventory Items created.`);

  // ──────────────────────────────────────────────
  // 6. Inventory Movements
  // ──────────────────────────────────────────────
  const movements = [
    { inventoryItemId: inventoryItems[0].id, type: 'IN', quantity: 10, reference: 'PO-2024-001', notes: 'Initial stock from Bharat Gold' },
    { inventoryItemId: inventoryItems[0].id, type: 'OUT', quantity: 5, reference: 'SO-2024-001', notes: 'Sale to Anita Krishnamurthy' },
    { inventoryItemId: inventoryItems[1].id, type: 'IN', quantity: 5, reference: 'PO-2024-001', notes: 'Initial stock from Bharat Gold' },
    { inventoryItemId: inventoryItems[1].id, type: 'OUT', quantity: 2, reference: 'SO-2024-002', notes: 'Sale to Deepak Nair' },
    { inventoryItemId: inventoryItems[10].id, type: 'IN', quantity: 50, reference: 'PO-2024-002', notes: 'Gold chain stock for karigarkhana' },
    { inventoryItemId: inventoryItems[10].id, type: 'OUT', quantity: 15, reference: 'WO-2024-001', notes: 'Issued for necklace manufacturing' },
    { inventoryItemId: inventoryItems[11].id, type: 'IN', quantity: 60, reference: 'PO-2024-003', notes: 'Silver studs for jhumka assembly' },
    { inventoryItemId: inventoryItems[11].id, type: 'OUT', quantity: 20, reference: 'WO-2024-002', notes: 'Issued for jhumka manufacturing' },
    { inventoryItemId: inventoryItems[18].id, type: 'IN', quantity: 12, reference: 'PO-2024-004', notes: 'Platinum stock for distribution' },
    { inventoryItemId: inventoryItems[20].id, type: 'IN', quantity: 15, reference: 'PO-2024-005', notes: 'Platinum chain stock received' },
  ];

  for (const mv of movements) {
    await prisma.inventoryMovement.create({ data: mv });
  }

  console.log(`✅ ${movements.length} Inventory Movements created.`);

  // ──────────────────────────────────────────────
  // 7. Suppliers
  // ──────────────────────────────────────────────
  const supBharat = await prisma.supplier.create({
    data: {
      name: 'Bharat Gold Refinery',
      code: 'BGR-001',
      contactPerson: 'Arun Mehta',
      phone: '+91-261-2345678',
      email: 'arun@bharatgold.co.in',
      address: 'Industrial Estate, Ring Road, Surat, Gujarat 395002',
      rating: 4.8,
      leadTimeDays: 5,
      paymentTerms: 'Net 30',
      isActive: true,
    },
  });

  const supSurat = await prisma.supplier.create({
    data: {
      name: 'Surat Diamond House',
      code: 'SDH-001',
      contactPerson: 'Priya Desai',
      phone: '+91-261-9876543',
      email: 'priya@suratdiamond.in',
      address: 'Diamond Market, Mahidharpura, Surat, Gujarat 395003',
      rating: 4.6,
      leadTimeDays: 10,
      paymentTerms: 'Net 45',
      isActive: true,
    },
  });

  const supSilver = await prisma.supplier.create({
    data: {
      name: 'SilverCraft Industries',
      code: 'SCI-001',
      contactPerson: 'Rakesh Soni',
      phone: '+91-141-4567890',
      email: 'rakesh@silvercraft.co.in',
      address: 'Johari Bazaar, Jaipur, Rajasthan 302003',
      rating: 4.3,
      leadTimeDays: 7,
      paymentTerms: 'Net 15',
      isActive: true,
    },
  });

  const supPearl = await prisma.supplier.create({
    data: {
      name: 'Pearl Bay Traders',
      code: 'PBT-001',
      contactPerson: 'Farhana Sheikh',
      phone: '+91-40-2345678',
      email: 'farhana@pearlbay.com',
      address: 'Pearl Market, Charminar, Hyderabad, Telangana 500002',
      rating: 4.1,
      leadTimeDays: 12,
      paymentTerms: 'Net 30',
      isActive: true,
    },
  });

  const supKundan = await prisma.supplier.create({
    data: {
      name: 'Kundan Heritage Arts',
      code: 'KHA-001',
      contactPerson: 'Manoj Verma',
      phone: '+91-145-3456789',
      email: 'manoj@kundanheritage.in',
      address: 'Hathi Pole, Udaipur, Rajasthan 313001',
      rating: 4.5,
      leadTimeDays: 14,
      paymentTerms: '50% Advance, Net 30',
      isActive: true,
    },
  });

  const suppliers = [supBharat, supSurat, supSilver, supPearl, supKundan];

  console.log('✅ 5 Suppliers created.');

  // ──────────────────────────────────────────────
  // 8. Purchase Orders
  // ──────────────────────────────────────────────
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-001',
      supplierId: supBharat.id,
      status: 'received',
      totalAmount: 1256000,
      taxAmount: 37680,
      notes: 'Q1 gold stock replenishment for Mumbai vault',
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-002',
      supplierId: supBharat.id,
      status: 'confirmed',
      totalAmount: 540000,
      taxAmount: 16200,
      notes: 'Gold chain stock for Jaipur karigarkhana',
    },
  });

  const po3 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-003',
      supplierId: supSilver.id,
      status: 'received',
      totalAmount: 210000,
      taxAmount: 6300,
      notes: 'Silver components for jhumka and chandbali production',
    },
  });

  const po4 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-004',
      supplierId: supSurat.id,
      status: 'sent',
      totalAmount: 890000,
      taxAmount: 26700,
      notes: 'Diamond procurement for ring and bridal set production',
    },
  });

  const po5 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-005',
      supplierId: supPearl.id,
      status: 'confirmed',
      totalAmount: 320000,
      taxAmount: 9600,
      notes: 'South Sea and freshwater pearl stock for Q2',
    },
  });

  const po6 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-006',
      supplierId: supKundan.id,
      status: 'draft',
      totalAmount: 0,
      taxAmount: 0,
      notes: 'Pending kundan component requirement calculation',
    },
  });

  console.log('✅ 6 Purchase Orders created.');

  // ──────────────────────────────────────────────
  // 9. Purchase Order Items
  // ──────────────────────────────────────────────
  const poItems = [
    { purchaseOrderId: po1.id, productId: pGld001.id, quantity: 5, unitPrice: 228000, receivedQty: 5 },
    { purchaseOrderId: po1.id, productId: pGld002.id, quantity: 3, unitPrice: 280000, receivedQty: 3 },
    { purchaseOrderId: po2.id, productId: pGld003.id, quantity: 50, unitPrice: 36000, receivedQty: 0 },
    { purchaseOrderId: po3.id, productId: pSlv003.id, quantity: 60, unitPrice: 10500, receivedQty: 60 },
    { purchaseOrderId: po3.id, productId: pSlv001.id, quantity: 15, unitPrice: 19600, receivedQty: 15 },
    { purchaseOrderId: po4.id, productId: pDmd001.id, quantity: 6, unitPrice: 196000, receivedQty: 0 },
    { purchaseOrderId: po4.id, productId: pDmd003.id, quantity: 10, unitPrice: 76000, receivedQty: 0 },
    { purchaseOrderId: po5.id, productId: pPrl001.id, quantity: 4, unitPrice: 132000, receivedQty: 0 },
    { purchaseOrderId: po5.id, productId: pPrl003.id, quantity: 20, unitPrice: 28000, receivedQty: 0 },
  ];

  for (const item of poItems) {
    await prisma.purchaseOrderItem.create({ data: item });
  }

  console.log(`✅ ${poItems.length} Purchase Order Items created.`);

  // ──────────────────────────────────────────────
  // 10. Customers
  // ──────────────────────────────────────────────
  const custAnita = await prisma.customer.create({
    data: {
      name: 'Anita Krishnamurthy',
      email: 'anita.k@gmail.com',
      phone: '+91-9820034567',
      address: '12, Nepean Sea Road, Mumbai, Maharashtra 400036',
      type: 'retail',
      gstNumber: null,
    },
  });

  const custDeepak = await prisma.customer.create({
    data: {
      name: 'Deepak Nair',
      email: 'deepak.nair@outlook.com',
      phone: '+91-9845123456',
      address: '45, TTK Road, Chennai, Tamil Nadu 600018',
      type: 'retail',
      gstNumber: null,
    },
  });

  const custPriyal = await prisma.customer.create({
    data: {
      name: 'Priyal Agarwal',
      email: 'priyal@srijanjewellers.com',
      phone: '+91-9830012345',
      address: '78, Camac Street, Kolkata, West Bengal 700017',
      type: 'wholesale',
      gstNumber: '19AABCS1429B1Z5',
    },
  });

  const custRohit = await prisma.customer.create({
    data: {
      name: 'Rohit Gupta',
      email: 'rohit.gupta@royaljewels.in',
      phone: '+91-9829098765',
      address: '23, MI Road, Jaipur, Rajasthan 302001',
      type: 'wholesale',
      gstNumber: '08AABCR5678Q1Z3',
    },
  });

  const custSunita = await prisma.customer.create({
    data: {
      name: 'Sunita Reddy',
      email: 'sunita.reddy@yahoo.com',
      phone: '+91-9704056789',
      address: '56, Banjara Hills, Hyderabad, Telangana 500034',
      type: 'retail',
      gstNumber: null,
    },
  });

  const custTanishq = await prisma.customer.create({
    data: {
      name: 'Tanishq Distribution',
      email: 'orders@tanishqdist.co.in',
      phone: '+91-80-45678901',
      address: 'Titan Towers, Basavanagudi, Bengaluru, Karnataka 560004',
      type: 'wholesale',
      gstNumber: '29AABCT1332L1ZE',
    },
  });

  const custKavita = await prisma.customer.create({
    data: {
      name: 'Kavita Sharma',
      email: 'kavita.sharma@gmail.com',
      phone: '+91-9810176543',
      address: '89, Greater Kailash-II, New Delhi 110048',
      type: 'online',
      gstNumber: null,
    },
  });

  const custMahesh = await prisma.customer.create({
    data: {
      name: 'Mahesh Joshi',
      email: 'mahesh.joshi@email.com',
      phone: '+91-9423054321',
      address: '34, FC Road, Pune, Maharashtra 411005',
      type: 'online',
      gstNumber: null,
    },
  });

  const customers = [custAnita, custDeepak, custPriyal, custRohit, custSunita, custTanishq, custKavita, custMahesh];

  console.log('✅ 8 Customers created.');

  // ──────────────────────────────────────────────
  // 11. Sales Orders
  // ──────────────────────────────────────────────
  const so1 = await prisma.salesOrder.create({
    data: {
      soNumber: 'SO-2024-001',
      customerId: custAnita.id,
      status: 'delivered',
      totalAmount: 285000,
      discount: 5000,
      taxAmount: 8400,
      notes: 'Wedding anniversary gift. Gift wrapping requested.',
    },
  });

  const so2 = await prisma.salesOrder.create({
    data: {
      soNumber: 'SO-2024-002',
      customerId: custDeepak.id,
      status: 'shipped',
      totalAmount: 350000,
      discount: 10000,
      taxAmount: 10200,
      notes: 'Bridal order - requires hallmark certificate.',
    },
  });

  const so3 = await prisma.salesOrder.create({
    data: {
      soNumber: 'SO-2024-003',
      customerId: custPriyal.id,
      status: 'confirmed',
      totalAmount: 1250000,
      discount: 50000,
      taxAmount: 36000,
      notes: 'Wholesale bulk order. Custom hallmarking required.',
    },
  });

  const so4 = await prisma.salesOrder.create({
    data: {
      soNumber: 'SO-2024-004',
      customerId: custSunita.id,
      status: 'pending',
      totalAmount: 75000,
      discount: 0,
      taxAmount: 2250,
      notes: 'Temple jhumki for pooja ceremony.',
    },
  });

  const so5 = await prisma.salesOrder.create({
    data: {
      soNumber: 'SO-2024-005',
      customerId: custTanishq.id,
      status: 'processing',
      totalAmount: 2450000,
      discount: 122500,
      taxAmount: 69825,
      notes: 'Q2 wholesale replenishment. Split delivery across 3 locations.',
    },
  });

  console.log('✅ 5 Sales Orders created.');

  // ──────────────────────────────────────────────
  // 12. POS Transactions
  // ──────────────────────────────────────────────
  const posTransactions = [
    {
      transactionNumber: 'POS-2024-001',
      items: JSON.stringify([{ productId: pGld003.id, name: 'Simple Gold Chain', qty: 1, price: 45000 }]),
      subtotal: 45000,
      tax: 1350,
      discount: 0,
      total: 46350,
      paymentMethod: 'UPI',
      status: 'completed',
    },
    {
      transactionNumber: 'POS-2024-002',
      items: JSON.stringify([{ productId: pSlv001.id, name: 'Filigree Jhumka', qty: 2, price: 28000 }]),
      subtotal: 56000,
      tax: 1680,
      discount: 1000,
      total: 56680,
      paymentMethod: 'Card',
      status: 'completed',
    },
    {
      transactionNumber: 'POS-2024-003',
      items: JSON.stringify([
        { productId: pPlt001.id, name: 'Platinum Love Band', qty: 2, price: 125000 },
        { productId: pDmd003.id, name: 'Diamond Eternity Band', qty: 1, price: 95000 },
      ]),
      subtotal: 345000,
      tax: 10350,
      discount: 5000,
      total: 350350,
      paymentMethod: 'Card',
      status: 'completed',
    },
    {
      transactionNumber: 'POS-2024-004',
      items: JSON.stringify([{ productId: pKnd003.id, name: 'Kundan Maang Tikka', qty: 1, price: 42000 }]),
      subtotal: 42000,
      tax: 1260,
      discount: 0,
      total: 43260,
      paymentMethod: 'Cash',
      status: 'completed',
    },
    {
      transactionNumber: 'POS-2024-005',
      items: JSON.stringify([{ productId: pPrl002.id, name: 'Pearl Drop Earring & Pendant Set', qty: 1, price: 55000 }]),
      subtotal: 55000,
      tax: 1650,
      discount: 2000,
      total: 54650,
      paymentMethod: 'UPI',
      status: 'completed',
    },
    {
      transactionNumber: 'POS-2024-006',
      items: JSON.stringify([
        { productId: pSlv003.id, name: 'Silver Studs', qty: 3, price: 15000 },
        { productId: pSlv001.id, name: 'Filigree Jhumka', qty: 1, price: 28000 },
      ]),
      subtotal: 73000,
      tax: 2190,
      discount: 0,
      total: 75190,
      paymentMethod: 'Cash',
      status: 'completed',
    },
    {
      transactionNumber: 'POS-2024-007',
      items: JSON.stringify([{ productId: pTmp003.id, name: 'Temple Jhumki', qty: 2, price: 75000 }]),
      subtotal: 150000,
      tax: 4500,
      discount: 3000,
      total: 151500,
      paymentMethod: 'Card',
      status: 'completed',
    },
    {
      transactionNumber: 'POS-2024-008',
      items: JSON.stringify([{ productId: pPlt003.id, name: 'Platinum Chain Bracelet', qty: 1, price: 85000 }]),
      subtotal: 85000,
      tax: 2550,
      discount: 0,
      total: 87550,
      paymentMethod: 'UPI',
      status: 'refunded',
    },
  ];

  for (const pos of posTransactions) {
    await prisma.posTransaction.create({ data: pos });
  }

  console.log(`✅ ${posTransactions.length} POS Transactions created.`);

  // ──────────────────────────────────────────────
  // 13. E-Commerce Orders
  // ──────────────────────────────────────────────
  const ecoOrders = [
    {
      orderNumber: 'ECO-2024-001',
      customerName: 'Kavita Sharma',
      customerEmail: 'kavita.sharma@gmail.com',
      items: JSON.stringify([{ productId: pPrl002.id, name: 'Pearl Drop Earring & Pendant Set', qty: 1, price: 55000 }]),
      totalAmount: 56650,
      shippingAddress: '89, Greater Kailash-II, New Delhi 110048',
      paymentStatus: 'paid',
      orderStatus: 'delivered',
    },
    {
      orderNumber: 'ECO-2024-002',
      customerName: 'Mahesh Joshi',
      customerEmail: 'mahesh.joshi@email.com',
      items: JSON.stringify([{ productId: pSlv001.id, name: 'Filigree Jhumka', qty: 2, price: 28000 }]),
      totalAmount: 57680,
      shippingAddress: '34, FC Road, Pune, Maharashtra 411005',
      paymentStatus: 'paid',
      orderStatus: 'shipped',
    },
    {
      orderNumber: 'ECO-2024-003',
      customerName: 'Rashmi Iyer',
      customerEmail: 'rashmi.iyer@gmail.com',
      items: JSON.stringify([
        { productId: pDmd003.id, name: 'Diamond Eternity Band', qty: 1, price: 95000 },
        { productId: pKnd003.id, name: 'Kundan Maang Tikka', qty: 1, price: 42000 },
      ]),
      totalAmount: 141710,
      shippingAddress: '22, Anna Nagar, Chennai, Tamil Nadu 600040',
      paymentStatus: 'paid',
      orderStatus: 'processing',
    },
    {
      orderNumber: 'ECO-2024-004',
      customerName: 'Neha Kapoor',
      customerEmail: 'neha.kapoor@hotmail.com',
      items: JSON.stringify([{ productId: pBrd003.id, name: 'Contemporary Bridal Set', qty: 1, price: 155000 }]),
      totalAmount: 159650,
      shippingAddress: '56, Vasant Kunj, New Delhi 110070',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
    },
    {
      orderNumber: 'ECO-2024-005',
      customerName: 'Amit Singhania',
      customerEmail: 'amit.singhania@gmail.com',
      items: JSON.stringify([{ productId: pPlt001.id, name: 'Platinum Love Band', qty: 2, price: 125000 }]),
      totalAmount: 257500,
      shippingAddress: '101, Park Street, Kolkata, West Bengal 700016',
      paymentStatus: 'failed',
      orderStatus: 'pending',
    },
  ];

  for (const eco of ecoOrders) {
    await prisma.ecommerceOrder.create({ data: eco });
  }

  console.log(`✅ ${ecoOrders.length} E-Commerce Orders created.`);

  // ──────────────────────────────────────────────
  // 14. Work Orders
  // ──────────────────────────────────────────────
  const wo1 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-001',
      status: 'completed',
      priority: 'high',
      plannedStart: new Date('2024-01-05'),
      plannedEnd: new Date('2024-01-20'),
      actualStart: new Date('2024-01-06'),
      actualEnd: new Date('2024-01-22'),
      notes: 'Lakshmi Temple Necklace batch - wedding season rush order',
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-002',
      status: 'in_progress',
      priority: 'high',
      plannedStart: new Date('2024-02-01'),
      plannedEnd: new Date('2024-02-28'),
      actualStart: new Date('2024-02-02'),
      actualEnd: null,
      notes: 'Filigree Jhumka batch for Holi season demand',
    },
  });

  const wo3 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-003',
      status: 'in_progress',
      priority: 'medium',
      plannedStart: new Date('2024-02-10'),
      plannedEnd: new Date('2024-03-15'),
      actualStart: new Date('2024-02-12'),
      actualEnd: null,
      notes: 'Royal Kundan Bridal Set - custom order for exhibition',
    },
  });

  const wo4 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-004',
      status: 'planned',
      priority: 'medium',
      plannedStart: new Date('2024-03-01'),
      plannedEnd: new Date('2024-03-25'),
      actualStart: null,
      actualEnd: null,
      notes: 'Diamond ring production batch - solitaire and cluster',
    },
  });

  const wo5 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-005',
      status: 'planned',
      priority: 'low',
      plannedStart: new Date('2024-03-15'),
      plannedEnd: new Date('2024-04-10'),
      actualStart: null,
      actualEnd: null,
      notes: 'Pearl set assembly and temple jhumki restocking',
    },
  });

  console.log('✅ 5 Work Orders created.');

  // ──────────────────────────────────────────────
  // 15. Work Order Products
  // ──────────────────────────────────────────────
  const woProducts = [
    { workOrderId: wo1.id, productId: pGld001.id, targetQty: 5, completedQty: 5, wastageQty: 2.1 },
    { workOrderId: wo2.id, productId: pSlv001.id, targetQty: 20, completedQty: 12, wastageQty: 1.8 },
    { workOrderId: wo2.id, productId: pSlv002.id, targetQty: 10, completedQty: 4, wastageQty: 0.9 },
    { workOrderId: wo3.id, productId: pKnd001.id, targetQty: 3, completedQty: 1, wastageQty: 3.5 },
    { workOrderId: wo3.id, productId: pKnd002.id, targetQty: 5, completedQty: 0, wastageQty: 0 },
    { workOrderId: wo4.id, productId: pDmd001.id, targetQty: 6, completedQty: 0, wastageQty: 0 },
    { workOrderId: wo4.id, productId: pDmd002.id, targetQty: 8, completedQty: 0, wastageQty: 0 },
    { workOrderId: wo5.id, productId: pPrl002.id, targetQty: 15, completedQty: 0, wastageQty: 0 },
    { workOrderId: wo5.id, productId: pTmp003.id, targetQty: 12, completedQty: 0, wastageQty: 0 },
  ];

  for (const wop of woProducts) {
    await prisma.workOrderProduct.create({ data: wop });
  }

  console.log(`✅ ${woProducts.length} Work Order Products created.`);

  // ──────────────────────────────────────────────
  // 16. Shipments
  // ──────────────────────────────────────────────
  const ship1 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-001',
      carrier: 'BlueDart',
      trackingNumber: 'BD7890123456IN',
      origin: 'Mumbai',
      destination: 'Chennai',
      status: 'delivered',
      shippedDate: new Date('2024-01-18'),
      deliveredDate: new Date('2024-01-20'),
    },
  });

  const ship2 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-002',
      carrier: 'DTDC',
      trackingNumber: 'DT2345678901IN',
      origin: 'Mumbai',
      destination: 'Kolkata',
      status: 'in_transit',
      shippedDate: new Date('2024-02-10'),
      deliveredDate: null,
    },
  });

  const ship3 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-003',
      carrier: 'India Post',
      trackingNumber: 'IP5678901234IN',
      origin: 'Jaipur',
      destination: 'Hyderabad',
      status: 'in_transit',
      shippedDate: new Date('2024-02-14'),
      deliveredDate: null,
    },
  });

  const ship4 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-004',
      carrier: 'Delhivery',
      trackingNumber: 'DL9012345678IN',
      origin: 'Delhi',
      destination: 'Bengaluru',
      status: 'pending',
      shippedDate: null,
      deliveredDate: null,
    },
  });

  console.log('✅ 4 Shipments created.');

  // ──────────────────────────────────────────────
  // 17. Shipment Items
  // ──────────────────────────────────────────────
  const shipItems = [
    { shipmentId: ship1.id, productId: pGld001.id, quantity: 2 },
    { shipmentId: ship2.id, productId: pGld002.id, quantity: 1 },
    { shipmentId: ship2.id, productId: pDmd001.id, quantity: 3 },
    { shipmentId: ship3.id, productId: pTmp003.id, quantity: 4 },
    { shipmentId: ship3.id, productId: pSlv001.id, quantity: 8 },
    { shipmentId: ship4.id, productId: pPrl001.id, quantity: 2 },
    { shipmentId: ship4.id, productId: pPlt001.id, quantity: 5 },
  ];

  for (const si of shipItems) {
    await prisma.shipmentItem.create({ data: si });
  }

  console.log(`✅ ${shipItems.length} Shipment Items created.`);

  // ──────────────────────────────────────────────
  // 18. BOM Components (17)
  // ──────────────────────────────────────────────
  const bomComponents = [
    // Lakshmi Temple Gold Necklace (GLD-001) components
    { productId: pGld001.id, componentId: pGld003.id, quantity: 1.5 },   // Gold chain base
    { productId: pGld001.id, componentId: pSlv003.id, quantity: 4 },     // Silver findings/clasps

    // Mango Motif Haram (GLD-002) components
    { productId: pGld002.id, componentId: pGld003.id, quantity: 2 },     // Two gold chains
    { productId: pGld002.id, componentId: pPrl003.id, quantity: 1 },     // Pearl stringing

    // Solitaire Diamond Ring (DMD-001) components
    { productId: pDmd001.id, componentId: pDmd003.id, quantity: 0.8 },   // Band portion

    // Filigree Jhumka (SLV-001) components
    { productId: pSlv001.id, componentId: pSlv003.id, quantity: 2 },     // Silver stud base

    // Chandbali Earrings (SLV-002) components
    { productId: pSlv002.id, componentId: pSlv003.id, quantity: 3 },     // Multiple silver stud parts
    { productId: pSlv002.id, componentId: pPrl003.id, quantity: 0.5 },   // Pearl drops

    // Diamond Cut Platinum Bangle (PLT-002) components
    { productId: pPlt002.id, componentId: pPlt003.id, quantity: 1.2 },   // Chain component

    // Pearl Drop Earring & Pendant Set (PRL-002) components
    { productId: pPrl002.id, componentId: pPrl003.id, quantity: 2 },     // Two pearl strings

    // Naga Temple Choker (TMP-001) components
    { productId: pTmp001.id, componentId: pGld003.id, quantity: 1 },     // Gold chain base
    { productId: pTmp001.id, componentId: pSlv003.id, quantity: 6 },     // Silver findings

    // Goddess Lakshmi Oddiyanam (TMP-002) components
    { productId: pTmp002.id, componentId: pGld003.id, quantity: 3 },     // Multiple chain sections
    { productId: pTmp002.id, componentId: pSlv003.id, quantity: 8 },     // Clasp mechanisms

    // Temple Jhumki (TMP-003) components
    { productId: pTmp003.id, componentId: pSlv003.id, quantity: 2 },     // Silver stud base

    // Royal Kundan Bridal Set (KND-001) components
    { productId: pKnd001.id, componentId: pKnd003.id, quantity: 1 },     // Maang tikka
    { productId: pKnd001.id, componentId: pGld003.id, quantity: 2 },     // Gold chain sections

    // Traditional South Indian Bridal Set (BRD-001) components
    { productId: pBrd001.id, componentId: pGld001.id, quantity: 1 },     // Includes Lakshmi necklace
    { productId: pBrd001.id, componentId: pTmp003.id, quantity: 1 },     // Includes temple jhumki
  ];

  for (const bom of bomComponents) {
    await prisma.bomComponent.create({ data: bom });
  }

  console.log(`✅ ${bomComponents.length} BOM Components created.`);

  // ──────────────────────────────────────────────
  // 19. Demand Forecasts (12)
  // ──────────────────────────────────────────────
  const demandForecasts = [
    { productId: pGld001.id, period: '2024-Q2', predictedDemand: 18, confidence: 0.87, model: 'Prophet' },
    { productId: pGld003.id, period: '2024-Q2', predictedDemand: 65, confidence: 0.92, model: 'ARIMA' },
    { productId: pDmd001.id, period: '2024-Q2', predictedDemand: 12, confidence: 0.78, model: 'Prophet' },
    { productId: pSlv001.id, period: '2024-Q2', predictedDemand: 35, confidence: 0.85, model: 'MovingAverage' },
    { productId: pSlv003.id, period: '2024-Q2', predictedDemand: 80, confidence: 0.9, model: 'ARIMA' },
    { productId: pPlt001.id, period: '2024-Q2', predictedDemand: 14, confidence: 0.72, model: 'Prophet' },
    { productId: pPrl001.id, period: '2024-Q2', predictedDemand: 8, confidence: 0.68, model: 'MovingAverage' },
    { productId: pTmp001.id, period: '2024-Q2', predictedDemand: 6, confidence: 0.81, model: 'ARIMA' },
    { productId: pKnd001.id, period: '2024-Q2', predictedDemand: 5, confidence: 0.75, model: 'Prophet' },
    { productId: pBrd001.id, period: '2024-Q2', predictedDemand: 4, confidence: 0.65, model: 'MovingAverage' },
    { productId: pGld002.id, period: '2024-Q3', predictedDemand: 10, confidence: 0.83, model: 'Prophet' },
    { productId: pDmd002.id, period: '2024-Q3', predictedDemand: 15, confidence: 0.79, model: 'ARIMA' },
  ];

  for (const df of demandForecasts) {
    await prisma.demandForecast.create({ data: df });
  }

  console.log(`✅ ${demandForecasts.length} Demand Forecasts created.`);

  // ──────────────────────────────────────────────
  // 20. Audit Logs
  // ──────────────────────────────────────────────
  const auditLogs = [
    { user: userVikram.name, action: 'CREATE', module: 'Product', details: 'Created product: Lakshmi Temple Gold Necklace (GLD-001)' },
    { user: userMeena.name, action: 'UPDATE', module: 'Inventory', details: 'Updated stock for GLD-003 at MUM-VLT: +50 units' },
    { user: userRaj.name, action: 'CREATE', module: 'POS', details: 'Completed POS transaction POS-2024-001 via UPI' },
    { user: userVikram.name, action: 'CREATE', module: 'PurchaseOrder', details: 'Created PO-2024-001 to Bharat Gold Refinery' },
    { user: userMeena.name, action: 'APPROVE', module: 'PurchaseOrder', details: 'Approved PO-2024-001 total ₹12,56,000' },
    { user: userVikram.name, action: 'CREATE', module: 'WorkOrder', details: 'Created WO-2024-001 for Lakshmi Temple Necklace batch' },
    { user: userRaj.name, action: 'CREATE', module: 'SalesOrder', details: 'Created SO-2024-001 for Anita Krishnamurthy' },
    { user: userMeena.name, action: 'UPDATE', module: 'Shipment', details: 'SHP-2024-001 marked as delivered via BlueDart' },
    { user: userVikram.name, action: 'CREATE', module: 'Customer', details: 'Added wholesale customer: Priyal Agarwal' },
    { user: userRaj.name, action: 'REFUND', module: 'POS', details: 'Refunded POS-2024-008 - Platinum Chain Bracelet returned' },
    { user: userMeena.name, action: 'UPDATE', module: 'WorkOrder', details: 'WO-2024-002 status changed to in_progress' },
    { user: userVikram.name, action: 'UPDATE', module: 'Product', details: 'Updated pricing for DMD-001: ₹2,45,000' },
  ];

  for (const al of auditLogs) {
    await prisma.auditLog.create({ data: al });
  }

  console.log(`✅ ${auditLogs.length} Audit Logs created.`);

  // ──────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('  GoldGem ERP — Seed Complete!');
  console.log('══════════════════════════════════════════════');
  console.log(`  Users:               3`);
  console.log(`  Categories:          8`);
  console.log(`  Products:           24`);
  console.log(`  Warehouses:          3`);
  console.log(`  Inventory Items:    ${inventoryData.length}`);
  console.log(`  Inventory Movements: ${movements.length}`);
  console.log(`  Suppliers:           5`);
  console.log(`  Purchase Orders:     6`);
  console.log(`  PO Items:            ${poItems.length}`);
  console.log(`  Customers:           8`);
  console.log(`  Sales Orders:        5`);
  console.log(`  POS Transactions:    ${posTransactions.length}`);
  console.log(`  E-Commerce Orders:   ${ecoOrders.length}`);
  console.log(`  Work Orders:         5`);
  console.log(`  Work Order Products: ${woProducts.length}`);
  console.log(`  Shipments:           4`);
  console.log(`  Shipment Items:      ${shipItems.length}`);
  console.log(`  BOM Components:     ${bomComponents.length}`);
  console.log(`  Demand Forecasts:   ${demandForecasts.length}`);
  console.log(`  Audit Logs:         ${auditLogs.length}`);
  console.log('══════════════════════════════════════════════\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
