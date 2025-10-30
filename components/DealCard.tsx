type DealCardProps = {
  brand: string;
  title: string;
  link: string;
  tags?: string[];
  lastUpdated?: string;
};

export default function DealCard({ brand, title, link, tags, lastUpdated }: DealCardProps) {
  return (
    <li className="bg-background-secondary border border-border-primary rounded-lg p-4 hover:border-border-secondary transition-normal">
      <div className="text-sm text-text-tertiary font-medium mb-1">
        {brand}
      </div>
      <a 
        className="text-md font-semibold text-text-primary hover:text-accent-500 transition-fast inline-block" 
        href={link} 
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </a>
      {tags?.length ? (
        <div className="text-xs text-text-quaternary mt-2 space-x-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="inline-block bg-background-tertiary px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      {lastUpdated ? (
        <div className="text-xs text-text-quaternary mt-2">
          updated: {lastUpdated}
        </div>
      ) : null}
    </li>
  );
}
