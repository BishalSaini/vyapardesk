'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser, requireAdmin } from '@/lib/auth';
import { customerSchema, paymentSchema } from '@/lib/validations';
import type { CustomerInput, PaymentInput } from '@/lib/validations';
import { Decimal } from '@prisma/client/runtime/library';

export async function getCustomers() {
  return prisma.customer.findMany({
    include: {
      _count: { select: { sales: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: 'desc' },
        include: { payments: true },
        take: 20,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
}

export async function createCustomer(data: CustomerInput) {
  await requireUser();
  const validated = customerSchema.parse(data);

  const existing = await prisma.customer.findUnique({ where: { phone: validated.phone } });
  if (existing) {
    throw new Error('A customer with this phone number already exists');
  }

  const customer = await prisma.customer.create({ data: validated });
  revalidatePath('/customers');
  return { success: true, customer };
}

export async function updateCustomer(id: string, data: CustomerInput) {
  await requireUser();
  const validated = customerSchema.parse(data);

  const existing = await prisma.customer.findFirst({
    where: { phone: validated.phone, NOT: { id } },
  });
  if (existing) {
    throw new Error('A customer with this phone number already exists');
  }

  const customer = await prisma.customer.update({ where: { id }, data: validated });
  revalidatePath('/customers');
  revalidatePath(`/customers/${id}`);
  return { success: true, customer };
}

export async function recordCustomerPayment(data: PaymentInput) {
  await requireUser();
  const validated = paymentSchema.parse(data);

  const customer = await prisma.customer.findUnique({ where: { id: validated.customerId } });
  if (!customer) throw new Error('Customer not found');

  const outstanding = parseFloat(customer.outstandingAmount.toString());
  if (validated.amount > outstanding) {
    throw new Error(`Payment amount (₹${validated.amount}) cannot exceed outstanding balance (₹${outstanding.toFixed(2)})`);
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        customerId: validated.customerId,
        amount: new Decimal(validated.amount),
        method: validated.method as any,
        reference: validated.reference,
        notes: validated.notes,
      },
    }),
    prisma.customer.update({
      where: { id: validated.customerId },
      data: {
        outstandingAmount: { decrement: new Decimal(validated.amount) },
      },
    }),
  ]);

  revalidatePath(`/customers/${validated.customerId}`);
  revalidatePath('/customers');
  return { success: true };
}

export async function searchCustomers(query: string) {
  return prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
      ],
    },
    take: 10,
    orderBy: { name: 'asc' },
  });
}
