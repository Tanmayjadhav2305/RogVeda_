import './LoadingSkeleton.css';

export function HospitalCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-subtitle" />
        <div className="skeleton-row">
          <div className="skeleton skeleton-select" />
          <div className="skeleton skeleton-select" />
        </div>
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <HospitalCardSkeleton key={i} />
      ))}
    </div>
  );
}
