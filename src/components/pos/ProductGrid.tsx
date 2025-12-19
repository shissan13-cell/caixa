import { Product } from '@/types/pos';

interface ProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export function ProductGrid({ products, onAddProduct }: ProductGridProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onAddProduct(product)}
          className="product-btn animate-fade-in"
        >
          <span className="text-4xl">{product.emoji}</span>
          <span className="text-center line-clamp-2">{product.name}</span>
          <span className="text-primary font-bold">{formatPrice(product.price)}</span>
        </button>
      ))}
    </div>
  );
}
