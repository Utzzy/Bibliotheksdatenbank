import { Book } from '@/types/book';
import { X, BookOpen, Calendar, Building2, Hash, Languages, Tag, Trash2, Minus, Plus, FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Folder } from '@/types/book';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookDetailProps {
  book: Book;
  folders: Folder[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onQuantityIncrement: (id: string) => void;
  onQuantityDecrement: (id: string) => void;
  onMoveToFolder: (bookId: string, folderId: string | null) => void;
}

export function BookDetail({
  book,
  folders,
  onClose,
  onDelete,
  onQuantityIncrement,
  onQuantityDecrement,
  onMoveToFolder,
}: BookDetailProps) {
  const currentFolder = folders.find(f => f.id === book.folder_id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-bold">Buchdetails</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
          <div className="flex gap-6">
            {/* Cover */}
            <div className="flex-shrink-0">
              <div className="book-cover w-36 rounded-lg">
                {book.cover_image ? (
                  <img 
                    src={book.cover_image} 
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                    <BookOpen className="w-12 h-12 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => onQuantityDecrement(book.id)}
                  disabled={book.quantity <= 1}
                  className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold min-w-[3rem] text-center">
                  {book.quantity}×
                </span>
                <button
                  onClick={() => onQuantityIncrement(book.id)}
                  className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-2xl font-bold mb-2">{book.title}</h3>
              
              {book.authors && book.authors.length > 0 && (
                <p className="text-muted-foreground mb-4">
                  von {book.authors.join(', ')}
                </p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span>ISBN: {book.isbn}</span>
                </div>

                {book.publisher && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{book.publisher}</span>
                  </div>
                )}

                {book.published_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{book.published_date}</span>
                  </div>
                )}

                {book.page_count && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{book.page_count} Seiten</span>
                  </div>
                )}

                {book.language && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Languages className="w-4 h-4" />
                    <span>{book.language.toUpperCase()}</span>
                  </div>
                )}

                {book.source && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span>Quelle: {book.source}</span>
                  </div>
                )}
              </div>

              {book.description && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Beschreibung</h4>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {book.description}
                  </p>
                </div>
              )}

              {book.categories && book.categories.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Kategorien</h4>
                  <div className="flex flex-wrap gap-1">
                    {book.categories.slice(0, 5).map((cat, i) => (
                      <span key={i} className="folder-badge text-[10px]">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Folder Selection */}
              <div className="mt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FolderInput className="w-4 h-4" />
                  Ordner
                </h4>
                <Select
                  value={book.folder_id || "none"}
                  onValueChange={(value) => onMoveToFolder(book.id, value === "none" ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ordner auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Ordner</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(book.id);
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>
    </div>
  );
}
