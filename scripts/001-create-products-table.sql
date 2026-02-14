CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  comment TEXT,
  image_url TEXT NOT NULL,
  price_from NUMERIC(10,2) NOT NULL,
  price_to NUMERIC(10,2) NOT NULL,
  affiliate_link TEXT NOT NULL,
  theme TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_theme ON products(theme);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- Seed de produtos de demonstração
INSERT INTO products (title, slug, description, comment, image_url, price_from, price_to, affiliate_link, theme, active)
VALUES
  ('Fone Bluetooth Pro X', 'fone-bluetooth-pro-x', 'Fone de ouvido sem fio com cancelamento de ruído ativo e bateria de 40 horas. Qualidade de som premium com graves profundos.', 'Melhor custo-benefício da categoria!', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop', 299.90, 149.90, 'https://example.com/affiliate/fone-pro-x', 'Tecnologia', true),
  ('Smartwatch Fitness Ultra', 'smartwatch-fitness-ultra', 'Relógio inteligente com monitor cardíaco, GPS integrado e resistência à água até 50 metros.', 'Ideal para quem pratica esportes!', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop', 599.90, 349.90, 'https://example.com/affiliate/smartwatch-ultra', 'Tecnologia', true),
  ('Cadeira Gamer Ergo Plus', 'cadeira-gamer-ergo-plus', 'Cadeira gamer ergonômica com suporte lombar ajustável, apoio de braço 4D e revestimento em couro PU premium.', 'Conforto para longas horas de trabalho ou jogo!', 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&h=400&fit=crop', 1299.90, 799.90, 'https://example.com/affiliate/cadeira-ergo', 'Casa e Escritório', true),
  ('Kit Skincare Completo', 'kit-skincare-completo', 'Kit completo de cuidados com a pele incluindo limpeza, tonificação e hidratação. Produtos naturais e veganos.', 'Resultados visíveis em 2 semanas!', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop', 189.90, 99.90, 'https://example.com/affiliate/skincare-kit', 'Beleza e Saúde', true),
  ('Mochila Viagem Expansível', 'mochila-viagem-expandivel', 'Mochila de viagem com compartimento expansível, porta USB e organizador interno. Perfeita para viagens curtas.', 'Aprovada como bagagem de mão!', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop', 249.90, 159.90, 'https://example.com/affiliate/mochila-viagem', 'Viagem', true),
  ('Luminária LED Inteligente', 'luminaria-led-inteligente', 'Luminária de mesa com controle de temperatura de cor, dimmer touch e conexão Wi-Fi para controle por app.', NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', 199.90, 129.90, 'https://example.com/affiliate/luminaria-led', 'Casa e Escritório', true)
ON CONFLICT (slug) DO NOTHING;

-- Correções para ambientes com dados legados sem acentuação
UPDATE products SET theme = 'Casa e Escritório' WHERE theme = 'Casa e Escritorio';
UPDATE products SET theme = 'Beleza e Saúde' WHERE theme = 'Beleza e Saude';

UPDATE products
SET description = 'Fone de ouvido sem fio com cancelamento de ruído ativo e bateria de 40 horas. Qualidade de som premium com graves profundos.',
    comment = 'Melhor custo-benefício da categoria!'
WHERE slug = 'fone-bluetooth-pro-x';

UPDATE products
SET description = 'Relógio inteligente com monitor cardíaco, GPS integrado e resistência à água até 50 metros.',
    comment = 'Ideal para quem pratica esportes!'
WHERE slug = 'smartwatch-fitness-ultra';

UPDATE products
SET description = 'Cadeira gamer ergonômica com suporte lombar ajustável, apoio de braço 4D e revestimento em couro PU premium.',
    comment = 'Conforto para longas horas de trabalho ou jogo!'
WHERE slug = 'cadeira-gamer-ergo-plus';

UPDATE products
SET description = 'Kit completo de cuidados com a pele incluindo limpeza, tonificação e hidratação. Produtos naturais e veganos.',
    comment = 'Resultados visíveis em 2 semanas!'
WHERE slug = 'kit-skincare-completo';

UPDATE products
SET title = 'Mochila Viagem Expansível',
    description = 'Mochila de viagem com compartimento expansível, porta USB e organizador interno. Perfeita para viagens curtas.',
    comment = 'Aprovada como bagagem de mão!'
WHERE slug = 'mochila-viagem-expandivel';

UPDATE products
SET title = 'Luminária LED Inteligente',
    description = 'Luminária de mesa com controle de temperatura de cor, dimmer touch e conexão Wi-Fi para controle por app.'
WHERE slug = 'luminaria-led-inteligente';
