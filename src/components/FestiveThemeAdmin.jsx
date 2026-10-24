import { useEffect, useState } from 'react';
import { useUi } from '../context/UiContext.jsx';
import {
  FESTIVALS,
  buildDefaultFestivalConfig,
  fetchFestiveState,
  getCachedFestiveState,
  resolveActiveFestiveTheme,
  saveFestiveState,
  setFestivePreviewOverride
} from '../lib/festiveThemeData.js';

export function FestiveThemeAdmin() {
  const { toast } = useUi();
  const [state, setState] = useState(getCachedFestiveState);
  const [loading, setLoading] = useState(true);
  const [savingFestivalId, setSavingFestivalId] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Remove any preview override left by the previous theme editor.
    setFestivePreviewOverride('none');

    fetchFestiveState()
      .then(fresh => {
        if (mounted && fresh) setState(fresh);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeFestivalId = resolveActiveFestiveTheme(state);

  const setFestivalDates = async (festivalId, patch) => {
    if (savingFestivalId || loading) return;
    const current = state.themes?.[festivalId] || buildDefaultFestivalConfig(festivalId);
    const nextConfig = { ...current, ...patch };
    if (nextConfig.start_date && nextConfig.end_date && nextConfig.start_date > nextConfig.end_date) {
      toast('The end date must be on or after the start date.', 'error');
      return;
    }
    const nextState = {
      ...state,
      ...(patch.auto_schedule === true ? { manual_override: false } : {}),
      themes: { ...state.themes, [festivalId]: nextConfig }
    };
    setSavingFestivalId(festivalId);
    try {
      const result = await saveFestiveState(nextState);
      setState(result.data || nextState);
      if (!result.success) toast(result.warning || 'Saved locally, but publishing failed.', 'error');
    } catch (error) {
      toast('Could not save: ' + (error.message || 'please try again.'), 'error');
    } finally {
      setSavingFestivalId(null);
    }
  };

  const previewFestival = festivalId => {
    setFestivePreviewOverride(festivalId);
    window.open('/?festive_preview=' + festivalId, '_blank', 'noopener,noreferrer');
  };

  const setFestivalEnabled = async (festivalId, enabled) => {
    if (savingFestivalId || loading) return;

    const festival = FESTIVALS.find(item => item.id === festivalId) || FESTIVALS[0];
    setSavingFestivalId(festivalId);

    const themes = Object.fromEntries(FESTIVALS.map(item => {
      const current = state.themes?.[item.id] || buildDefaultFestivalConfig(item.id);
      return [
        item.id,
        {
          ...current,
          enabled: enabled && item.id === festivalId,
        }
      ];
    }));

    const nextState = {
      ...state,
      active_festival_id: enabled ? festivalId : 'none',
      manual_override: !enabled,
      themes
    };

    try {
      const result = await saveFestiveState(nextState);
      setState(result.data || nextState);
      if (result.success) {
        toast(festival.name + (enabled ? ' theme enabled.' : ' theme disabled.'));
      } else {
        toast(result.warning || 'The theme was saved locally, but publishing failed.', 'error');
      }
    } catch (error) {
      toast('Could not update ' + festival.name + ': ' + (error.message || 'please try again.'), 'error');
    } finally {
      setSavingFestivalId(null);
    }
  };

  return (
    <section className="festive-admin-root festive-controls-only">
      <header className="festive-admin-overview-header">
        <div>
          <div className="festive-overview-title-row">
            <h2>Festive Themes</h2>
          </div>
          <p className="festive-overview-desc">
            Preview any theme, then enable one for the storefront or schedule it for a date range. Manual deactivation pauses scheduled themes until auto-scheduling is enabled again. If schedules overlap, the latest start date wins; equal starts use the shorter window, then the order shown here.
          </p>
        </div>

        <div className={'festive-live-status-pill ' + (activeFestivalId !== 'none' ? 'is-active' : 'is-inactive')} role="status">
          <span className="festive-status-dot" />
          <span>
            {loading
              ? 'Loading theme status…'
              : activeFestivalId !== 'none'
                ? 'Active on Storefront: ' + (FESTIVALS.find(item => item.id === activeFestivalId)?.name || 'Festive')
                : 'All Festive Themes Inactive'}
          </span>
        </div>
      </header>

      <div className="festive-selector-grid festive-theme-controls-grid">
        {FESTIVALS.map(festival => {
          const isActive = activeFestivalId === festival.id;
          const isSaving = savingFestivalId === festival.id;
          const conf = state.themes?.[festival.id] || buildDefaultFestivalConfig(festival.id);

          return (
            <article className="festive-theme-card festive-theme-control-card" key={festival.id}>
              <div className="festive-card-thumb-wrap">
                <img
                  src={festival.thumb}
                  alt={festival.name + ' theme'}
                  className="festive-card-thumb-img"
                  loading="lazy"
                />
                <span className="festive-card-season-tag">{festival.season}</span>
              </div>

              <div className="festive-card-info-box">
                <div className="festive-card-title-row">
                  <span className="festive-card-name">{festival.name}</span>
                  <span className={'festive-card-status-dot ' + (isActive ? 'active' : 'draft')}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="festive-card-tagline">{festival.tagline}</span>

                <div className="festive-theme-control-actions">
                  <button
                    type="button"
                    className="festive-theme-enable"
                    onClick={() => setFestivalEnabled(festival.id, true)}
                    disabled={loading || !!savingFestivalId || isActive}
                  >
                    Enable
                  </button>
                  <button
                    type="button"
                    className="festive-theme-disable"
                    onClick={() => setFestivalEnabled(festival.id, false)}
                    disabled={loading || !!savingFestivalId || !isActive}
                  >
                    Disable
                  </button>
                  <button type="button" className="festive-theme-disable" onClick={() => previewFestival(festival.id)} disabled={loading}>
                    Preview
                  </button>
                </div>

                <div className="festive-theme-schedule" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem' }}>
                    <input
                      type="checkbox"
                      checked={!!conf.auto_schedule}
                      disabled={loading || !!savingFestivalId}
                      onChange={e => setFestivalDates(festival.id, { auto_schedule: e.target.checked })}
                    />
                    Auto-activate between these dates
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="date" style={{ fontSize: '.78rem', flex: 1 }} value={conf.start_date || ''}
                      disabled={loading || !!savingFestivalId}
                      onChange={e => setFestivalDates(festival.id, { start_date: e.target.value })}
                      aria-label={festival.name + ' auto-activation start date'}
                    />
                    <input
                      type="date" style={{ fontSize: '.78rem', flex: 1 }} value={conf.end_date || ''}
                      disabled={loading || !!savingFestivalId}
                      onChange={e => setFestivalDates(festival.id, { end_date: e.target.value })}
                      aria-label={festival.name + ' auto-activation end date'}
                    />
                  </div>
                </div>
                {isSaving && <span className="festive-theme-saving" role="status">Saving…</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// Re-export as DiwaliThemeManager for zero-breakage compatibility
export { FestiveThemeAdmin as DiwaliThemeManager };
