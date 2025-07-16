/**
 * Cloudinary image mappings for local images
 * This file maps local image paths to their Cloudinary URLs
 */

export const cloudinaryMapping: Record<string, string> = {
  // General images
  "/images/author-avatar.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678532/blog/misc/author-avatar-svg.jpg",
  "/images/default-avatar.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678535/blog/misc/default-avatar.png",
  "/images/project-placeholder.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678537/blog/misc/project-placeholder.png",
  
  // Book covers
  "/book-covers/02fd353c.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678539/blog/books/02fd353c.jpg",
  "/book-covers/044e3b4d.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678541/blog/books/044e3b4d.png",
  "/book-covers/067d1bb6.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678544/blog/books/067d1bb6.jpg",
  "/book-covers/17dedee9.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678545/blog/books/17dedee9.jpg",
  "/book-covers/1bcb7894.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678549/blog/books/1bcb7894.jpg",
  "/book-covers/3177aeeb.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678552/blog/books/3177aeeb.jpg",
  "/book-covers/495cf3d1.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678554/blog/books/495cf3d1.jpg",
  "/book-covers/49ed8c22.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678556/blog/books/49ed8c22.jpg",
  "/book-covers/5384897f.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678558/blog/books/5384897f.jpg",
  "/book-covers/9b3862a7.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678560/blog/books/9b3862a7.jpg",
  "/book-covers/b9a17e98.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678562/blog/books/b9a17e98.jpg",
  "/book-covers/c61425e9.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678564/blog/books/c61425e9.png",
  "/book-covers/cdb928ea.jpg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678567/blog/books/cdb928ea.jpg",
  "/book-covers/dd06429a.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678568/blog/books/dd06429a.jpg",
  "/book-covers/de1ad63b.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678570/blog/books/de1ad63b.jpg",
  "/book-covers/de81bead.svg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678572/blog/books/de81bead.jpg",
  "/book-covers/fbba2176.jpg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678574/blog/books/fbba2176.jpg",
  
  // Failed uploads - fallback to author avatar SVG
  "/images/author-avatar.jpg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678532/blog/misc/author-avatar-svg.jpg",
  "/book-covers/3177aeeb.jpg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678552/blog/books/3177aeeb.jpg",
  "/book-covers/b9a17e98.jpg": "https://res.cloudinary.com/dquszsj2f/image/upload/v1752678562/blog/books/b9a17e98.jpg"
};

/**
 * Get Cloudinary URL for a local image path
 */
export function getCloudinaryUrl(localPath: string): string {
  // Already a Cloudinary URL
  if (localPath?.includes('cloudinary.com')) {
    return localPath;
  }
  
  // Check mapping
  const mappedUrl = cloudinaryMapping[localPath];
  if (mappedUrl) {
    return mappedUrl;
  }
  
  // Return original path as fallback
  return localPath;
}