import { useState, useRef, useEffect } from 'react';
import { X, Camera, Keyboard, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ISBNScannerProps {
  onScan: (isbn: string) => Promise<void>;
  onClose: () => void;
  scanning: boolean;
}

export function ISBNScanner({ onScan, onClose, scanning }: ISBNScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [isbn, setIsbn] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMode('camera');
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Kamera konnte nicht gestartet werden. Bitte ISBN manuell eingeben.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setMode('manual');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbn.trim()) return;
    
    await onScan(isbn.trim());
    setIsbn('');
  };

  const isValidISBN = (value: string) => {
    const cleaned = value.replace(/[-\s]/g, '');
    return cleaned.length === 10 || cleaned.length === 13;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-bold">ISBN Scannen</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                stopCamera();
                setMode('manual');
              }}
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Manuell
            </Button>
            <Button
              variant={mode === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={startCamera}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Kamera
            </Button>
          </div>

          {mode === 'camera' ? (
            <div className="space-y-4">
              {cameraError ? (
                <div className="text-center py-8">
                  <p className="text-destructive text-sm">{cameraError}</p>
                </div>
              ) : (
                <>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="scanner-frame">
                        <div className="scanner-line" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Barcode-Erkennung noch nicht implementiert.<br />
                    Bitte ISBN manuell eingeben.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  ISBN-Nummer
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-3-16-148410-0"
                    className="pl-10 input-library"
                    disabled={scanning}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  10- oder 13-stellige ISBN eingeben
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-library"
                disabled={!isValidISBN(isbn) || scanning}
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suche...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buch suchen
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Quick Info */}
          <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Unterstützte Datenbanken</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Open Library</li>
              <li>• Google Books</li>
              <li>• Open Library Search (Fallback)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
