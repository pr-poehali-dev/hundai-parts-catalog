import { useState } from 'react';
import Icon from '@/components/ui/icon';

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl p-2 space-y-2 animate-in slide-in-from-bottom-2">
          <a
            href="https://wa.me/79999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors whitespace-nowrap"
          >
            <Icon name="MessageCircle" size={20} />
            <span className="font-medium">WhatsApp</span>
          </a>
          <a
            href="https://t.me/porterpro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors whitespace-nowrap"
          >
            <Icon name="Send" size={20} />
            <span className="font-medium">Telegram</span>
          </a>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Связаться с нами"
      >
        {isOpen ? (
          <Icon name="X" size={24} />
        ) : (
          <Icon name="MessageSquare" size={24} />
        )}
      </button>
    </div>
  );
}
