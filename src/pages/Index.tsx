import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import Cart from '@/components/Cart';
import FloatingContactButton from '@/components/FloatingContactButton';

interface Product {
  id: number;
  name: string;
  vin: string;
  category: string;
  price: number;
  image: string;
  model: 'Porter 1' | 'Porter 2' | 'Kia Bongo';
  inStock: boolean;
}



interface CartItem {
  id: number;
  name: string;
  vin: string;
  model: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedModel]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedModel !== 'all') params.append('model', selectedModel);
      
      const url = `https://functions.poehali.dev/b7c86ff6-479a-4a9c-8d8c-6ce8b3b1ecdc${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products;

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        vin: product.vin,
        model: product.model,
        price: product.price,
        quantity: 1,
        image: product.image
      }];
    });
    toast.success('Товар добавлен в корзину', {
      duration: 2000,
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success('Товар удален из корзины');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-primary shadow-lg sticky top-0 z-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://cdn.poehali.dev/files/fa612bb4-06b7-42e7-b9a6-e6a013cc9972.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://cdn.poehali.dev/files/b227f76b-a8a4-4f92-be33-c3aa6fd57c0c.png" 
                alt="PORTER PRO" 
                className="h-16 w-16 object-contain rounded-full"
              />
              <div className="text-white">
                <h1 className="text-2xl font-bold">PORTER PRO</h1>
                <p className="text-sm text-gray-300">Автозапчасти для Porter & Bongo</p>
              </div>
            </div>
            
            <button 
              className="relative bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              onClick={() => setIsCartOpen(true)}
            >
              <Icon name="ShoppingCart" size={24} />
              <span className="font-semibold">Корзина</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-accent w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Найдите нужную запчасть по VIN-номеру
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Для Hyundai Porter 1, Porter 2 и Kia Bongo
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative flex-1 max-w-xl w-full">
                <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Введите VIN-номер или название запчасти..."
                  className="pl-12 h-14 text-lg bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white h-14 px-8 text-lg font-semibold"
              >
                Найти
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3 mb-8 justify-center animate-slide-up">
          {['all', 'Porter 1', 'Porter 2', 'Kia Bongo'].map((model) => (
            <Button
              key={model}
              variant={selectedModel === model ? 'default' : 'outline'}
              onClick={() => setSelectedModel(model)}
              className={selectedModel === model ? 'bg-accent hover:bg-accent/90' : ''}
            >
              {model === 'all' ? 'Все модели' : model}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Icon name="Loader2" size={64} className="animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Загрузка товаров...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-scale-in border-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <Badge 
                  className="absolute top-3 right-3 bg-primary text-white"
                >
                  {product.model}
                </Badge>
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Нет в наличии
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="Hash" size={16} />
                    <span className="font-mono">VIN: {product.vin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Package" size={16} />
                    <span>{product.category}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-3xl font-bold text-accent">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold h-12 text-lg"
                  disabled={!product.inStock}
                  onClick={() => addToCart(product)}
                >
                  {product.inStock ? (
                    <>
                      <Icon name="ShoppingCart" size={20} />
                      <span>В корзину</span>
                    </>
                  ) : (
                    'Недоступно'
                  )}
                </Button>
              </CardFooter>
            </Card>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <Icon name="SearchX" size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Ничего не найдено</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </section>

      <footer className="bg-primary text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">О нас</h3>
              <p className="text-gray-300">
                Качественные автозапчасти для Hyundai Porter и Kia Bongo
              </p>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Контакты</h3>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center gap-2">
                  <Icon name="Phone" size={18} />
                  <span>+7 (XXX) XXX-XX-XX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={18} />
                  <span>info@porterpro.ru</span>
                </div>
                <div className="flex gap-3 mt-4">
                  <a 
                    href="https://wa.me/79999999999" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Icon name="MessageCircle" size={20} />
                    WhatsApp
                  </a>
                  <a 
                    href="https://t.me/porterpro" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Icon name="Send" size={20} />
                    Telegram
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-4">Режим работы</h3>
              <p className="text-gray-300">
                Пн-Пт: 9:00 - 18:00<br />
                Сб-Вс: 10:00 - 16:00
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© 2024 PORTER PRO. Все права защищены.</p>
          </div>
        </div>
      </footer>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />
      
      <FloatingContactButton />
    </div>
  );
}