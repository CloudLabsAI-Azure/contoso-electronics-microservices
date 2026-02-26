const Product = require('../models/Product');

const defaultProducts = [
{
  name: 'Surface Laptop Studio 2',
  description: 'Powerful performance meets versatile design. 14.4" touchscreen, Intel Core i7, 16GB RAM.',
  price: 1599.99,
  imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6554/6554718_sd.jpg'
},
{
  name: 'Xbox Wireless Controller',
  description: 'Enhanced comfort and grip with textured triggers. Bluetooth and USB-C connectivity.',
  price: 59.99,
  imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6430/6430660_sd.jpg'
},
{
  name: 'Surface Pro 10',
  description: 'Ultra-light 2-in-1 laptop with 13" PixelSense display. Built for business with AI-powered features.',
  price: 1199.99,
  imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6591db42-3831-48af-b480-eccbfad43925.jpg'
},
{
  name: 'Arc Mouse',
  description: 'Sleek, ergonomic mouse that snaps flat for easy portability. Bluetooth connectivity.',
  price: 79.99,
  imageUrl: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/gldn-SurfA-Mavis-ELG-00001-b00?qlt=90&wid=1253&hei=705&extendN=0.12,0.12,0.12,0.12&bgc=FFFFFFFF&fmt=jpg'
},
{
  name: 'Surface Headphones 2+',
  description: 'Premium noise-cancelling headphones with 13 levels of adjustable ANC and rich Omnisonic sound.',
  price: 299.99,
  imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6408/6408621_sd.jpg'
},
{
  name: 'Surface Dock 2',
  description: 'Transform your Surface into a full desktop. Dual 4K monitor support, USB-C, and 199W power.',
  price: 259.99,
  imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6408/6408935_sd.jpg'
},
{
  name: 'Ergonomic Keyboard',
  description: 'Split keyset design with cushioned palm rest for all-day comfort. Bluetooth wireless.',
  price: 129.99,
  imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6379/6379631_sd.jpg'
},
{
  name: 'Surface Thunderbolt 4 Dock',
  description: 'Connect to multiple displays and accessories with Thunderbolt 4. Compact, enterprise-grade dock.',
  price: 349.99,
  imageUrl: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6537/6537888_sd.jpg'
}
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(defaultProducts);
      console.log(`Seeded ${defaultProducts.length} default products`);
    } else {
      console.log(`Database already has ${count} products — skipping seed`);
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
  }
};

module.exports = seedProducts;
