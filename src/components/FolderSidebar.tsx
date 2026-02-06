import { useState } from 'react';
import { Folder } from '@/types/book';
import { Folder as FolderIcon, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (name: string, color?: string) => void;
  onDeleteFolder: (id: string) => void;
  bookCounts: Record<string, number>;
}

const FOLDER_COLORS = [
  '#8B4513', // Saddle Brown
  '#A0522D', // Sienna
  '#CD853F', // Peru
  '#D2691E', // Chocolate
  '#B8860B', // Dark Goldenrod
  '#556B2F', // Dark Olive Green
  '#2F4F4F', // Dark Slate Gray
  '#483D8B', // Dark Slate Blue
  '#800020', // Burgundy
  '#4A0000', // Dark Red
];

export function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  bookCounts,
}: FolderSidebarProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), selectedColor);
    setNewFolderName('');
    setShowCreate(false);
  };

  const totalBooks = Object.values(bookCounts).reduce((a, b) => a + b, 0);
  const unfiledBooks = bookCounts['unfiled'] || 0;

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-serif text-lg font-bold text-sidebar-foreground">Ordner</h2>
      </div>

      {/* Folder List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* All Books */}
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
            selectedFolderId === null 
              ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
              : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
          }`}
        >
          <FolderIcon className="w-5 h-5" />
          <span className="flex-1 font-medium">Alle Bücher</span>
          <span className="text-xs text-muted-foreground">{totalBooks}</span>
        </button>

        {/* Unfiled */}
        <button
          onClick={() => onSelectFolder('unfiled')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
            selectedFolderId === 'unfiled' 
              ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
              : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
          }`}
        >
          <FolderIcon className="w-5 h-5 opacity-50" />
          <span className="flex-1">Ohne Ordner</span>
          <span className="text-xs text-muted-foreground">{unfiledBooks}</span>
        </button>

        <div className="h-px bg-sidebar-border my-2" />

        {/* User Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              selectedFolderId === folder.id 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
            }`}
          >
            <button
              onClick={() => onSelectFolder(folder.id)}
              className="flex-1 flex items-center gap-3 text-left"
            >
              <FolderIcon 
                className="w-5 h-5" 
                style={{ color: folder.color }}
              />
              <span className="flex-1 truncate">{folder.name}</span>
              <span className="text-xs text-muted-foreground">
                {bookCounts[folder.id] || 0}
              </span>
            </button>
            <button
              onClick={() => onDeleteFolder(folder.id)}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded hover:bg-destructive/20 flex items-center justify-center transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        ))}
      </div>

      {/* Create Folder */}
      <div className="p-3 border-t border-sidebar-border">
        {showCreate ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Neuer Ordner</span>
              <button 
                onClick={() => setShowCreate(false)}
                className="w-6 h-6 rounded hover:bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ordnername..."
              className="input-library"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedColor === color ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button 
              onClick={handleCreate}
              className="w-full btn-library"
              size="sm"
              disabled={!newFolderName.trim()}
            >
              Erstellen
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ordner erstellen
          </Button>
        )}
      </div>
    </div>
  );
}
