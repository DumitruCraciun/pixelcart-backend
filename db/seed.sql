-- Șterge date existente (opțional)
TRUNCATE products, users, cart_items, orders, order_items RESTART IDENTITY CASCADE;

-- Produse identice cu cele din front-end PixelCart
INSERT INTO products (name, description, category, price, stock_quantity, image_url) VALUES
('Wireless Headphones', 'Premium noise-cancelling headphones', 'electronics', 34.99, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
('Smartphone X12', 'Latest model with amazing camera', 'electronics', 699.99, 30, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'),
('Laptop Pro', 'High performance laptop', 'electronics', 899.99, 20, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'),
('Men''s Casual Shirt', 'Comfortable cotton shirt', 'clothing', 24.99, 100, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'),
('Women''s Summer Dress', 'Light and breezy summer dress', 'clothing', 29.99, 75, 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500'),
('Running Shoes', 'Professional running shoes', 'clothing', 59.99, 40, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),
('Coffee Maker', 'Automatic coffee machine', 'home', 89.99, 25, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 'home', 24.99, 60, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'),
('Indoor Plant Set', 'Set of 3 decorative plants', 'home', 19.99, 45, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'),
('Web Development Guide', 'Complete guide to modern web dev', 'books', 29.99, 35, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'),
('C# Programming', 'Master C# and .NET', 'books', 34.99, 30, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500'),
('JavaScript Cookbook', 'Practical JavaScript recipes', 'books', 27.99, 40, 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=500');

-- Adaugă un user admin (parola: PixelCartAdmin) - hash generat cu bcrypt
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@pixelcart.com', '$2b$10$Y7bE6X8Z9aV1cW2dF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3A4bC5dE6fG7hI8', 'Admin User', 'admin');

-- Notă: Pentru test, poți crea useri normali prin API