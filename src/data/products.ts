/**
 * Redwan Mart — product catalogue.
 *
 * Single source of truth for the storefront. Imagery comes from the official
 * Redwan Mart product creatives in /public/products.
 *
 * ⚠️ PRICES ARE PLACEHOLDERS. Confirm every `price` / `compareAt` value below
 * before taking real orders. Everything else (model numbers, dimensions, age
 * rating) is taken directly from the official product cards.
 */

export interface Product {
  id: string;
  model: string;
  name: string;
  series: string;
  tagline: string;
  /** Price in BDT — PLACEHOLDER, confirm before launch. */
  price: number;
  /** Was-price for the strikethrough — PLACEHOLDER. */
  compareAt?: number;
  image: string;
  imageWebp: string;
  thumb: string;
  size: string;
  ages: string;
  pieces: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  badge?: string;
  description: string;
  highlights: string[];
}

export const CURRENCY = '৳';

export const products: Product[] = [
  {
    id: 'q5047',
    model: 'Q5047',
    name: 'Hero Block — Dark Knight Edition',
    series: 'Hero Block',
    tagline: 'Build · Play · Display',
    price: 690,
    compareAt: 890,
    image: '/products/q5047.jpg',
    imageWebp: '/products/q5047.webp',
    thumb: '/products/q5047-sm.webp',
    size: '3.2 × 4.0 × 6.2 cm',
    ages: '14+',
    pieces: 'Micro bricks',
    rating: 4.9,
    reviews: 42,
    inStock: true,
    featured: true,
    badge: 'Best seller',
    description:
      'The caped defender rendered in micro bricks, cape and cowl included. A dense, satisfying build that lands as a display piece the moment it is finished — clean silhouette, crisp colour blocking, and a base that sits flat on any shelf.',
    highlights: [
      'Sculpted cowl and cape in micro-brick detail',
      'Snap-tight bricks that hold their shape once built',
      'Illustrated step-by-step assembly guide in the box',
      'Finished figure stands 6.2 cm tall',
    ],
  },
  {
    id: 'f3029',
    model: 'F3029',
    name: 'Spidey Block — Web Edition',
    series: 'Spidey Block',
    tagline: 'Build · Play · Display',
    price: 650,
    compareAt: 850,
    image: '/products/f3029.jpg',
    imageWebp: '/products/f3029.webp',
    thumb: '/products/f3029-sm.webp',
    size: '6.0 × 4.0 × 4.0 cm',
    ages: '14+',
    pieces: 'Micro bricks',
    rating: 4.8,
    reviews: 37,
    inStock: true,
    featured: true,
    badge: 'Fan favourite',
    description:
      'The classic red-and-blue web-slinger in micro-brick form. Bold mask lenses, clean panel lines, and a poseable stance that reads instantly from across the room.',
    highlights: [
      'Signature mask lenses built from precision micro bricks',
      'Red and blue colourway true to the classic suit',
      'Sturdy footing — no stand required',
      'Finished figure stands 6.0 cm tall',
    ],
  },
  {
    id: 'f3024',
    model: 'F3024',
    name: 'Hero Block — Shadow Symbiote Edition',
    series: 'Hero Block',
    tagline: 'Build · Play · Display',
    price: 720,
    compareAt: 950,
    image: '/products/f3024.jpg',
    imageWebp: '/products/f3024.webp',
    thumb: '/products/f3024-sm.webp',
    size: '6.0 × 6.0 × 4.0 cm',
    ages: '14+',
    pieces: 'Micro bricks',
    rating: 4.8,
    reviews: 29,
    inStock: true,
    featured: true,
    badge: 'New arrival',
    description:
      'A darker turn for the series — black and crimson bricks with a wide-set lens design and an outstretched tongue detail that gives the figure real character on the shelf.',
    highlights: [
      'High-contrast black and crimson colourway',
      'Widest build in the range at 6.0 cm across',
      'Premium block figure finish',
      'Assembly instructions included',
    ],
  },
  {
    id: 'f3022',
    model: 'F3022',
    name: 'Hero Block — Crimson Merc Edition',
    series: 'Hero Block',
    tagline: 'Build · Play · Display',
    price: 690,
    compareAt: 890,
    image: '/products/f3022.jpg',
    imageWebp: '/products/f3022.webp',
    thumb: '/products/f3022-sm.webp',
    size: '5.0 × 4.0 × 6.0 cm',
    ages: '14+',
    pieces: 'Micro bricks',
    rating: 4.7,
    reviews: 33,
    inStock: true,
    description:
      'Red and black throughout, with twin katana-style arms and a mask built from tight white lens blocks. One of the most expressive figures in the Hero Block line.',
    highlights: [
      'Twin-arm pose with weapon detail',
      'Red and black brickwork, no stickers',
      'Micro-brick build rewards patience',
      'Finished figure stands 6.0 cm tall',
    ],
  },
  {
    id: 'f3025',
    model: 'F3025',
    name: 'Hero Block — Star Captain Edition',
    series: 'Hero Block',
    tagline: 'Build · Play · Display',
    price: 690,
    compareAt: 890,
    image: '/products/f3025.jpg',
    imageWebp: '/products/f3025.webp',
    thumb: '/products/f3025-sm.webp',
    size: '5.0 × 4.0 × 6.0 cm',
    ages: '14+',
    pieces: 'Micro bricks',
    rating: 4.7,
    reviews: 26,
    inStock: true,
    description:
      'Blue, white and red bricks with a detachable round shield — the most classic silhouette in the range and an easy first build for anyone new to micro bricks.',
    highlights: [
      'Detachable round shield accessory',
      'Star emblem built into the mask',
      'Great entry point for first-time builders',
      'Finished figure stands 6.0 cm tall',
    ],
  },
  {
    id: 'q5046',
    model: 'Q5046',
    name: 'Spidey Block — Web Edition (Micro)',
    series: 'Spidey Block',
    tagline: 'Build · Play · Display',
    price: 580,
    compareAt: 750,
    image: '/products/q5046.jpg',
    imageWebp: '/products/q5046.webp',
    thumb: '/products/q5046-sm.webp',
    size: '2.8 × 3.6 × 5.6 cm',
    ages: '14+',
    pieces: 'Micro bricks',
    rating: 4.6,
    reviews: 21,
    inStock: true,
    badge: 'Compact',
    description:
      'The smallest figure in the range and the most pocketable. Same crisp brickwork as the full-size Spidey Block, scaled down to 5.6 cm — ideal for a desk or a first collection.',
    highlights: [
      'Most compact build in the catalogue',
      'Classic red and blue colourway',
      'Fits comfortably on a desk or monitor stand',
      'Finished figure stands 5.6 cm tall',
    ],
  },
];

export const seriesList = ['All', 'Hero Block', 'Spidey Block'] as const;

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const featuredProducts = () => products.filter((p) => p.featured);
export const relatedProducts = (id: string, limit = 3) =>
  products.filter((p) => p.id !== id).slice(0, limit);

export const formatPrice = (n: number) => `${CURRENCY}${n.toLocaleString('en-BD')}`;
