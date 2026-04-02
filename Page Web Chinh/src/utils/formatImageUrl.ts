import { API_HOST } from "./apiConfig";

export const getImageUrl = (image: string) => {
  if (!image) return '/assets/product image 1.jpg';
  if (image.startsWith('http')) return image;
  
  // Các ảnh mẫu template cũ (chứa từ khoá fix cứng)
  const isLocalAsset = image.startsWith('product') || 
                       image.startsWith('luxury') || 
                       image.startsWith('single') || 
                       image.startsWith('banner') ||
                       image.startsWith('shopbanner') ||
                       image.match(/^\d+\.(png|jpg|jpeg)$/); // Các file số hóa đơn giản như 1.png
                       
  if (isLocalAsset) {
      return `/assets/${image}`;
  }
  
  // Ảnh thật từ Backend Admin 
  return `${API_HOST}/uploads/product_images/${image}`;
};
