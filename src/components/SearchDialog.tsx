import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { allProducts } from '@/data/products';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchDialog = ({ isOpen, onClose }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allProducts.filter(product =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 6);
  }, [searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader className="pb-1 sm:pb-2">
          <DialogTitle className="text-foreground text-base sm:text-lg">Buscar productos</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar juegos, gift cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-background border-border h-10 sm:h-11 text-sm"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <div className="mt-2 sm:mt-4 max-h-64 sm:max-h-80 overflow-y-auto -mx-1 px-1">
          {searchQuery && filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
              No se encontraron productos para "{searchQuery}"
            </p>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/producto/${product.id}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted transition-colors active:bg-muted/80"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {product.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">{product.platform}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      ${product.discountPrice.toFixed(2)}
                    </span>
                    {product.discount && (
                      <span className="block text-[10px] sm:text-xs text-neon-green">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Link to full catalog */}
          {searchQuery && (
            <Link
              to={`/catalogo?search=${encodeURIComponent(searchQuery)}`}
              onClick={handleClose}
              className="block mt-3 sm:mt-4 text-center text-xs sm:text-sm text-primary hover:underline py-2"
            >
              Ver todos los resultados →
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
