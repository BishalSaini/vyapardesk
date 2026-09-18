import { PrismaClient, Role, Unit, PaymentMethod, PaymentStatus, SaleStatus, PurchaseStatus, StockTransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Shop Settings ──────────────────────────────────────────────────────────
  await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'ABC General Store',
      address: 'Shop No. 12, Sector 5, Navi Mumbai, Maharashtra - 400703',
      phone: '9876543210',
      email: 'abc.store@gmail.com',
      gstin: '27AABCS1429B1Z1',
      invoicePrefix: 'INV',
      invoiceFooter: 'Thank you for shopping with us! Come again!',
      currency: 'INR',
      taxName: 'GST',
    },
  });

  // ─── Users (Custom NextAuth system) ────────────────────────────────
  // These are seeded users for login.
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const cashierPassword = await bcrypt.hash('Cashier@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: adminPassword },
    create: {
      password: adminPassword,
      name: 'Rajesh Kumar',
      email: 'admin@example.com',
      role: Role.ADMIN,
    },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@example.com' },
    update: { password: cashierPassword },
    create: {
      password: cashierPassword,
      name: 'Priya Sharma',
      email: 'cashier@example.com',
      role: Role.CASHIER,
    },
  });

  console.log('✅ Users created');

  // ─── Categories ─────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Grocery' },
      update: {},
      create: { name: 'Grocery', description: 'Daily grocery items like rice, flour, sugar, salt' },
    }),
    prisma.category.upsert({
      where: { name: 'Beverages' },
      update: {},
      create: { name: 'Beverages', description: 'Drinks, juices, cold drinks, tea, coffee' },
    }),
    prisma.category.upsert({
      where: { name: 'Snacks' },
      update: {},
      create: { name: 'Snacks', description: 'Biscuits, chips, namkeen, instant noodles' },
    }),
    prisma.category.upsert({
      where: { name: 'Household' },
      update: {},
      create: { name: 'Household', description: 'Cleaning supplies, detergents, utensil cleaners' },
    }),
    prisma.category.upsert({
      where: { name: 'Personal Care' },
      update: {},
      create: { name: 'Personal Care', description: 'Soap, shampoo, toothpaste, skincare' },
    }),
  ]);

  const [grocery, beverages, snacks, household, personalCare] = categories;
  console.log('✅ Categories created');

  // ─── Suppliers ──────────────────────────────────────────────────────────────
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: 'sup_nestle' },
      update: {},
      create: {
        id: 'sup_nestle',
        name: 'Rahul Gupta',
        companyName: 'Nestle India Ltd.',
        phone: '9321456789',
        email: 'rahul@nestledistrib.com',
        address: 'Ghatkopar East, Mumbai - 400077',
        gstin: '27AAACN0012H1ZK',
        notes: 'Primary supplier for Maggi and dairy products',
      },
    }),
    prisma.supplier.upsert({
      where: { id: 'sup_parle' },
      update: {},
      create: {
        id: 'sup_parle',
        name: 'Sunita Mehta',
        companyName: 'Parle Products Pvt. Ltd.',
        phone: '9867234512',
        email: 'sunita@parledist.com',
        address: 'Vile Parle West, Mumbai - 400056',
        gstin: '27AAACP4598D1ZH',
        notes: 'Biscuits and snacks supplier',
      },
    }),
    prisma.supplier.upsert({
      where: { id: 'sup_tata' },
      update: {},
      create: {
        id: 'sup_tata',
        name: 'Amit Singh',
        companyName: 'Tata Consumer Products',
        phone: '9456123789',
        email: 'amit@tatadist.in',
        address: 'Thane West, Thane - 400601',
        gstin: '27AAACT1922N1ZD',
        notes: 'Salt, tea and consumer goods',
      },
    }),
    prisma.supplier.upsert({
      where: { id: 'sup_hul' },
      update: {},
      create: {
        id: 'sup_hul',
        name: 'Deepak Verma',
        companyName: 'Hindustan Unilever Ltd.',
        phone: '9123456780',
        email: 'deepak@huldist.com',
        address: 'Andheri East, Mumbai - 400069',
        gstin: '27AAAAH0166A1ZN',
        notes: 'Soap, shampoo, detergent and personal care',
      },
    }),
    prisma.supplier.upsert({
      where: { id: 'sup_cocacola' },
      update: {},
      create: {
        id: 'sup_cocacola',
        name: 'Vikas Joshi',
        companyName: 'Coca-Cola India Pvt. Ltd.',
        phone: '9876012345',
        email: 'vikas@cocacoladist.in',
        address: 'Navi Mumbai, Maharashtra - 400703',
        gstin: '27AAAAC9659M1ZP',
        notes: 'Soft drinks and beverages',
      },
    }),
  ]);

  const [nestleSupplier, parleSupplier, tataSupplier, hulSupplier, colaSupplier] = suppliers;
  console.log('✅ Suppliers created');

  // ─── Products ───────────────────────────────────────────────────────────────
  const productData = [
    // Grocery
    { name: 'Tata Salt (1 Kg)', sku: 'TATA-SALT-1KG', barcode: '8901434000017', categoryId: grocery.id, supplierId: tataSupplier.id, purchasePrice: 18, sellingPrice: 22, taxPercent: 0, currentStock: 85, minStockLevel: 20, unit: Unit.KG },
    { name: 'India Gate Basmati Rice (5 Kg)', sku: 'IGATE-RICE-5KG', barcode: '8901440012016', categoryId: grocery.id, supplierId: tataSupplier.id, purchasePrice: 290, sellingPrice: 340, taxPercent: 5, currentStock: 40, minStockLevel: 10, unit: Unit.KG },
    { name: 'Fortune Refined Oil (1 Litre)', sku: 'FORT-OIL-1L', barcode: '8901127111018', categoryId: grocery.id, supplierId: tataSupplier.id, purchasePrice: 120, sellingPrice: 140, taxPercent: 5, currentStock: 50, minStockLevel: 15, unit: Unit.LITRE },
    { name: 'Aashirvaad Atta (5 Kg)', sku: 'AASH-ATTA-5KG', barcode: '8901725127052', categoryId: grocery.id, supplierId: tataSupplier.id, purchasePrice: 210, sellingPrice: 250, taxPercent: 0, currentStock: 35, minStockLevel: 10, unit: Unit.KG },
    { name: 'Tata Tea Premium (250g)', sku: 'TATA-TEA-250G', barcode: '8901434000482', categoryId: grocery.id, supplierId: tataSupplier.id, purchasePrice: 95, sellingPrice: 115, taxPercent: 5, currentStock: 60, minStockLevel: 15, unit: Unit.PACKET },

    // Snacks
    { name: 'Maggi Noodles 2-Minute (70g)', sku: 'MAGGI-70G', barcode: '8901058500394', categoryId: snacks.id, supplierId: nestleSupplier.id, purchasePrice: 12, sellingPrice: 15, taxPercent: 12, currentStock: 200, minStockLevel: 50, unit: Unit.PIECE },
    { name: 'Parle-G Biscuits (100g)', sku: 'PARLEG-100G', barcode: '8901319512013', categoryId: snacks.id, supplierId: parleSupplier.id, purchasePrice: 8, sellingPrice: 10, taxPercent: 12, currentStock: 300, minStockLevel: 80, unit: Unit.PIECE },
    { name: 'Hide & Seek Biscuits (120g)', sku: 'HSEEK-120G', barcode: '8901319540023', categoryId: snacks.id, supplierId: parleSupplier.id, purchasePrice: 22, sellingPrice: 28, taxPercent: 12, currentStock: 100, minStockLevel: 30, unit: Unit.PIECE },
    { name: 'Lays Classic Chips (26g)', sku: 'LAYS-26G', barcode: '8901491502001', categoryId: snacks.id, supplierId: parleSupplier.id, purchasePrice: 10, sellingPrice: 20, taxPercent: 12, currentStock: 150, minStockLevel: 40, unit: Unit.PIECE },
    { name: 'Kurkure Masala Munch (65g)', sku: 'KURK-65G', barcode: '8901491120012', categoryId: snacks.id, supplierId: parleSupplier.id, purchasePrice: 15, sellingPrice: 20, taxPercent: 12, currentStock: 120, minStockLevel: 30, unit: Unit.PIECE },

    // Beverages
    { name: 'Coca-Cola (600ml)', sku: 'COCA-600ML', barcode: '5449000000996', categoryId: beverages.id, supplierId: colaSupplier.id, purchasePrice: 32, sellingPrice: 40, taxPercent: 28, currentStock: 72, minStockLevel: 24, unit: Unit.PIECE },
    { name: 'Pepsi (600ml)', sku: 'PEPSI-600ML', barcode: '0012000001765', categoryId: beverages.id, supplierId: colaSupplier.id, purchasePrice: 32, sellingPrice: 40, taxPercent: 28, currentStock: 60, minStockLevel: 24, unit: Unit.PIECE },
    { name: 'Sprite (600ml)', sku: 'SPRITE-600ML', barcode: '5449000014527', categoryId: beverages.id, supplierId: colaSupplier.id, purchasePrice: 32, sellingPrice: 40, taxPercent: 28, currentStock: 48, minStockLevel: 24, unit: Unit.PIECE },
    { name: 'Amul Taaza Milk (500ml)', sku: 'AMUL-MILK-500', barcode: '8901063014238', categoryId: beverages.id, supplierId: nestleSupplier.id, purchasePrice: 26, sellingPrice: 30, taxPercent: 0, currentStock: 20, minStockLevel: 10, unit: Unit.PIECE },
    { name: 'Red Bull Energy Drink (250ml)', sku: 'REDBULL-250ML', barcode: '9002490100070', categoryId: beverages.id, supplierId: colaSupplier.id, purchasePrice: 90, sellingPrice: 120, taxPercent: 28, currentStock: 36, minStockLevel: 12, unit: Unit.PIECE },

    // Household
    { name: 'Surf Excel Matic (1 Kg)', sku: 'SURF-1KG', barcode: '8901030502766', categoryId: household.id, supplierId: hulSupplier.id, purchasePrice: 175, sellingPrice: 210, taxPercent: 18, currentStock: 30, minStockLevel: 8, unit: Unit.KG },
    { name: 'Vim Dishwash Bar (250g)', sku: 'VIM-250G', barcode: '8901030016756', categoryId: household.id, supplierId: hulSupplier.id, purchasePrice: 20, sellingPrice: 28, taxPercent: 18, currentStock: 60, minStockLevel: 15, unit: Unit.PIECE },
    { name: 'Harpic Power Plus (500ml)', sku: 'HARPIC-500ML', barcode: '8901030916507', categoryId: household.id, supplierId: hulSupplier.id, purchasePrice: 85, sellingPrice: 110, taxPercent: 18, currentStock: 25, minStockLevel: 8, unit: Unit.PIECE },

    // Personal Care
    { name: 'Dove Soap (100g)', sku: 'DOVE-100G', barcode: '8901030189546', categoryId: personalCare.id, supplierId: hulSupplier.id, purchasePrice: 42, sellingPrice: 55, taxPercent: 18, currentStock: 80, minStockLevel: 20, unit: Unit.PIECE },
    { name: 'Colgate Strong Teeth (200g)', sku: 'COLGATE-200G', barcode: '8901314001059', categoryId: personalCare.id, supplierId: hulSupplier.id, purchasePrice: 65, sellingPrice: 85, taxPercent: 18, currentStock: 55, minStockLevel: 15, unit: Unit.PIECE },
  ];

  const products: any[] = [];
  for (const p of productData) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        categoryId: p.categoryId,
        supplierId: p.supplierId,
        purchasePrice: new Decimal(p.purchasePrice),
        sellingPrice: new Decimal(p.sellingPrice),
        taxPercent: new Decimal(p.taxPercent),
        currentStock: p.currentStock,
        minStockLevel: p.minStockLevel,
        unit: p.unit,
      },
    });
    products.push(product);
  }

  console.log(`✅ ${products.length} Products created`);

  // ─── Customers ──────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { phone: '9823456701' },
      update: {},
      create: { name: 'Ramesh Yadav', phone: '9823456701', email: 'ramesh@gmail.com', address: 'Sector 7, Navi Mumbai', outstandingAmount: 0 },
    }),
    prisma.customer.upsert({
      where: { phone: '9845123456' },
      update: {},
      create: { name: 'Sunita Patel', phone: '9845123456', email: 'sunita.p@gmail.com', address: 'Kopar Khairane, Navi Mumbai', outstandingAmount: 450 },
    }),
    prisma.customer.upsert({
      where: { phone: '9701234567' },
      update: {},
      create: { name: 'Ajay Tiwari', phone: '9701234567', email: '', address: 'Vashi, Navi Mumbai', outstandingAmount: 0 },
    }),
    prisma.customer.upsert({
      where: { phone: '9988776655' },
      update: {},
      create: { name: 'Meena Joshi', phone: '9988776655', email: 'meena.j@yahoo.com', address: 'Kharghar, Navi Mumbai', outstandingAmount: 0 },
    }),
    prisma.customer.upsert({
      where: { phone: '9765432109' },
      update: {},
      create: { name: 'Rahul Singh', phone: '9765432109', email: '', address: 'Belapur, Navi Mumbai', outstandingAmount: 250 },
    }),
  ]);

  console.log('✅ Customers created');

  // ─── Purchases ──────────────────────────────────────────────────────────────
  const purchase1 = await prisma.purchase.create({
    data: {
      supplierId: nestleSupplier.id,
      userId: adminUser.id,
      referenceNumber: 'NESTLE-INV-2026-001',
      purchaseDate: new Date('2026-09-01'),
      subtotal: new Decimal(1200),
      tax: new Decimal(144),
      discount: new Decimal(0),
      total: new Decimal(1344),
      paymentStatus: PaymentStatus.PAID,
      status: PurchaseStatus.RECEIVED,
      items: {
        create: [
          { productId: products[5].id, quantity: 100, purchasePrice: new Decimal(12), tax: new Decimal(0), total: new Decimal(1200) },
        ],
      },
    },
  });

  await prisma.stockTransaction.create({
    data: {
      productId: products[5].id,
      userId: adminUser.id,
      type: StockTransactionType.PURCHASE,
      quantity: 100,
      balanceAfter: products[5].currentStock,
      reason: 'Purchase from Nestle India',
      referenceId: purchase1.id,
      referenceType: 'Purchase',
    },
  });

  const purchase2 = await prisma.purchase.create({
    data: {
      supplierId: parleSupplier.id,
      userId: adminUser.id,
      referenceNumber: 'PARLE-INV-2026-015',
      purchaseDate: new Date('2026-09-05'),
      subtotal: new Decimal(2400),
      tax: new Decimal(288),
      discount: new Decimal(50),
      total: new Decimal(2638),
      paymentStatus: PaymentStatus.PAID,
      status: PurchaseStatus.RECEIVED,
      items: {
        create: [
          { productId: products[6].id, quantity: 200, purchasePrice: new Decimal(8), tax: new Decimal(0), total: new Decimal(1600) },
          { productId: products[7].id, quantity: 100, purchasePrice: new Decimal(8), tax: new Decimal(0), total: new Decimal(800) },
        ],
      },
    },
  });

  await prisma.stockTransaction.createMany({
    data: [
      { productId: products[6].id, userId: adminUser.id, type: StockTransactionType.PURCHASE, quantity: 200, balanceAfter: products[6].currentStock, reason: 'Purchase from Parle', referenceId: purchase2.id, referenceType: 'Purchase' },
      { productId: products[7].id, userId: adminUser.id, type: StockTransactionType.PURCHASE, quantity: 100, balanceAfter: products[7].currentStock, reason: 'Purchase from Parle', referenceId: purchase2.id, referenceType: 'Purchase' },
    ],
  });

  console.log('✅ Purchases created');

  // ─── Sales ──────────────────────────────────────────────────────────────────
  // Sale 1 - Cash sale
  const sale1 = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-2026-000001',
      customerId: customers[0].id,
      userId: cashierUser.id,
      subtotal: new Decimal(95),
      discount: new Decimal(0),
      tax: new Decimal(6.78),
      total: new Decimal(101.78),
      paymentStatus: PaymentStatus.PAID,
      status: SaleStatus.COMPLETED,
      createdAt: new Date('2026-09-15T10:30:00'),
      items: {
        create: [
          { productId: products[5].id, quantity: 3, unitPrice: new Decimal(15), discount: new Decimal(0), tax: new Decimal(1.92), total: new Decimal(46.92) },
          { productId: products[6].id, quantity: 5, unitPrice: new Decimal(10), discount: new Decimal(0), tax: new Decimal(3), total: new Decimal(53), },
        ],
      },
      payments: {
        create: [
          { customerId: customers[0].id, amount: new Decimal(101.78), method: PaymentMethod.CASH },
        ],
      },
    },
  });

  await prisma.stockTransaction.createMany({
    data: [
      { productId: products[5].id, userId: cashierUser.id, type: StockTransactionType.SALE, quantity: 3, balanceAfter: products[5].currentStock - 3, reason: 'Sale', referenceId: sale1.id, referenceType: 'Sale' },
      { productId: products[6].id, userId: cashierUser.id, type: StockTransactionType.SALE, quantity: 5, balanceAfter: products[6].currentStock - 5, reason: 'Sale', referenceId: sale1.id, referenceType: 'Sale' },
    ],
  });

  // Sale 2 - Credit sale (customer outstanding)
  const sale2 = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-2026-000002',
      customerId: customers[1].id,
      userId: cashierUser.id,
      subtotal: new Decimal(340),
      discount: new Decimal(0),
      tax: new Decimal(17),
      total: new Decimal(357),
      paymentStatus: PaymentStatus.PARTIAL,
      status: SaleStatus.COMPLETED,
      createdAt: new Date('2026-09-16T14:20:00'),
      items: {
        create: [
          { productId: products[1].id, quantity: 1, unitPrice: new Decimal(340), discount: new Decimal(0), tax: new Decimal(17), total: new Decimal(357) },
        ],
      },
      payments: {
        create: [
          { customerId: customers[1].id, amount: new Decimal(357), method: PaymentMethod.CREDIT },
        ],
      },
    },
  });

  // Sale 3 - UPI
  const sale3 = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-2026-000003',
      customerId: customers[2].id,
      userId: cashierUser.id,
      subtotal: new Decimal(150),
      discount: new Decimal(10),
      tax: new Decimal(16.8),
      total: new Decimal(156.8),
      paymentStatus: PaymentStatus.PAID,
      status: SaleStatus.COMPLETED,
      createdAt: new Date('2026-09-17T09:15:00'),
      items: {
        create: [
          { productId: products[10].id, quantity: 2, unitPrice: new Decimal(40), discount: new Decimal(5), tax: new Decimal(9.52), total: new Decimal(74.52) },
          { productId: products[11].id, quantity: 2, unitPrice: new Decimal(40), discount: new Decimal(5), tax: new Decimal(9.52), total: new Decimal(74.52) },
        ],
      },
      payments: {
        create: [
          { customerId: customers[2].id, amount: new Decimal(156.8), method: PaymentMethod.UPI, reference: 'UPI-REF-00123' },
        ],
      },
    },
  });

  await prisma.stockTransaction.createMany({
    data: [
      { productId: products[10].id, userId: cashierUser.id, type: StockTransactionType.SALE, quantity: 2, balanceAfter: products[10].currentStock - 2, reason: 'Sale', referenceId: sale3.id, referenceType: 'Sale' },
      { productId: products[11].id, userId: cashierUser.id, type: StockTransactionType.SALE, quantity: 2, balanceAfter: products[11].currentStock - 2, reason: 'Sale', referenceId: sale3.id, referenceType: 'Sale' },
    ],
  });

  // Stock adjustment example
  await prisma.stockTransaction.create({
    data: {
      productId: products[13].id,
      userId: adminUser.id,
      type: StockTransactionType.ADJUSTMENT_IN,
      quantity: 5,
      balanceAfter: products[13].currentStock + 5,
      reason: 'Physical stock count - found 5 extra units during inventory audit',
    },
  });

  console.log('✅ Sales and transactions created');
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Demo accounts:');
  console.log('  Admin:   admin@example.com / Admin@123456');
  console.log('  Cashier: cashier@example.com / Cashier@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
