import React from 'react';
import { useApp } from '../context/AppContext';
import { parseRoute } from '../utils/routes';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

/**
 * SEO-Optimized Link Component
 * Emits semantic, crawlable <a> tags with real hrefs for Googlebot and search engines,
 * while intercepting local left-clicks for seamless instant SPA navigation.
 */
export const Link: React.FC<LinkProps> = ({
  to,
  children,
  className = '',
  activeClassName = '',
  onClick,
  target,
  ...props
}) => {
  const { currentView, setCurrentView, selectedBrandId, setSelectedBrandId, setSelectedMethodologySlug } = useApp();

  const isExternal = to.startsWith('http://') || to.startsWith('https://') || to.startsWith('mailto:') || to.startsWith('tel:');

  // Check if link corresponds to currently active view
  const parsed = parseRoute(to);
  const isActive = !isExternal && (
    (parsed.view === currentView && (!parsed.brandId || parsed.brandId === selectedBrandId))
  );

  const combinedClassName = `${className} ${isActive && activeClassName ? activeClassName : ''}`.trim();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If onClick handler was passed, execute it
    if (onClick) {
      onClick(e);
    }

    // Standard external links or modifier clicks (new tab / new window) should work normally
    if (
      isExternal ||
      target === '_blank' ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    e.preventDefault();

    if (parsed.brandId) {
      setSelectedBrandId(parsed.brandId);
    }
    if (parsed.methodologySlug !== undefined) {
      setSelectedMethodologySlug(parsed.methodologySlug);
    } else if (parsed.view === 'research-methodology') {
      setSelectedMethodologySlug(null);
    }
    setCurrentView(parsed.view, true, parsed.brandId, to);
  };

  return (
    <a
      href={to}
      className={combinedClassName}
      onClick={handleClick}
      target={target}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  );
};
