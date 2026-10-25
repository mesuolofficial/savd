/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `GalleryAlbum` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `GalleryAlbum` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GalleryAlbum" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GalleryAlbum_slug_key" ON "GalleryAlbum"("slug");
