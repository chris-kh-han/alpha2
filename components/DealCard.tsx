type DealCardProps = {
  id: string;
  title: string;
  store: string;
  store_url: string;
  img?: string;
  price_now: number;
  price_was?: number | null;
  currency?: string;
  discount_pct?: number | null;
  ends_at?: string | null;
  category?: string[];
};

export default function DealCard({ 
  title, 
  store, 
  store_url, 
  img, 
  price_now, 
  price_was, 
  currency = 'USD',
  discount_pct,
  category 
}: DealCardProps) {
  const formatPrice = (price: number) => {
    if (currency === 'KRW') {
      return `₩${price.toLocaleString('ko-KR')}`;
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <li className="bg-background-secondary border border-border-primary rounded-lg p-4 hover:border-border-secondary transition-normal">
      <div className="flex gap-4">
        {img && (
          <div className="flex-shrink-0 w-20 h-20 bg-background-tertiary rounded-md overflow-hidden">
            <img 
              src={img} 
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="text-sm text-text-tertiary font-medium mb-1">
            {store}
          </div>
          
          <a 
            className="text-md font-semibold text-text-primary hover:text-accent-500 transition-fast inline-block line-clamp-2" 
            href={store_url} 
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
          
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-accent-500">
              {formatPrice(price_now)}
            </span>
            {price_was && price_was > price_now && (
              <>
                <span className="text-sm text-text-tertiary line-through">
                  {formatPrice(price_was)}
                </span>
                {discount_pct && (
                  <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                    -{discount_pct}%
                  </span>
                )}
              </>
            )}
          </div>
          
          {category && category.length > 0 && (
            <div className="text-xs text-text-quaternary mt-2 space-x-2">
              {category.map((cat, idx) => (
                <span key={idx} className="inline-block bg-background-tertiary px-2 py-1 rounded">
                  #{cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
