/*
  Warnings:

  - You are about to drop the column `original_language` on the `dictionary_entries` table. All the data in the column will be lost.
  - You are about to drop the column `original_word` on the `dictionary_entries` table. All the data in the column will be lost.
  - You are about to drop the column `turkish_translation` on the `dictionary_entries` table. All the data in the column will be lost.
  - Added the required column `english_word` to the `dictionary_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `russian_word` to the `dictionary_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turkish_word` to the `dictionary_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dictionary_entries" DROP COLUMN "original_language",
DROP COLUMN "original_word",
DROP COLUMN "turkish_translation",
ADD COLUMN     "english_word" TEXT NOT NULL,
ADD COLUMN     "russian_word" TEXT NOT NULL,
ADD COLUMN     "turkish_word" TEXT NOT NULL;
