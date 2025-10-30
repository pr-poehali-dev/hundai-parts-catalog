CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    vin VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    model VARCHAR(50) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_vin ON products(vin);
CREATE INDEX idx_products_model ON products(model);
CREATE INDEX idx_products_category ON products(category);

INSERT INTO products (name, vin, category, price, image_url, model, in_stock) VALUES
('Тормозные колодки передние', '581012E300', 'Тормозная система', 3500.00, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', 'Porter 2', true),
('Масляный фильтр двигателя', '263004X000', 'Двигатель', 850.00, 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400', 'Porter 1', true),
('Воздушный фильтр', '281131D000', 'Двигатель', 1200.00, 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', 'Kia Bongo', true),
('Свеча зажигания (комплект)', '1884411070', 'Двигатель', 2400.00, 'https://images.unsplash.com/photo-1589666564459-93cdd3ab856c?w=400', 'Porter 2', false),
('Передний амортизатор', '546612E200', 'Подвеска', 5600.00, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400', 'Porter 1', true),
('Диск тормозной передний', '517122E300', 'Тормозная система', 4200.00, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400', 'Kia Bongo', true);