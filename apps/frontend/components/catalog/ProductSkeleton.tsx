interface ProductSkeletonProps {
  view: 'grid' | 'list';
}

export default function ProductSkeleton({ view }: ProductSkeletonProps) {
  const cardClass = view === 'grid' ? 'skeleton-grid' : 'skeleton-list';

  return (
    <div className={`skeleton-card ${cardClass}`}>
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="skeleton-text short" />
      </div>

      <style jsx>{`
        .skeleton-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-grid {
          display: flex;
          flex-direction: column;
        }

        .skeleton-list {
          display: flex;
          flex-direction: row;
        }

        .skeleton-image {
          background: #f3f4f6;
        }

        .skeleton-grid .skeleton-image {
          width: 100%;
          height: 200px;
        }

        .skeleton-list .skeleton-image {
          width: 200px;
          height: 200px;
          flex-shrink: 0;
        }

        .skeleton-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .skeleton-title {
          height: 1.5rem;
          background: #f3f4f6;
          border-radius: 0.25rem;
          width: 70%;
        }

        .skeleton-text {
          height: 1rem;
          background: #f3f4f6;
          border-radius: 0.25rem;
          width: 100%;
        }

        .skeleton-text.short {
          width: 60%;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
