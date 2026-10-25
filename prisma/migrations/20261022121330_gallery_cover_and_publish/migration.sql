-- AlterTable
ALTER TABLE "GalleryAlbum" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;
