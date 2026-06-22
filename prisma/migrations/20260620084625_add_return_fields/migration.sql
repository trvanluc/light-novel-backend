-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "returnRejectReason" TEXT,
ALTER COLUMN "paymentMethod" SET DEFAULT 'cod';
