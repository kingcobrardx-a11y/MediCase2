import React from 'react';

/**
 * PageHeader Component
 * Consistent title banner for every step and dashboard view.
 */
export default function PageHeader({
  stepNumber,
  title,
  subtitle,
  badge,
  action,
}) {
  return (
    <div className="page-header">
      {(stepNumber || badge) && (
        <div className="page-header-badge">
          {stepNumber && <span>{stepNumber}</span>}
          {badge && <span>• {badge}</span>}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
