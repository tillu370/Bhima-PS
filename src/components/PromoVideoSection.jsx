import { useEffect, useRef, useState } from 'react';
import { fetchPromoVideo, getCachedPromoVideo } from '../lib/videoData.js';

// Short brand / product / process video on the home page. Hidden entirely
// (no broken player) when disabled or no video URL is configured.
export function PromoVideoSection() {
  const [video, setVideo] = useState(getCachedPromoVideo);
  const videoRef = useRef(null);

  useEffect(() => {
    let on = true;
    fetchPromoVideo().then(v => { if (on) setVideo(v); });
    const onUpdate = e => { if (e.detail) setVideo(e.detail); };
    window.addEventListener('bps_promo_video_updated', onUpdate);
    return () => { on = false; window.removeEventListener('bps_promo_video_updated', onUpdate); };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [video?.video_url]);

  if (!video || !video.is_active || !video.video_url) return null;

  return (
    <section className="promo-video-section" aria-label="Promotional video">
      <div className="container">
        <div className="promo-video-player-wrap">
          <video
            ref={videoRef}
            className="promo-video-player"
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            autoPlay
            loop
            muted
            controls
            preload="auto"
            playsInline
          />
        </div>
      </div>
    </section>
  );
}
