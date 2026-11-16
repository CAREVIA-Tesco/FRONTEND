import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Every link click opens the new page at the top – also when the link points to the page already open
// (e.g. a footer link to the current service). 'instant' skips the site's smooth scrolling, so the new page
// does not appear half-way down while it glides up from the footer.
export default function ScrollToTop() {
  const { key, pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [key, pathname, hash]);
  return null;
}
