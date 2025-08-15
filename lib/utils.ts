import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(thumbnail: string | null): string {
  if (!thumbnail) {
    return '/placeholder-asset.svg';
  }
  
  // If it's already a full URL (S3 or other CDN), return as is
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
    return thumbnail;
  }
  
  // Handle common test/placeholder filenames that don't exist
  const testFilenames = [
    'forest-thumb.png',
    'magic-thumb.png', 
    'knight-thumb.png',
    'placeholder.png',
    'test-thumb.png'
  ];
  
  if (testFilenames.some(testName => thumbnail.includes(testName))) {
    console.warn(`Test thumbnail detected: ${thumbnail}, using placeholder`);
    return '/placeholder-asset.svg';
  }
  
  // Legacy support: If it's a relative path starting with /uploads/, construct the full URL
  // This handles assets uploaded before S3 integration
  if (thumbnail.startsWith('/uploads/')) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${API_BASE_URL}${thumbnail}`;
  }
  
  // Legacy support: If it's just a filename, construct the full URL
  // This handles assets uploaded before S3 integration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${API_BASE_URL}/uploads/${thumbnail}`;
}
