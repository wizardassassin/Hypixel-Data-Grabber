-- AlterEnum
ALTER TYPE "AggregationRange" ADD VALUE 'oneWeek';

-- AlterTable (manual)
ALTER TABLE "BazaarItemLog" RENAME COLUMN "sellPriceSum" TO "sellPriceTop";
ALTER TABLE "BazaarItemLog" RENAME COLUMN "buyPriceSum" TO "buyPriceTop";
