import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GoldGem ERP database...');

  // Clean all tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.demandForecast.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.workOrderProduct.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.bomComponent.deleteMany();
  await prisma.ecommerceOrder.deleteMany();
  await prisma.posTransaction.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ─── USERS ────────────────────────────────────────────────────────
  console.log('Creating users...');
  const userAlex = await prisma.user.create({
    data: {
      email: 'alex@goldgem.com',
      name: 'Alex Carter',
      password: '$2b$10$placeholderHashForAlexCarter',
      role: 'admin',
    },
  });

  const userSarah = await prisma.user.create({
    data: {
      email: 'sarah@goldgem.com',
      name: 'Sarah Mitchell',
      password: '$2b$10$placeholderHashForSarahMitchell',
      role: 'manager',
    },
  });

  const userDavid = await prisma.user.create({
    data: {
      email: 'david@goldgem.com',
      name: 'David Chen',
      password: '$2b$10$placeholderHashForDavidChen',
      role: 'cashier',
    },
  });

  // ─── CATEGORIES ───────────────────────────────────────────────────
  console.log('Creating categories...');
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
  const catPearlCollections = await prisma.category.create({
    data: { name: 'Pearl Collections', icon: 'Sparkles', color: '#FDEEF4' },
  });
  const catLuxuryWatches = await prisma.category.create({
    data: { name: 'Luxury Watches', icon: 'Clock', color: '#1C1C1C' },
  });
  const catGemstonePendants = await prisma.category.create({
    data: { name: 'Gemstone Pendants', icon: 'Diamond', color: '#6A0DAD' },
  });
  const catBridalCollections = await prisma.category.create({
    data: { name: 'Bridal Collections', icon: 'Heart', color: '#C71585' },
  });

  // ─── PRODUCTS ─────────────────────────────────────────────────────
  console.log('Creating products...');

  // Gold Necklaces
  const prodGoldChain = await prisma.product.create({
    data: {
      name: 'Classic Gold Chain',
      sku: 'GLD-001',
      description: 'Timeless 18K gold chain with interlocking links, perfect for everyday wear or layering.',
      categoryId: catGoldNecklaces.id,
      price: 1250.0,
      costPrice: 890.0,
      weight: 22.0,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 15,
      isActive: true,
    },
  });

  const prodItalianGoldNecklace = await prisma.product.create({
    data: {
      name: 'Italian Gold Necklace',
      sku: 'GLD-002',
      description: 'Exquisite Italian-crafted 18K gold necklace with delicate filigree design.',
      categoryId: catGoldNecklaces.id,
      price: 3800.0,
      costPrice: 2650.0,
      weight: 35.0,
      purity: '18K',
      isManufactured: false,
      minStockLevel: 8,
      isActive: true,
    },
  });

  const prodGoldPendantNecklace = await prisma.product.create({
    data: {
      name: 'Gold Pendant Necklace',
      sku: 'GLD-003',
      description: 'Elegant 14K gold pendant necklace featuring a minimalist disc pendant on a fine chain.',
      categoryId: catGoldNecklaces.id,
      price: 2450.0,
      costPrice: 1680.0,
      weight: 18.0,
      purity: '14K',
      isManufactured: false,
      minStockLevel: 12,
      isActive: true,
    },
  });

  // Diamond Rings
  const prodSolitaireRing = await prisma.product.create({
    data: {
      name: 'Solitaire Engagement Ring',
      sku: 'DMD-001',
      description: 'Stunning 1.5ct round brilliant solitaire diamond set in 18K white gold with platinum prongs.',
      categoryId: catDiamondRings.id,
      price: 12500.0,
      costPrice: 8200.0,
      weight: 5.2,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 5,
      isActive: true,
    },
  });

  const prodDiamondHaloRing = await prisma.product.create({
    data: {
      name: 'Diamond Halo Ring',
      sku: 'DMD-002',
      description: '0.75ct center diamond surrounded by a halo of 36 micro-pavé diamonds in 14K white gold.',
      categoryId: catDiamondRings.id,
      price: 8900.0,
      costPrice: 5800.0,
      weight: 6.8,
      purity: '14K',
      isManufactured: true,
      minStockLevel: 6,
      isActive: true,
    },
  });

  const prodDiamondTennisBracelet = await prisma.product.create({
    data: {
      name: 'Diamond Tennis Bracelet',
      sku: 'DMD-003',
      description: '5ct total weight round brilliant diamond tennis bracelet in 14K white gold, box clasp.',
      categoryId: catDiamondRings.id,
      price: 15000.0,
      costPrice: 9500.0,
      weight: 28.0,
      purity: '14K',
      isManufactured: false,
      minStockLevel: 4,
      isActive: true,
    },
  });

  // Silver Earrings
  const prodSilverHoops = await prisma.product.create({
    data: {
      name: 'Sterling Silver Hoops',
      sku: 'SLV-001',
      description: 'Classic sterling silver hoop earrings with high-polish finish and secure latch back.',
      categoryId: catSilverEarrings.id,
      price: 285.0,
      costPrice: 95.0,
      weight: 8.0,
      purity: '925',
      isManufactured: true,
      minStockLevel: 25,
      isActive: true,
    },
  });

  const prodSilverDropEarrings = await prisma.product.create({
    data: {
      name: 'Silver Drop Earrings',
      sku: 'SLV-002',
      description: 'Elegant sterling silver drop earrings with teardrop design and French wire hooks.',
      categoryId: catSilverEarrings.id,
      price: 420.0,
      costPrice: 145.0,
      weight: 12.0,
      purity: '925',
      isManufactured: false,
      minStockLevel: 20,
      isActive: true,
    },
  });

  const prodSilverStuds = await prisma.product.create({
    data: {
      name: 'Silver Stud Earrings',
      sku: 'SLV-003',
      description: 'Minimalist sterling silver ball stud earrings with push-back closures.',
      categoryId: catSilverEarrings.id,
      price: 195.0,
      costPrice: 65.0,
      weight: 4.0,
      purity: '925',
      isManufactured: false,
      minStockLevel: 30,
      isActive: true,
    },
  });

  // Platinum Bracelets
  const prodPlatinumWeddingBand = await prisma.product.create({
    data: {
      name: 'Platinum Wedding Band',
      sku: 'PLT-001',
      description: 'Classic comfort-fit platinum wedding band with mirror-polished finish.',
      categoryId: catPlatinumBracelets.id,
      price: 2800.0,
      costPrice: 1900.0,
      weight: 10.0,
      purity: '950',
      isManufactured: true,
      minStockLevel: 10,
      isActive: true,
    },
  });

  const prodPlatinumLinkBracelet = await prisma.product.create({
    data: {
      name: 'Platinum Link Bracelet',
      sku: 'PLT-002',
      description: 'Luxurious platinum link bracelet with brushed and polished links, lobster clasp.',
      categoryId: catPlatinumBracelets.id,
      price: 7500.0,
      costPrice: 4800.0,
      weight: 32.0,
      purity: '950',
      isManufactured: false,
      minStockLevel: 5,
      isActive: true,
    },
  });

  const prodPlatinumChainNecklace = await prisma.product.create({
    data: {
      name: 'Platinum Chain Necklace',
      sku: 'PLT-003',
      description: 'Heavy platinum cable chain necklace with spring-ring clasp, exceptional luster.',
      categoryId: catPlatinumBracelets.id,
      price: 5200.0,
      costPrice: 3400.0,
      weight: 25.0,
      purity: '950',
      isManufactured: false,
      minStockLevel: 6,
      isActive: true,
    },
  });

  // Pearl Collections
  const prodAkoyaPearlNecklace = await prisma.product.create({
    data: {
      name: 'Akoya Pearl Necklace',
      sku: 'PRL-001',
      description: '18-inch strand of 7-7.5mm AAA Akoya pearls with 14K gold clasp, exceptional luster.',
      categoryId: catPearlCollections.id,
      price: 4500.0,
      costPrice: 2800.0,
      weight: 45.0,
      purity: null,
      isManufactured: true,
      minStockLevel: 6,
      isActive: true,
    },
  });

  const prodPearlDropEarrings = await prisma.product.create({
    data: {
      name: 'Pearl Drop Earrings',
      sku: 'PRL-002',
      description: 'South Sea pearl drop earrings set in 14K white gold with diamond accents.',
      categoryId: catPearlCollections.id,
      price: 1200.0,
      costPrice: 720.0,
      weight: 10.0,
      purity: null,
      isManufactured: false,
      minStockLevel: 12,
      isActive: true,
    },
  });

  const prodFreshwaterPearlStrand = await prisma.product.create({
    data: {
      name: 'Freshwater Pearl Strand',
      sku: 'PRL-003',
      description: 'Multicolor freshwater pearl strand, 8-9mm, with sterling silver clasp.',
      categoryId: catPearlCollections.id,
      price: 890.0,
      costPrice: 480.0,
      weight: 38.0,
      purity: null,
      isManufactured: false,
      minStockLevel: 15,
      isActive: true,
    },
  });

  // Luxury Watches
  const prodSwissWatch = await prisma.product.create({
    data: {
      name: 'Swiss Automatic Watch',
      sku: 'WTC-001',
      description: 'Swiss-made automatic movement watch with sapphire crystal, 18K rose gold case, and alligator strap.',
      categoryId: catLuxuryWatches.id,
      price: 8500.0,
      costPrice: 5200.0,
      weight: 85.0,
      purity: null,
      isManufactured: false,
      minStockLevel: 4,
      isActive: true,
    },
  });

  const prodLuxuryChronograph = await prisma.product.create({
    data: {
      name: 'Luxury Chronograph',
      sku: 'WTC-002',
      description: 'Platinum chronograph with perpetual calendar, moonphase, and 72-hour power reserve.',
      categoryId: catLuxuryWatches.id,
      price: 35000.0,
      costPrice: 22000.0,
      weight: 120.0,
      purity: null,
      isManufactured: false,
      minStockLevel: 2,
      isActive: true,
    },
  });

  // Gemstone Pendants
  const prodRubyPendant = await prisma.product.create({
    data: {
      name: 'Ruby Pendant Necklace',
      sku: 'GEM-001',
      description: '2.5ct oval Burmese ruby pendant surrounded by diamond halo on 18K gold chain.',
      categoryId: catGemstonePendants.id,
      price: 6800.0,
      costPrice: 4200.0,
      weight: 14.0,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 5,
      isActive: true,
    },
  });

  const prodSapphireCocktailRing = await prisma.product.create({
    data: {
      name: 'Sapphire Cocktail Ring',
      sku: 'GEM-002',
      description: '3ct Ceylon sapphire cocktail ring with diamond shoulders in 18K yellow gold.',
      categoryId: catGemstonePendants.id,
      price: 5200.0,
      costPrice: 3100.0,
      weight: 8.0,
      purity: '18K',
      isManufactured: false,
      minStockLevel: 6,
      isActive: true,
    },
  });

  const prodEmeraldDropEarrings = await prisma.product.create({
    data: {
      name: 'Emerald Drop Earrings',
      sku: 'GEM-003',
      description: 'Colombian emerald drop earrings with diamond accents set in 14K white gold.',
      categoryId: catGemstonePendants.id,
      price: 4100.0,
      costPrice: 2500.0,
      weight: 11.0,
      purity: '14K',
      isManufactured: false,
      minStockLevel: 7,
      isActive: true,
    },
  });

  // Bridal Collections
  const prodClassicBridalSet = await prisma.product.create({
    data: {
      name: 'Classic Bridal Set',
      sku: 'BRD-001',
      description: 'Timeless bridal set featuring a 1ct solitaire engagement ring and matching 18K gold wedding band.',
      categoryId: catBridalCollections.id,
      price: 18500.0,
      costPrice: 11200.0,
      weight: 12.0,
      purity: '18K',
      isManufactured: true,
      minStockLevel: 4,
      isActive: true,
    },
  });

  const prodVintageBridalRingSet = await prisma.product.create({
    data: {
      name: 'Vintage Bridal Ring Set',
      sku: 'BRD-002',
      description: 'Art deco inspired bridal set with milgrain detailing and 1.5ct center diamond in 18K white gold.',
      categoryId: catBridalCollections.id,
      price: 22000.0,
      costPrice: 13800.0,
      weight: 15.0,
      purity: '18K',
      isManufactured: false,
      minStockLevel: 3,
      isActive: true,
    },
  });

  const prodModernBridalNecklace = await prisma.product.create({
    data: {
      name: 'Modern Bridal Necklace',
      sku: 'BRD-003',
      description: 'Contemporary bridal necklace with geometric diamond pattern in 14K white gold.',
      categoryId: catBridalCollections.id,
      price: 9800.0,
      costPrice: 6100.0,
      weight: 22.0,
      purity: '14K',
      isManufactured: false,
      minStockLevel: 5,
      isActive: true,
    },
  });

  // ─── WAREHOUSES ───────────────────────────────────────────────────
  console.log('Creating warehouses...');
  const whMainVault = await prisma.warehouse.create({
    data: { name: 'Main Vault', code: 'NYC-VLT', city: 'New York', capacity: 5000 },
  });
  const whWorkshop = await prisma.warehouse.create({
    data: { name: 'Workshop', code: 'LDN-WRK', city: 'London', capacity: 2000 },
  });
  const whDistributionHub = await prisma.warehouse.create({
    data: { name: 'Distribution Hub', code: 'DXB-DST', city: 'Dubai', capacity: 3000 },
  });

  // ─── INVENTORY ITEMS ──────────────────────────────────────────────
  console.log('Creating inventory items...');
  const inventoryItems = await Promise.all([
    // Gold products in Main Vault
    prisma.inventoryItem.create({ data: { productId: prodGoldChain.id, warehouseId: whMainVault.id, quantity: 25, reservedQty: 3, reorderPoint: 10 } }),
    prisma.inventoryItem.create({ data: { productId: prodItalianGoldNecklace.id, warehouseId: whMainVault.id, quantity: 12, reservedQty: 1, reorderPoint: 5 } }),
    prisma.inventoryItem.create({ data: { productId: prodGoldPendantNecklace.id, warehouseId: whMainVault.id, quantity: 18, reservedQty: 2, reorderPoint: 8 } }),
    // Diamond products in Main Vault
    prisma.inventoryItem.create({ data: { productId: prodSolitaireRing.id, warehouseId: whMainVault.id, quantity: 8, reservedQty: 2, reorderPoint: 3 } }),
    prisma.inventoryItem.create({ data: { productId: prodDiamondHaloRing.id, warehouseId: whMainVault.id, quantity: 10, reservedQty: 1, reorderPoint: 4 } }),
    prisma.inventoryItem.create({ data: { productId: prodDiamondTennisBracelet.id, warehouseId: whMainVault.id, quantity: 5, reservedQty: 1, reorderPoint: 2 } }),
    // Silver products in London Workshop
    prisma.inventoryItem.create({ data: { productId: prodSilverHoops.id, warehouseId: whWorkshop.id, quantity: 40, reservedQty: 5, reorderPoint: 15 } }),
    prisma.inventoryItem.create({ data: { productId: prodSilverDropEarrings.id, warehouseId: whWorkshop.id, quantity: 30, reservedQty: 3, reorderPoint: 12 } }),
    prisma.inventoryItem.create({ data: { productId: prodSilverStuds.id, warehouseId: whWorkshop.id, quantity: 55, reservedQty: 4, reorderPoint: 20 } }),
    // Platinum products in Main Vault
    prisma.inventoryItem.create({ data: { productId: prodPlatinumWeddingBand.id, warehouseId: whMainVault.id, quantity: 15, reservedQty: 2, reorderPoint: 6 } }),
    prisma.inventoryItem.create({ data: { productId: prodPlatinumLinkBracelet.id, warehouseId: whMainVault.id, quantity: 6, reservedQty: 0, reorderPoint: 3 } }),
    prisma.inventoryItem.create({ data: { productId: prodPlatinumChainNecklace.id, warehouseId: whMainVault.id, quantity: 8, reservedQty: 1, reorderPoint: 4 } }),
    // Pearl products in Dubai Distribution Hub
    prisma.inventoryItem.create({ data: { productId: prodAkoyaPearlNecklace.id, warehouseId: whDistributionHub.id, quantity: 10, reservedQty: 2, reorderPoint: 5 } }),
    prisma.inventoryItem.create({ data: { productId: prodPearlDropEarrings.id, warehouseId: whDistributionHub.id, quantity: 20, reservedQty: 3, reorderPoint: 8 } }),
    prisma.inventoryItem.create({ data: { productId: prodFreshwaterPearlStrand.id, warehouseId: whDistributionHub.id, quantity: 18, reservedQty: 1, reorderPoint: 10 } }),
    // Watches in Main Vault
    prisma.inventoryItem.create({ data: { productId: prodSwissWatch.id, warehouseId: whMainVault.id, quantity: 6, reservedQty: 1, reorderPoint: 2 } }),
    prisma.inventoryItem.create({ data: { productId: prodLuxuryChronograph.id, warehouseId: whMainVault.id, quantity: 3, reservedQty: 0, reorderPoint: 1 } }),
    // Gemstone products in London Workshop
    prisma.inventoryItem.create({ data: { productId: prodRubyPendant.id, warehouseId: whWorkshop.id, quantity: 7, reservedQty: 1, reorderPoint: 3 } }),
    prisma.inventoryItem.create({ data: { productId: prodSapphireCocktailRing.id, warehouseId: whWorkshop.id, quantity: 9, reservedQty: 2, reorderPoint: 4 } }),
    prisma.inventoryItem.create({ data: { productId: prodEmeraldDropEarrings.id, warehouseId: whWorkshop.id, quantity: 11, reservedQty: 1, reorderPoint: 5 } }),
    // Bridal products in Dubai Distribution Hub
    prisma.inventoryItem.create({ data: { productId: prodClassicBridalSet.id, warehouseId: whDistributionHub.id, quantity: 5, reservedQty: 1, reorderPoint: 2 } }),
    prisma.inventoryItem.create({ data: { productId: prodVintageBridalRingSet.id, warehouseId: whDistributionHub.id, quantity: 4, reservedQty: 0, reorderPoint: 2 } }),
    prisma.inventoryItem.create({ data: { productId: prodModernBridalNecklace.id, warehouseId: whDistributionHub.id, quantity: 7, reservedQty: 1, reorderPoint: 3 } }),
    // Some products in multiple warehouses
    prisma.inventoryItem.create({ data: { productId: prodSilverHoops.id, warehouseId: whDistributionHub.id, quantity: 25, reservedQty: 2, reorderPoint: 10 } }),
    prisma.inventoryItem.create({ data: { productId: prodGoldChain.id, warehouseId: whWorkshop.id, quantity: 10, reservedQty: 0, reorderPoint: 5 } }),
  ]);

  // ─── INVENTORY MOVEMENTS ──────────────────────────────────────────
  console.log('Creating inventory movements...');
  await Promise.all([
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[0].id, type: 'in', quantity: 30, reference: 'PO-2024-001', notes: 'Initial stock receipt from Swiss Gold Refinery' } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[0].id, type: 'out', quantity: 5, reference: 'SO-2024-001', notes: 'Fulfilled sales order for retail client' } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[3].id, type: 'in', quantity: 10, reference: 'PO-2024-002', notes: 'Diamond ring shipment from Antwerp' } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[6].id, type: 'in', quantity: 50, reference: 'PO-2024-003', notes: 'Silver earrings from Italian Silver Craft' } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[6].id, type: 'out', quantity: 10, reference: 'SO-2024-002', notes: 'Wholesale order for retail partner' } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[12].id, type: 'in', quantity: 12, reference: 'PO-2024-004', notes: 'Akoya pearls from Tahiti Pearl House' } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[15].id, type: 'transfer', quantity: 2, reference: 'TRF-2024-001', notes: 'Transferred from London workshop to NYC vault' } }),
    prisma.inventoryMovement.create({ data: { inventoryItemId: inventoryItems[3].id, type: 'out', quantity: 2, reference: 'POS-TXN-001', notes: 'POS sale at New York showroom' } }),
  ]);

  // ─── SUPPLIERS ────────────────────────────────────────────────────
  console.log('Creating suppliers...');
  const supplierSwissGold = await prisma.supplier.create({
    data: {
      name: 'Swiss Gold Refinery',
      code: 'SGR-001',
      contactPerson: 'Hans Mueller',
      phone: '+41 44 123 4567',
      email: 'orders@swissgoldrefinery.ch',
      address: 'Bahnhofstrasse 42, 8001 Zurich, Switzerland',
      rating: 4.8,
      leadTimeDays: 5,
      paymentTerms: 'Net 30',
      isActive: true,
    },
  });

  const supplierAntwerpDiamonds = await prisma.supplier.create({
    data: {
      name: 'Antwerp Diamond Traders',
      code: 'ADT-001',
      contactPerson: 'Jan De Smedt',
      phone: '+32 3 234 5678',
      email: 'supply@antwerpdiamonds.be',
      address: 'Pelikaanstraat 60, 2018 Antwerp, Belgium',
      rating: 4.6,
      leadTimeDays: 7,
      paymentTerms: 'Net 45',
      isActive: true,
    },
  });

  const supplierItalianSilver = await prisma.supplier.create({
    data: {
      name: 'Italian Silver Craft',
      code: 'ISC-001',
      contactPerson: 'Marco Rossi',
      phone: '+39 02 345 6789',
      email: 'wholesale@italiansilvercraft.it',
      address: 'Via Montenapoleone 8, 20121 Milan, Italy',
      rating: 4.3,
      leadTimeDays: 10,
      paymentTerms: 'Net 30',
      isActive: true,
    },
  });

  const supplierTahitiPearls = await prisma.supplier.create({
    data: {
      name: 'Tahiti Pearl House',
      code: 'TPH-001',
      contactPerson: 'Manoa Tehahe',
      phone: '+689 40 456 789',
      email: 'export@tahitipearlhouse.pf',
      address: 'Boulevard de la Reine Pomare IV, 98713 Papeete, Tahiti',
      rating: 4.1,
      leadTimeDays: 14,
      paymentTerms: 'Net 60',
      isActive: true,
    },
  });

  const supplierColombianEmeralds = await prisma.supplier.create({
    data: {
      name: 'Colombian Emerald Exchange',
      code: 'CEE-001',
      contactPerson: 'Carlos Mendoza',
      phone: '+57 1 567 8901',
      email: 'gems@colombianemerald.co',
      address: 'Carrera 7 #72-41, Bogota, Colombia',
      rating: 4.5,
      leadTimeDays: 12,
      paymentTerms: 'Net 45',
      isActive: true,
    },
  });

  // ─── PURCHASE ORDERS ──────────────────────────────────────────────
  console.log('Creating purchase orders...');
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-001',
      supplierId: supplierSwissGold.id,
      status: 'received',
      totalAmount: 26700.0,
      taxAmount: 2136.0,
      notes: 'Quarterly gold chain replenishment for New York vault. All items inspected and verified.',
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-002',
      supplierId: supplierAntwerpDiamonds.id,
      status: 'received',
      totalAmount: 58000.0,
      taxAmount: 4640.0,
      notes: 'Diamond ring and bracelet consignment from Antwerp. GIA certificates verified on receipt.',
    },
  });

  const po3 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-003',
      supplierId: supplierItalianSilver.id,
      status: 'shipped',
      totalAmount: 6420.0,
      taxAmount: 513.6,
      notes: 'Sterling silver earrings and hoops for London workshop. Expected delivery next week.',
    },
  });

  const po4 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-004',
      supplierId: supplierTahitiPearls.id,
      status: 'approved',
      totalAmount: 15200.0,
      taxAmount: 1216.0,
      notes: 'Akoya and freshwater pearl order for Dubai distribution hub. Quality grade AAA specified.',
    },
  });

  const po5 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-005',
      supplierId: supplierColombianEmeralds.id,
      status: 'draft',
      totalAmount: 18000.0,
      taxAmount: 1440.0,
      notes: 'Emerald and gemstone procurement — pending management approval for Q2 budget allocation.',
    },
  });

  const po6 = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-006',
      supplierId: supplierSwissGold.id,
      status: 'pending',
      totalAmount: 35500.0,
      taxAmount: 2840.0,
      notes: 'Bulk gold order for bridal collection manufacturing. Awaiting supplier confirmation on 18K gold pricing.',
    },
  });

  // ─── PURCHASE ORDER ITEMS ─────────────────────────────────────────
  console.log('Creating purchase order items...');
  await Promise.all([
    // PO-001: Gold items from Swiss Gold Refinery
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po1.id, productId: prodGoldChain.id, quantity: 30, unitPrice: 890.0, receivedQty: 30 } }),
    // PO-002: Diamond items from Antwerp
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po2.id, productId: prodSolitaireRing.id, quantity: 4, unitPrice: 8200.0, receivedQty: 4 } }),
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po2.id, productId: prodDiamondHaloRing.id, quantity: 3, unitPrice: 5800.0, receivedQty: 3 } }),
    // PO-003: Silver items from Italy
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po3.id, productId: prodSilverHoops.id, quantity: 40, unitPrice: 95.0, receivedQty: 0 } }),
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po3.id, productId: prodSilverDropEarrings.id, quantity: 28, unitPrice: 145.0, receivedQty: 0 } }),
    // PO-004: Pearl items from Tahiti
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po4.id, productId: prodAkoyaPearlNecklace.id, quantity: 4, unitPrice: 2800.0, receivedQty: 0 } }),
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po4.id, productId: prodFreshwaterPearlStrand.id, quantity: 8, unitPrice: 480.0, receivedQty: 0 } }),
    // PO-005: Gemstone items from Colombia
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po5.id, productId: prodEmeraldDropEarrings.id, quantity: 6, unitPrice: 2500.0, receivedQty: 0 } }),
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po5.id, productId: prodSapphireCocktailRing.id, quantity: 3, unitPrice: 3100.0, receivedQty: 0 } }),
    // PO-006: Gold for bridal from Swiss
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po6.id, productId: prodItalianGoldNecklace.id, quantity: 8, unitPrice: 2650.0, receivedQty: 0 } }),
    prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po6.id, productId: prodGoldPendantNecklace.id, quantity: 10, unitPrice: 1680.0, receivedQty: 0 } }),
  ]);

  // ─── CUSTOMERS ────────────────────────────────────────────────────
  console.log('Creating customers...');
  const custEmma = await prisma.customer.create({
    data: { name: 'Emma Thompson', email: 'emma.thompson@email.co.uk', phone: '+44 20 7946 0958', address: '14 Kensington Gardens, London W8 4PX, United Kingdom', type: 'retail' },
  });
  const custJames = await prisma.customer.create({
    data: { name: 'James Wilson', email: 'james.wilson@email.com', phone: '+1 212 555 0147', address: '740 Park Avenue, New York, NY 10021, USA', type: 'retail' },
  });
  const custSophie = await prisma.customer.create({
    data: { name: 'Sophie Laurent', email: 'sophie@laurent-joaillerie.fr', phone: '+33 1 42 68 53 00', address: '28 Place Vendome, 75001 Paris, France', type: 'wholesale', taxId: 'FR-WS-2024-0847' },
  });
  const custMichael = await prisma.customer.create({
    data: { name: 'Michael Rodriguez', email: 'michael@rodriguez-jewelers.com', phone: '+1 305 555 0199', address: '1200 Brickell Ave, Suite 400, Miami, FL 33131, USA', type: 'wholesale', taxId: 'US-WS-2024-1562' },
  });
  const custLisa = await prisma.customer.create({
    data: { name: 'Lisa Yamamoto', email: 'lisa.yamamoto@email.jp', phone: '+81 3 1234 5678', address: '4-2-8 Roppongi Hills, Minato-ku, Tokyo 106-6108, Japan', type: 'retail' },
  });
  const custAurora = await prisma.customer.create({
    data: { name: 'Aurora International', email: 'procurement@aurora-intl.sg', phone: '+65 6738 2900', address: '1 Raffles Place, #40-01, Singapore 048616', type: 'wholesale', taxId: 'SG-WS-2024-0391' },
  });
  const custRobert = await prisma.customer.create({
    data: { name: 'Robert Kim', email: 'robert.kim@email.kr', phone: '+82 2 555 0123', address: '123 Gangnam-daero, Seocho-gu, Seoul 06612, South Korea', type: 'online' },
  });
  const custIsabella = await prisma.customer.create({
    data: { name: 'Isabella Rossi', email: 'isabella.rossi@email.it', phone: '+39 02 8901 2345', address: 'Via della Spiga 26, 20121 Milan, Italy', type: 'online' },
  });

  // ─── SALES ORDERS ─────────────────────────────────────────────────
  console.log('Creating sales orders...');
  await Promise.all([
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2024-001',
        customerId: custEmma.id,
        status: 'delivered',
        totalAmount: 2450.0,
        discount: 0,
        taxAmount: 196.0,
        notes: 'Gold Pendant Necklace — delivered to London address. Customer satisfied with quality.',
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2024-002',
        customerId: custSophie.id,
        status: 'shipped',
        totalAmount: 28800.0,
        discount: 2400.0,
        taxAmount: 2112.0,
        notes: 'Wholesale order — 3x Solitaire Engagement Rings for Paris boutique. Bulk discount applied.',
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2024-003',
        customerId: custAurora.id,
        status: 'confirmed',
        totalAmount: 15200.0,
        discount: 1200.0,
        taxAmount: 1120.0,
        notes: 'Wholesale pearl and silver assortment for Singapore flagship. Credit terms: Net 30.',
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2024-004',
        customerId: custJames.id,
        status: 'pending',
        totalAmount: 12500.0,
        discount: 0,
        taxAmount: 1000.0,
        notes: 'Special order — Solitaire Engagement Ring with custom engraving. Awaiting size confirmation.',
      },
    }),
    prisma.salesOrder.create({
      data: {
        soNumber: 'SO-2024-005',
        customerId: custMichael.id,
        status: 'processing',
        totalAmount: 42300.0,
        discount: 3500.0,
        taxAmount: 3104.0,
        notes: 'Large wholesale order for Miami store opening — diamond rings, platinum bands, and bridal sets.',
      },
    }),
  ]);

  // ─── POS TRANSACTIONS ─────────────────────────────────────────────
  console.log('Creating POS transactions...');
  await Promise.all([
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-001',
        items: JSON.stringify([{ productId: prodSilverHoops.id, name: 'Sterling Silver Hoops', quantity: 2, unitPrice: 285.0 }]),
        subtotal: 570.0,
        tax: 45.6,
        discount: 0,
        total: 615.6,
        paymentMethod: 'card',
        status: 'completed',
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-002',
        items: JSON.stringify([{ productId: prodGoldChain.id, name: 'Classic Gold Chain', quantity: 1, unitPrice: 1250.0 }]),
        subtotal: 1250.0,
        tax: 100.0,
        discount: 50.0,
        total: 1300.0,
        paymentMethod: 'card',
        status: 'completed',
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-003',
        items: JSON.stringify([
          { productId: prodSilverStuds.id, name: 'Silver Stud Earrings', quantity: 1, unitPrice: 195.0 },
          { productId: prodSilverDropEarrings.id, name: 'Silver Drop Earrings', quantity: 1, unitPrice: 420.0 },
        ]),
        subtotal: 615.0,
        tax: 49.2,
        discount: 0,
        total: 664.2,
        paymentMethod: 'cash',
        status: 'completed',
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-004',
        items: JSON.stringify([{ productId: prodPlatinumWeddingBand.id, name: 'Platinum Wedding Band', quantity: 1, unitPrice: 2800.0 }]),
        subtotal: 2800.0,
        tax: 224.0,
        discount: 100.0,
        total: 2924.0,
        paymentMethod: 'card',
        status: 'completed',
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-005',
        items: JSON.stringify([{ productId: prodSwissWatch.id, name: 'Swiss Automatic Watch', quantity: 1, unitPrice: 8500.0 }]),
        subtotal: 8500.0,
        tax: 680.0,
        discount: 0,
        total: 9180.0,
        paymentMethod: 'card',
        status: 'completed',
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-006',
        items: JSON.stringify([
          { productId: prodPearlDropEarrings.id, name: 'Pearl Drop Earrings', quantity: 1, unitPrice: 1200.0 },
          { productId: prodFreshwaterPearlStrand.id, name: 'Freshwater Pearl Strand', quantity: 2, unitPrice: 890.0 },
        ]),
        subtotal: 2980.0,
        tax: 238.4,
        discount: 200.0,
        total: 3018.4,
        paymentMethod: 'digital',
        status: 'completed',
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-007',
        items: JSON.stringify([{ productId: prodRubyPendant.id, name: 'Ruby Pendant Necklace', quantity: 1, unitPrice: 6800.0 }]),
        subtotal: 6800.0,
        tax: 544.0,
        discount: 0,
        total: 7344.0,
        paymentMethod: 'card',
        status: 'completed',
      },
    }),
    prisma.posTransaction.create({
      data: {
        transactionNumber: 'POS-TXN-008',
        items: JSON.stringify([{ productId: prodSilverHoops.id, name: 'Sterling Silver Hoops', quantity: 3, unitPrice: 285.0 }]),
        subtotal: 855.0,
        tax: 68.4,
        discount: 50.0,
        total: 873.4,
        paymentMethod: 'cash',
        status: 'completed',
      },
    }),
  ]);

  // ─── E-COMMERCE ORDERS ────────────────────────────────────────────
  console.log('Creating e-commerce orders...');
  await Promise.all([
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2024-001',
        customerName: 'Robert Kim',
        customerEmail: 'robert.kim@email.kr',
        items: JSON.stringify([{ productId: prodDiamondHaloRing.id, name: 'Diamond Halo Ring', quantity: 1, unitPrice: 8900.0 }]),
        totalAmount: 9612.0,
        shippingAddress: '123 Gangnam-daero, Seocho-gu, Seoul 06612, South Korea',
        paymentStatus: 'paid',
        orderStatus: 'shipped',
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2024-002',
        customerName: 'Isabella Rossi',
        customerEmail: 'isabella.rossi@email.it',
        items: JSON.stringify([
          { productId: prodSilverDropEarrings.id, name: 'Silver Drop Earrings', quantity: 1, unitPrice: 420.0 },
          { productId: prodSilverStuds.id, name: 'Silver Stud Earrings', quantity: 2, unitPrice: 195.0 },
        ]),
        totalAmount: 873.0,
        shippingAddress: 'Via della Spiga 26, 20121 Milan, Italy',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2024-003',
        customerName: 'Lisa Yamamoto',
        customerEmail: 'lisa.yamamoto@email.jp',
        items: JSON.stringify([{ productId: prodClassicBridalSet.id, name: 'Classic Bridal Set', quantity: 1, unitPrice: 18500.0 }]),
        totalAmount: 19980.0,
        shippingAddress: '4-2-8 Roppongi Hills, Minato-ku, Tokyo 106-6108, Japan',
        paymentStatus: 'paid',
        orderStatus: 'processing',
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2024-004',
        customerName: 'Emma Thompson',
        customerEmail: 'emma.thompson@email.co.uk',
        items: JSON.stringify([{ productId: prodSapphireCocktailRing.id, name: 'Sapphire Cocktail Ring', quantity: 1, unitPrice: 5200.0 }]),
        totalAmount: 5616.0,
        shippingAddress: '14 Kensington Gardens, London W8 4PX, United Kingdom',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      },
    }),
    prisma.ecommerceOrder.create({
      data: {
        orderNumber: 'ECO-2024-005',
        customerName: 'James Wilson',
        customerEmail: 'james.wilson@email.com',
        items: JSON.stringify([{ productId: prodLuxuryChronograph.id, name: 'Luxury Chronograph', quantity: 1, unitPrice: 35000.0 }]),
        totalAmount: 37800.0,
        shippingAddress: '740 Park Avenue, New York, NY 10021, USA',
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      },
    }),
  ]);

  // ─── BOM COMPONENTS ───────────────────────────────────────────────
  console.log('Creating BOM components...');
  await Promise.all([
    // Classic Gold Chain (GLD-001) components
    prisma.bomComponent.create({ data: { productId: prodGoldChain.id, componentId: prodGoldPendantNecklace.id, quantity: 1.2 } }),
    prisma.bomComponent.create({ data: { productId: prodGoldChain.id, componentId: prodSilverStuds.id, quantity: 1.0 } }),

    // Solitaire Engagement Ring (DMD-001) components
    prisma.bomComponent.create({ data: { productId: prodSolitaireRing.id, componentId: prodGoldPendantNecklace.id, quantity: 0.8 } }),
    prisma.bomComponent.create({ data: { productId: prodSolitaireRing.id, componentId: prodDiamondTennisBracelet.id, quantity: 0.15 } }),

    // Diamond Halo Ring (DMD-002) components
    prisma.bomComponent.create({ data: { productId: prodDiamondHaloRing.id, componentId: prodGoldPendantNecklace.id, quantity: 0.6 } }),
    prisma.bomComponent.create({ data: { productId: prodDiamondHaloRing.id, componentId: prodDiamondTennisBracelet.id, quantity: 0.25 } }),

    // Sterling Silver Hoops (SLV-001) components
    prisma.bomComponent.create({ data: { productId: prodSilverHoops.id, componentId: prodSilverDropEarrings.id, quantity: 2.0 } }),

    // Platinum Wedding Band (PLT-001) components
    prisma.bomComponent.create({ data: { productId: prodPlatinumWeddingBand.id, componentId: prodPlatinumChainNecklace.id, quantity: 0.5 } }),

    // Platinum Link Bracelet (PLT-002) components
    prisma.bomComponent.create({ data: { productId: prodPlatinumLinkBracelet.id, componentId: prodPlatinumChainNecklace.id, quantity: 3.0 } }),

    // Akoya Pearl Necklace (PRL-001) components
    prisma.bomComponent.create({ data: { productId: prodAkoyaPearlNecklace.id, componentId: prodFreshwaterPearlStrand.id, quantity: 8.0 } }),
    prisma.bomComponent.create({ data: { productId: prodAkoyaPearlNecklace.id, componentId: prodSilverDropEarrings.id, quantity: 1.0 } }),

    // Pearl Drop Earrings (PRL-002) components
    prisma.bomComponent.create({ data: { productId: prodPearlDropEarrings.id, componentId: prodFreshwaterPearlStrand.id, quantity: 2.0 } }),

    // Ruby Pendant Necklace (GEM-001) components
    prisma.bomComponent.create({ data: { productId: prodRubyPendant.id, componentId: prodGoldPendantNecklace.id, quantity: 1.0 } }),

    // Sapphire Cocktail Ring (GEM-002) components
    prisma.bomComponent.create({ data: { productId: prodSapphireCocktailRing.id, componentId: prodGoldPendantNecklace.id, quantity: 0.7 } }),

    // Emerald Drop Earrings (GEM-003) components
    prisma.bomComponent.create({ data: { productId: prodEmeraldDropEarrings.id, componentId: prodSilverDropEarrings.id, quantity: 2.0 } }),

    // Classic Bridal Set (BRD-001) components
    prisma.bomComponent.create({ data: { productId: prodClassicBridalSet.id, componentId: prodSolitaireRing.id, quantity: 1.0 } }),
    prisma.bomComponent.create({ data: { productId: prodClassicBridalSet.id, componentId: prodPlatinumWeddingBand.id, quantity: 1.0 } }),
  ]);

  // ─── WORK ORDERS ──────────────────────────────────────────────────
  console.log('Creating work orders...');
  const wo1 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-001',
      status: 'completed',
      priority: 'high',
      plannedStart: new Date('2024-01-15'),
      plannedEnd: new Date('2024-01-22'),
      actualStart: new Date('2024-01-15'),
      actualEnd: new Date('2024-01-21'),
      notes: 'Custom Solitaire Engagement Ring for VIP client. Completed ahead of schedule. GIA certificate attached.',
    },
  });

  const wo2 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-002',
      status: 'in_progress',
      priority: 'high',
      plannedStart: new Date('2024-02-01'),
      plannedEnd: new Date('2024-02-10'),
      actualStart: new Date('2024-02-01'),
      notes: 'Classic Bridal Set production run for Miami wholesale order. Currently at assembly stage.',
    },
  });

  const wo3 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-003',
      status: 'in_progress',
      priority: 'medium',
      plannedStart: new Date('2024-02-05'),
      plannedEnd: new Date('2024-02-12'),
      actualStart: new Date('2024-02-06'),
      notes: 'Sterling Silver Hoops restock batch. Slight delay due to silver wire supply.',
    },
  });

  const wo4 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-004',
      status: 'planned',
      priority: 'medium',
      plannedStart: new Date('2024-03-01'),
      plannedEnd: new Date('2024-03-08'),
      notes: 'Akoya Pearl Necklace assembly for Dubai inventory replenishment. Awaiting pearl delivery from Tahiti.',
    },
  });

  const wo5 = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-2024-005',
      status: 'planned',
      priority: 'low',
      plannedStart: new Date('2024-03-10'),
      plannedEnd: new Date('2024-03-18'),
      notes: 'Ruby Pendant Necklace small batch for upcoming Valentine collection showcase.',
    },
  });

  // ─── WORK ORDER PRODUCTS ──────────────────────────────────────────
  console.log('Creating work order products...');
  await Promise.all([
    prisma.workOrderProduct.create({ data: { workOrderId: wo1.id, productId: prodSolitaireRing.id, targetQty: 2, completedQty: 2, wastageQty: 0.3 } }),
    prisma.workOrderProduct.create({ data: { workOrderId: wo2.id, productId: prodClassicBridalSet.id, targetQty: 5, completedQty: 2, wastageQty: 0.5 } }),
    prisma.workOrderProduct.create({ data: { workOrderId: wo3.id, productId: prodSilverHoops.id, targetQty: 50, completedQty: 30, wastageQty: 2.5 } }),
    prisma.workOrderProduct.create({ data: { workOrderId: wo4.id, productId: prodAkoyaPearlNecklace.id, targetQty: 8, completedQty: 0, wastageQty: 0 } }),
    prisma.workOrderProduct.create({ data: { workOrderId: wo5.id, productId: prodRubyPendant.id, targetQty: 4, completedQty: 0, wastageQty: 0 } }),
    prisma.workOrderProduct.create({ data: { workOrderId: wo2.id, productId: prodPlatinumWeddingBand.id, targetQty: 5, completedQty: 3, wastageQty: 0.8 } }),
  ]);

  // ─── SHIPMENTS ────────────────────────────────────────────────────
  console.log('Creating shipments...');
  const shipment1 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-001',
      carrier: 'DHL',
      trackingNumber: 'DHL-937465820',
      origin: 'Zurich, Switzerland',
      destination: 'New York, USA',
      status: 'delivered',
      shippedDate: new Date('2024-01-10'),
      deliveredDate: new Date('2024-01-14'),
    },
  });

  const shipment2 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-002',
      carrier: 'FedEx',
      trackingNumber: 'FX-7845231960',
      origin: 'Antwerp, Belgium',
      destination: 'New York, USA',
      status: 'in_transit',
      shippedDate: new Date('2024-02-18'),
    },
  });

  const shipment3 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-003',
      carrier: 'Aramex',
      trackingNumber: 'ARX-5290183746',
      origin: 'Papeete, Tahiti',
      destination: 'Dubai, UAE',
      status: 'in_transit',
      shippedDate: new Date('2024-02-20'),
    },
  });

  const shipment4 = await prisma.shipment.create({
    data: {
      shipmentNumber: 'SHP-2024-004',
      carrier: 'UPS',
      trackingNumber: 'UPS-1Z999AA10123456784',
      origin: 'Milan, Italy',
      destination: 'London, United Kingdom',
      status: 'pending',
    },
  });

  // ─── SHIPMENT ITEMS ───────────────────────────────────────────────
  console.log('Creating shipment items...');
  await Promise.all([
    prisma.shipmentItem.create({ data: { shipmentId: shipment1.id, productId: prodGoldChain.id, quantity: 30 } }),
    prisma.shipmentItem.create({ data: { shipmentId: shipment2.id, productId: prodSolitaireRing.id, quantity: 4 } }),
    prisma.shipmentItem.create({ data: { shipmentId: shipment2.id, productId: prodDiamondHaloRing.id, quantity: 3 } }),
    prisma.shipmentItem.create({ data: { shipmentId: shipment3.id, productId: prodAkoyaPearlNecklace.id, quantity: 4 } }),
    prisma.shipmentItem.create({ data: { shipmentId: shipment3.id, productId: prodFreshwaterPearlStrand.id, quantity: 8 } }),
    prisma.shipmentItem.create({ data: { shipmentId: shipment4.id, productId: prodSilverHoops.id, quantity: 40 } }),
    prisma.shipmentItem.create({ data: { shipmentId: shipment4.id, productId: prodSilverDropEarrings.id, quantity: 28 } }),
  ]);

  // ─── DEMAND FORECASTS ─────────────────────────────────────────────
  console.log('Creating demand forecasts...');
  await Promise.all([
    prisma.demandForecast.create({ data: { productId: prodGoldChain.id, period: '2024-Q2', predictedDemand: 45.0, confidence: 0.87, model: 'Prophet' } }),
    prisma.demandForecast.create({ data: { productId: prodGoldChain.id, period: '2024-Q3', predictedDemand: 52.0, confidence: 0.82, model: 'ARIMA' } }),
    prisma.demandForecast.create({ data: { productId: prodSolitaireRing.id, period: '2024-Q2', predictedDemand: 12.0, confidence: 0.79, model: 'Prophet' } }),
    prisma.demandForecast.create({ data: { productId: prodSolitaireRing.id, period: '2024-Q3', predictedDemand: 15.0, confidence: 0.74, model: 'MovingAverage' } }),
    prisma.demandForecast.create({ data: { productId: prodSilverHoops.id, period: '2024-Q2', predictedDemand: 80.0, confidence: 0.91, model: 'Prophet' } }),
    prisma.demandForecast.create({ data: { productId: prodSilverHoops.id, period: '2024-Q3', predictedDemand: 65.0, confidence: 0.88, model: 'ARIMA' } }),
    prisma.demandForecast.create({ data: { productId: prodPlatinumWeddingBand.id, period: '2024-Q2', predictedDemand: 18.0, confidence: 0.83, model: 'MovingAverage' } }),
    prisma.demandForecast.create({ data: { productId: prodAkoyaPearlNecklace.id, period: '2024-Q2', predictedDemand: 10.0, confidence: 0.76, model: 'Prophet' } }),
    prisma.demandForecast.create({ data: { productId: prodSwissWatch.id, period: '2024-Q2', predictedDemand: 8.0, confidence: 0.72, model: 'ARIMA' } }),
    prisma.demandForecast.create({ data: { productId: prodRubyPendant.id, period: '2024-Q2', predictedDemand: 9.0, confidence: 0.68, model: 'Prophet' } }),
    prisma.demandForecast.create({ data: { productId: prodClassicBridalSet.id, period: '2024-Q2', predictedDemand: 7.0, confidence: 0.81, model: 'Prophet' } }),
    prisma.demandForecast.create({ data: { productId: prodDiamondTennisBracelet.id, period: '2024-Q2', predictedDemand: 5.0, confidence: 0.65, model: 'MovingAverage' } }),
  ]);

  // ─── AUDIT LOGS ───────────────────────────────────────────────────
  console.log('Creating audit logs...');
  await Promise.all([
    prisma.auditLog.create({ data: { user: 'Alex Carter', action: 'create', module: 'purchase_order', details: 'Created PO-2024-001 for Swiss Gold Refinery — 30x Classic Gold Chain' } }),
    prisma.auditLog.create({ data: { user: 'Sarah Mitchell', action: 'approve', module: 'purchase_order', details: 'Approved PO-2024-004 for Tahiti Pearl House — $15,200.00' } }),
    prisma.auditLog.create({ data: { user: 'Alex Carter', action: 'update', module: 'inventory', details: 'Received 30x Classic Gold Chain into NYC-VLT from PO-2024-001' } }),
    prisma.auditLog.create({ data: { user: 'David Chen', action: 'create', module: 'pos_transaction', details: 'POS sale POS-TXN-005 — Swiss Automatic Watch, $9,180.00 total' } }),
    prisma.auditLog.create({ data: { user: 'Sarah Mitchell', action: 'create', module: 'work_order', details: 'Created WO-2024-002 — Classic Bridal Set production for Miami order' } }),
    prisma.auditLog.create({ data: { user: 'Alex Carter', action: 'update', module: 'sales_order', details: 'Updated SO-2024-002 status to shipped for Sophie Laurent Paris boutique' } }),
    prisma.auditLog.create({ data: { user: 'David Chen', action: 'create', module: 'pos_transaction', details: 'POS sale POS-TXN-007 — Ruby Pendant Necklace, $7,344.00 total' } }),
    prisma.auditLog.create({ data: { user: 'Sarah Mitchell', action: 'create', module: 'ecommerce_order', details: 'E-commerce order ECO-2024-003 — Classic Bridal Set to Tokyo, $19,980.00' } }),
    prisma.auditLog.create({ data: { user: 'Alex Carter', action: 'update', module: 'shipment', details: 'Shipment SHP-2024-001 delivered from Zurich to New York via DHL' } }),
    prisma.auditLog.create({ data: { user: 'Sarah Mitchell', action: 'create', module: 'demand_forecast', details: 'Generated Q2 2024 demand forecasts using Prophet model for 6 products' } }),
  ]);

  console.log('GoldGem ERP database seeded successfully!');
  console.log('Summary:');
  console.log('  - Users: 3');
  console.log('  - Categories: 8');
  console.log('  - Products: 24');
  console.log('  - Warehouses: 3');
  console.log('  - Inventory Items: 25');
  console.log('  - Inventory Movements: 8');
  console.log('  - Suppliers: 5');
  console.log('  - Purchase Orders: 6');
  console.log('  - Purchase Order Items: 11');
  console.log('  - Customers: 8');
  console.log('  - Sales Orders: 5');
  console.log('  - POS Transactions: 8');
  console.log('  - E-Commerce Orders: 5');
  console.log('  - BOM Components: 17');
  console.log('  - Work Orders: 5');
  console.log('  - Work Order Products: 6');
  console.log('  - Shipments: 4');
  console.log('  - Shipment Items: 7');
  console.log('  - Demand Forecasts: 12');
  console.log('  - Audit Logs: 10');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
