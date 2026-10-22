import { useState } from 'react';
import { imgUrl, PLACEHOLDER_IMG } from '../lib/utils.js';

// Keep the requested image first, then try its relevant fallback(s), then the
// site's existing branded placeholder. A source is only replaced after an
// actual image error event.
export function SafeImage({ src, fallbackSrc, onError, ...props }) {
  const fallbacks = Array.isArray(fallbackSrc) ? fallbackSrc : [fallbackSrc];
  const candidates = [...new Set([
    ...[src, ...fallbacks].filter(Boolean).map(imgUrl),
    PLACEHOLDER_IMG
  ])];
  const sourceKey = candidates.join('\u0000');
  const [failedSources, setFailedSources] = useState({ key: sourceKey, count: 0 });
  const failedCount = failedSources.key === sourceKey ? failedSources.count : 0;
  const currentSource = candidates[Math.min(failedCount, candidates.length - 1)] || PLACEHOLDER_IMG;

  const handleError = event => {
    onError?.(event);
    setFailedSources(previous => ({
      key: sourceKey,
      count: Math.min((previous.key === sourceKey ? previous.count : 0) + 1, candidates.length - 1)
    }));
  };

  return <img {...props} src={currentSource} onError={handleError} />;
}
