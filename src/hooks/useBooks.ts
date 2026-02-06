import { useState, useEffect, useCallback } from 'react';
import { Book, Folder, BookLookupResult } from '@/types/book';
import { 
  getBooks, 
  addBook, 
  updateBookQuantity, 
  updateBookFolder,
  deleteBook,
  getFolders,
  addFolder,
  deleteFolder,
  lookupISBN,
  checkExistingBook
} from '@/lib/api';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) {
      setBooks([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      const [booksData, foldersData] = await Promise.all([
        getBooks(),
        getFolders()
      ]);
      setBooks(booksData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scanISBN = async (isbn: string, folderId?: string): Promise<Book | null> => {
    if (!user) {
      toast.error('Bitte melden Sie sich an');
      return null;
    }

    setScanning(true);
    try {
      // Check if book already exists
      const existingBook = await checkExistingBook(user.id, isbn);
      
      if (existingBook) {
        // Increment quantity
        const updated = await updateBookQuantity(existingBook.id, existingBook.quantity + 1);
        setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
        toast.success(`"${existingBook.title}" - Anzahl erhöht auf ${updated.quantity}`);
        return updated;
      }

      // Lookup book info
      const bookInfo: BookLookupResult = await lookupISBN(isbn);

      // Add new book
      const newBook = await addBook({
        user_id: user.id,
        folder_id: folderId || null,
        isbn: bookInfo.isbn,
        title: bookInfo.title,
        authors: bookInfo.authors,
        publisher: bookInfo.publisher,
        published_date: bookInfo.publishedDate,
        description: bookInfo.description,
        page_count: bookInfo.pageCount,
        cover_image: bookInfo.coverImage,
        language: bookInfo.language,
        categories: bookInfo.categories,
        quantity: 1,
        source: bookInfo.source,
        raw_data: bookInfo.rawData as import('@/integrations/supabase/types').Json,
      });

      setBooks(prev => [newBook, ...prev]);
      toast.success(`"${bookInfo.title}" hinzugefügt (${bookInfo.source})`);
      return newBook;

    } catch (error) {
      console.error('Error scanning ISBN:', error);
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast.error(`Fehler: ${message}`);
      return null;
    } finally {
      setScanning(false);
    }
  };

  const createFolder = async (name: string, color?: string) => {
    if (!user) return null;

    try {
      const newFolder = await addFolder({
        user_id: user.id,
        name,
        description: null,
        color: color || '#8B4513',
        icon: 'folder',
      });
      setFolders(prev => [...prev, newFolder].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Ordner "${name}" erstellt`);
      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Fehler beim Erstellen des Ordners');
      return null;
    }
  };

  const removeFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      // Update books that were in this folder
      setBooks(prev => prev.map(b => b.folder_id === id ? { ...b, folder_id: null } : b));
      toast.success('Ordner gelöscht');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Fehler beim Löschen des Ordners');
    }
  };

  const moveBookToFolder = async (bookId: string, folderId: string | null) => {
    try {
      const updated = await updateBookFolder(bookId, folderId);
      setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
      toast.success('Buch verschoben');
    } catch (error) {
      console.error('Error moving book:', error);
      toast.error('Fehler beim Verschieben');
    }
  };

  const removeBook = async (id: string) => {
    try {
      await deleteBook(id);
      setBooks(prev => prev.filter(b => b.id !== id));
      toast.success('Buch gelöscht');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const incrementQuantity = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    try {
      const updated = await updateBookQuantity(id, book.quantity + 1);
      setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const decrementQuantity = async (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book || book.quantity <= 1) return;

    try {
      const updated = await updateBookQuantity(id, book.quantity - 1);
      setBooks(prev => prev.map(b => b.id === updated.id ? updated : b));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  return {
    books,
    folders,
    loading,
    scanning,
    scanISBN,
    createFolder,
    removeFolder,
    moveBookToFolder,
    removeBook,
    incrementQuantity,
    decrementQuantity,
    refetch: fetchData,
  };
}
