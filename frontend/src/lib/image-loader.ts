import { ImageLoaderProps } from 'next/image';

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
    // If the image is already from Cloudinary, optimize it
    if (src.includes('res.cloudinary.com')) {
        const params = [
            `f_auto`, // Auto format (WebP/AVIF)
            `q_${quality || 75}`, // Quality
            `w_${width}`, // Width
            'c_limit', // Limit to max width
        ];

        // Insert transformations into Cloudinary URL
        const parts = src.split('/upload/');
        if (parts.length === 2) {
            return `${parts[0]}/upload/${params.join(',')}/${parts[1]}`;
        }
    }

    // For non-Cloudinary images, return as-is
    return src;
}
