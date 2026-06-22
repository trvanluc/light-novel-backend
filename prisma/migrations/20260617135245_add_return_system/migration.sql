-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "returnRequestAt" TIMESTAMP(3),
ALTER COLUMN "paymentMethod" SET DEFAULT 'bank';
