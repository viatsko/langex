-- AlterTable
ALTER TABLE "dictionary_entries" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
