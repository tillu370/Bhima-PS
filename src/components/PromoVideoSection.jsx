import { useEffect, useState } from 'react';
import { fetchPromoVideo, getCachedPromoVideo } from '../lib/videoData.js';

// Short brand / product / process video on the home page. Hidden entirely
// (no broken player) when disabled or no video URL is configured.
export function PromoVideoSection() {
  const [video, setVideo] = useState(getCachedPromoVideo);
  useEffect(() => {
    let on = true;
    fetchPromoVideo().then(v => { if (on) setVideo(v); });
    const onUpdate = e => { if (e.detail) setVideo(e.detail); };
    window.addEventListener('bps_promo_video_updated', onUpdate);
    return () => { on = false; window.removeEventListener('bps_promo_video_updated', onUpdate); };
  }, []);

  if (!video || !video.is_active || !video.video_url) return null;

  return (
    <section className="promo-video-section" aria-label="Promotional video">
      <div className="container">
        <div className="promo-video-player-wrap">
          <video
            className="promo-video-player"
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            controls
            muted
            preload="metadata"
            playsInline
          />
        </div>
      </div>
    </section>
  );
}
