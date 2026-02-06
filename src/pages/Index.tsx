import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/BookCard';
import { BookDetail } from '@/components/BookDetail';
import { ISBNScanner } from '@/components/ISBNScanner';
import { FolderSidebar } from '@/components/FolderSidebar';
import { AuthPage } from '@/components/AuthPage';
import { Book } from '@/types/book';
import { BookOpen, Plus, LogOut, Search, Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    books,
    folders,
    loading: dataLoading,
    scanning,
    scanISBN,
    createFolder,
    removeFolder,
    moveBookToFolder,
    removeBook,
    incrementQuantity,
    decrementQuantity,
  } = useBooks();

  const [showScanner, setShowScanner] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter books based on folder and search
  const filteredBooks = useMemo(() => {
    let result = books;

    // Filter by folder
    if (selectedFolderId === 'unfiled') {
      result = result.filter(b => !b.folder_id);
    } else if (selectedFolderId) {
      result = result.filter(b => b.folder_id === selectedFolderId);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(query) ||
        b.isbn.includes(query) ||
        b.authors?.some(a => a.toLowerCase().includes(query))
      );
    }

    return result;
  }, [books, selectedFolderId, searchQuery]);

  // Calculate book counts per folder
  const bookCounts = useMemo(() => {
    const counts: Record<string, number> = { unfiled: 0 };
    
    books.forEach(book => {
      if (!book.folder_id) {
        counts.unfiled++;
      } else {
        counts[book.folder_id] = (counts[book.folder_id] || 0) + 1;
      }
    });

    return counts;
  }, [books]);

  const handleScan = async (isbn: string) => {
    await scanISBN(isbn, selectedFolderId === 'unfiled' ? undefined : selectedFolderId || undefined);
    setShowScanner(false);
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  const currentFolderName = selectedFolderId === null 
    ? 'Alle Bücher' 
    : selectedFolderId === 'unfiled' 
      ? 'Ohne Ordner'
      : folders.find(f => f.id === selectedFolderId)?.name || 'Ordner';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={(id) => {
            setSelectedFolderId(id);
            setSidebarOpen(false);
          }}
          onCreateFolder={createFolder}
          onDeleteFolder={removeFolder}
          bookCounts={bookCounts}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 rounded-lg hover:bg-secondary flex items-center justify-center"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-xl lg:text-2xl font-bold truncate">
                {currentFolderName}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredBooks.length} Buch{filteredBooks.length !== 1 ? 'ü' : ''}cher
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowScanner(true)}
                className="btn-library"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Buch hinzufügen</span>
                <span className="sm:hidden">Hinzufügen</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bücher durchsuchen..."
              className="pl-10 input-library"
            />
          </div>
        </header>

        {/* Book Grid */}
        <div className="flex-1 p-4 lg:p-6">
          {dataLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="empty-state">
              <BookOpen className="empty-state-icon" />
              <h3 className="font-serif text-xl font-bold mb-2">
                {searchQuery ? 'Keine Ergebnisse' : 'Noch keine Bücher'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {searchQuery 
                  ? 'Versuchen Sie einen anderen Suchbegriff.'
                  : 'Fügen Sie Ihr erstes Buch hinzu, indem Sie die ISBN scannen oder eingeben.'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowScanner(true)} className="btn-library">
                  <Plus className="w-4 h-4 mr-2" />
                  Erstes Buch hinzufügen
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onQuantityIncrement={incrementQuantity}
                  onQuantityDecrement={decrementQuantity}
                  onDelete={removeBook}
                  onClick={setSelectedBook}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showScanner && (
        <ISBNScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          scanning={scanning}
        />
      )}

      {selectedBook && (
        <BookDetail
          book={selectedBook}
          folders={folders}
          onClose={() => setSelectedBook(null)}
          onDelete={removeBook}
          onQuantityIncrement={incrementQuantity}
          onQuantityDecrement={decrementQuantity}
          onMoveToFolder={moveBookToFolder}
        />
      )}
    </div>
  );
};

export default Index;
