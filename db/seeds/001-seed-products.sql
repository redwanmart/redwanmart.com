-- Redwan Mart Sample Product Data
-- Seed data for development and demo

-- Insert Categories
INSERT OR IGNORE INTO categories (id, name, slug, description, display_order) VALUES
('cat_1', 'Electronics', 'electronics', 'High-tech gadgets and devices', 1),
('cat_2', 'Wearables', 'wearables', 'Smartwatches and fitness trackers', 2),
('cat_3', 'Audio', 'audio', 'Headphones, speakers, and audio equipment', 3),
('cat_4', 'Photography', 'photography', 'Cameras and photography accessories', 4),
('cat_5', 'Accessories', 'accessories', 'Phone cases, chargers, and more', 5),
('cat_6', 'Bags', 'bags', 'Backpacks, laptop bags, and travel bags', 6);

-- Insert Products
INSERT OR IGNORE INTO products (id, name, slug, description, price, category, sku, in_stock, stock_quantity, rating, reviews_count, featured) VALUES
('prod_1', 'Premium Wireless Headphones', 'premium-wireless-headphones', 'High-quality wireless headphones with noise cancellation and 30-hour battery life', 199.99, 'Audio', 'HEAD-001', true, 45, 4.8, 245, true),
('prod_2', 'Smartwatch Pro Series', 'smartwatch-pro-series', 'Advanced smartwatch with fitness tracking, heart rate monitor, and 7-day battery', 349.99, 'Wearables', 'WATCH-001', true, 32, 4.6, 189, true),
('prod_3', 'Ultra HD Camera', 'ultra-hd-camera', 'Professional 4K camera with advanced autofocus and 8K video recording capability', 899.99, 'Photography', 'CAM-001', true, 12, 4.9, 156, true),
('prod_4', 'Portable Speaker', 'portable-speaker', 'Waterproof Bluetooth speaker with 360-degree sound and 20-hour battery life', 79.99, 'Audio', 'SPEAK-001', true, 120, 4.5, 312, false),
('prod_5', 'Wireless Charging Pad', 'wireless-charging-pad', 'Fast wireless charging pad supporting 15W charging for all Qi-compatible devices', 39.99, 'Accessories', 'CHARGE-001', true, 250, 4.4, 423, false),
('prod_6', 'Premium Backpack', 'premium-backpack', 'Water-resistant laptop backpack with ergonomic design and multiple compartments', 129.99, 'Bags', 'BAG-001', false, 0, 4.7, 278, false),
('prod_7', '4K Monitor', '4k-monitor', '43-inch 4K UHD monitor perfect for gaming and professional work', 549.99, 'Electronics', 'MON-001', true, 18, 4.6, 134, true),
('prod_8', 'Mechanical Keyboard', 'mechanical-keyboard', 'Premium mechanical keyboard with customizable RGB lighting and mechanical switches', 159.99, 'Accessories', 'KEY-001', true, 67, 4.7, 203, false),
('prod_9', 'USB-C Hub', 'usb-c-hub', '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery', 49.99, 'Accessories', 'HUB-001', true, 156, 4.3, 187, false),
('prod_10', 'Drone Pro Max', 'drone-pro-max', 'Professional drone with 4K camera, 31-minute flight time, and obstacle avoidance', 799.99, 'Photography', 'DRONE-001', true, 8, 4.8, 92, true),
('prod_11', 'Tablet Pro', 'tablet-pro', '12-inch high-resolution tablet with stylus support and 12GB RAM', 599.99, 'Electronics', 'TAB-001', true, 25, 4.6, 167, false),
('prod_12', 'Fitness Tracker', 'fitness-tracker', 'Advanced fitness tracker with sleep monitoring and calorie tracking', 199.99, 'Wearables', 'FIT-001', true, 89, 4.4, 312, false),
('prod_13', 'Studio Microphone', 'studio-microphone', 'Professional studio microphone with XLR connector and shock mount', 299.99, 'Audio', 'MIC-001', true, 34, 4.9, 156, false),
('prod_14', 'Laptop Stand', 'laptop-stand', 'Adjustable aluminum laptop stand compatible with all laptops', 44.99, 'Accessories', 'STAND-001', true, 203, 4.5, 289, false),
('prod_15', 'Travel Camera', 'travel-camera', 'Compact mirrorless camera perfect for travel and vlogging', 699.99, 'Photography', 'VCAM-001', true, 16, 4.7, 201, true),
('prod_16', 'Noise Cancelling Earbuds', 'noise-cancelling-earbuds', 'True wireless earbuds with active noise cancellation and spatial audio', 249.99, 'Audio', 'EARBUD-001', true, 78, 4.8, 456, true),
('prod_17', 'Smart Watch Band', 'smart-watch-band', 'Premium replacement bands for smartwatches in multiple colors', 29.99, 'Accessories', 'WBAND-001', true, 340, 4.6, 234, false),
('prod_18', 'Phone Case Pro', 'phone-case-pro', 'Military-grade protective phone case with shock absorption technology', 34.99, 'Accessories', 'CASE-001', true, 412, 4.4, 567, false),
('prod_19', 'Desk Lamp LED', 'desk-lamp-led', 'Smart LED desk lamp with adjustable brightness and color temperature', 59.99, 'Electronics', 'LAMP-001', true, 95, 4.3, 145, false),
('prod_20', 'Camera Lens Kit', 'camera-lens-kit', 'Complete lens kit with wide-angle, telephoto, and macro lenses', 449.99, 'Photography', 'LENS-001', true, 11, 4.9, 103, false);

-- Insert Sample Admin User (password: admin123 - hashed)
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
('user_admin_1', 'admin@redwanmart.com', '$2b$10$demo.hash.placeholder.for.admin.password', 'Admin', 'User', 'admin', true, true);

-- Insert Sample Customer Users
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
('user_cust_1', 'customer1@example.com', '$2b$10$demo.hash.placeholder.for.customer', 'John', 'Doe', 'customer', true, true),
('user_cust_2', 'customer2@example.com', '$2b$10$demo.hash.placeholder.for.customer', 'Jane', 'Smith', 'customer', true, true),
('user_cust_3', 'customer3@example.com', '$2b$10$demo.hash.placeholder.for.customer', 'Ahmed', 'Khan', 'customer', true, false);
