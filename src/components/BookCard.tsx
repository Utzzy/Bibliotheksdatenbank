import { Book } from '@/types/book';
import { BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onQuantityIncrement: (id: string) => void;
  onQuantityDecrement: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (book: Book) => void;
}

export function BookCard({ 
  book, 
  onQuantityIncrement, 
  onQuantityDecrement, 
  onDelete,
  onClick
}: BookCardProps) {
  return (
    <div 
      className="book-card cursor-pointer group"
      onClick={() => onClick(book)}
    >
      {/* Cover Image */}
      <div className="book-cover bg-secondary">
        {book.cover_image ? (
          <img 
            src={book.cover_image} 
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <BookOpen className="w-16 h-16 text-primary/30" />
          </div>
        )}
        
        {/* Quantity Badge */}
        {book.quantity > 1 && (
          <div className="quantity-badge">
            {book.quantity}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-serif font-bold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        {book.authors && book.authors.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book.authors.join(', ')}
          </p>
        )}
        {book.source && (
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            via {book.source}
          </p>
        )}
      </div>

      {/* Quick Actions (visible on hover) */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-card via-card to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onQuantityDecrement(book.id)}
          disabled={book.quantity <= 1}
          className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="text-sm font-medium min-w-[2rem] text-center">
          {book.quantity}
        </span>
        <button
          onClick={() => onQuantityIncrement(book.id)}
          className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-sm font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
