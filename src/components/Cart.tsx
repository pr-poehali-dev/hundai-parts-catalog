import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  name: string;
  vin: string;
  model: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
}

export default function Cart({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  onClearCart 
}: CartProps) {
  const [isCheckout, setIsCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://functions.poehali.dev/bde2f8af-42b2-4841-8ef6-173c78e47f38', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          items: items.map(item => ({
            product_name: item.name,
            product_vin: item.vin,
            product_model: item.model,
            price: item.price,
            quantity: item.quantity
          })),
          total_amount: totalAmount
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Заказ №${data.order_number} успешно оформлен!`, {
          description: 'Мы свяжемся с вами в ближайшее время',
          duration: 5000,
        });
        
        onClearCart();
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setIsCheckout(false);
        onClose();
      } else {
        toast.error('Ошибка при оформлении заказа');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Icon name="ShoppingCart" size={28} />
            Корзина
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 
              ? 'Ваша корзина пуста' 
              : `${items.length} ${items.length === 1 ? 'товар' : 'товаров'} в корзине`
            }
          </SheetDescription>
        </SheetHeader>

        {!isCheckout ? (
          <div className="mt-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="ShoppingBag" size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Добавьте товары в корзину</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">VIN: {item.vin}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Icon name="Minus" size={14} />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Icon name="Plus" size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent mb-2">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Итого:</span>
                    <span className="text-accent">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-lg font-semibold"
                  onClick={() => setIsCheckout(true)}
                >
                  Оформить заказ
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setIsCheckout(false)}
            >
              <Icon name="ArrowLeft" size={20} />
              Назад к корзине
            </Button>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <Label htmlFor="name">Ваше имя *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Иван Иванов"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="border-t pt-4">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Ваш заказ:</h4>
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-1">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Итого:</span>
                    <span className="text-accent">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={20} />
                    Подтвердить заказ
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}