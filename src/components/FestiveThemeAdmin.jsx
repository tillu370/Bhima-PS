import { useEffect, useState } from 'react';
import { useUi } from '../context/UiContext.jsx';
import { TopBar } from './TopBar.jsx';
import { DiwaliHeroBanner } from './DiwaliHeroBanner.jsx';
import { HomePromoBanners } from './HomePromoBanners.jsx';
import {
  FESTIVALS,
  buildDefaultFestivalConfig,
  fetchFestiveState,
  getCachedFestiveState,
  getFestivePreviewOverride,
  resolveActiveFestiveTheme,
  saveFestiveState,
  setFestivePreviewOverride
} from '../lib/festiveThemeData.js';

export function FestiveThemeAdmin() {
  const { toast } = useUi();
  const [state, setState] = useState(getCachedFestiveState);
  const [selectedFestivalId, setSelectedFestivalId] = useState('diwali');
  const [viewMode, setViewMode] = useState('settings'); // 'settings' | 'split' | 'preview'
  const [previewTheme, setPreviewTheme] = useState(() => getFestivePreviewOverride());
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedFestivalId, setSavedFestivalId] = useState(null);

  useEffect(() => {
    fetchFestiveState().then(fresh => {
      if (fresh) {
        setState(fresh);
        if (fresh.active_festival_id && fresh.active_festival_id !== 'none') {
          setSelectedFestivalId(fresh.active_festival_id);
        }
      }
    });
  }, []);

  const currentFestivalMeta = FESTIVALS.find(f => f.id === selectedFestivalId) || FESTIVALS[0];
  const currentConfig = state.themes?.[selectedFestivalId] || buildDefaultFestivalConfig(selectedFestivalId);

  const updateSelectedConfig = (key, value) => {
    const nextConfig = { ...currentConfig, [key]: value };
    setState(prev => ({
      ...prev,
      themes: {
        ...prev.themes,
        [selectedFestivalId]: nextConfig
      }
    }));
    if (previewTheme === selectedFestivalId) setFestivePreviewOverride(selectedFestivalId, nextConfig);
    if (savedFestivalId === selectedFestivalId) setSavedFestivalId(null);
    setDirty(true);
  };

  const activeStorefrontFestivalId = resolveActiveFestiveTheme(state);
  const isAnyFestivalActive = activeStorefrontFestivalId !== 'none';
  const activeFestivalMeta = isAnyFestivalActive ? FESTIVALS.find(f => f.id === activeStorefrontFestivalId) : null;

  const handleToggleStorefrontPreview = () => {
    if (previewTheme === selectedFestivalId) {
      setFestivePreviewOverride('none');
      setPreviewTheme(null);
      toast('Exited storefront preview mode.');
    } else {
      setFestivePreviewOverride(selectedFestivalId, currentConfig);
      setPreviewTheme(selectedFestivalId);
      toast(`Previewing ${currentFestivalMeta.name} on the storefront!`);
    }
  };

  const handleSaveAndPublish = async e => {
    if (e) e.preventDefault();
    setSaving(true);
    // If the currently edited festival is enabled, make it active_festival_id
    const updatedState = {
      ...state,
      active_festival_id: currentConfig.enabled ? selectedFestivalId : (state.active_festival_id === selectedFestivalId ? 'none' : state.active_festival_id)
    };
    try {
      const res = await saveFestiveState(updatedState);
      setState(res.data || updatedState);
      if (previewTheme === selectedFestivalId) {
        setFestivePreviewOverride(selectedFestivalId, updatedState.themes[selectedFestivalId]);
      }
      setDirty(!res.success);
      if (res.success) setSavedFestivalId(selectedFestivalId);
      if (res.warning) toast(res.warning, res.success ? undefined : 'error');
      else toast(`${currentFestivalMeta.name} theme settings saved and published successfully!`);
    } catch (error) {
      setDirty(true);
      toast(`Could not publish ${currentFestivalMeta.name}: ${error.message || 'please try again.'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const ok = window.confirm(
      `Are you sure you want to reset all ${currentFestivalMeta.name} settings to the recommended defaults? Custom changes will be cleared.`
    );
    if (!ok) return;

    const freshDefault = buildDefaultFestivalConfig(selectedFestivalId);
    setState(prev => ({
      ...prev,
      themes: {
        ...prev.themes,
        [selectedFestivalId]: freshDefault
      }
    }));
    if (previewTheme === selectedFestivalId) setFestivePreviewOverride(selectedFestivalId, freshDefault);
    if (savedFestivalId === selectedFestivalId) setSavedFestivalId(null);
    setDirty(true);
    toast(`${currentFestivalMeta.name} settings reset to defaults. Click "Save & Publish" to apply.`);
  };

  return (
    <div className="festive-admin-root">
      {/* -----------------------------------------------------------------
          1. Clean Dashboard Overview Header
          ----------------------------------------------------------------- */}
      <div className="festive-admin-overview-header">
        <div>
          <div className="festive-overview-title-row">
            <h2>Festive Theme &amp; Visual Settings</h2>
            {dirty ? (
              <span className="festive-dirty-indicator" title="You have unsaved changes">
                ● Unsaved Changes
              </span>
            ) : savedFestivalId === selectedFestivalId ? (
              <span className="festive-saved-indicator" role="status">✓ Changes saved</span>
            ) : null}
          </div>
          <p className="festive-overview-desc">
            Manage storefront themes, hero banners, top announcements, splash screens, and seasonal campaigns for major Indian festivals.
          </p>
        </div>

        <div className="festive-overview-actions-wrap">
          <div className={'festive-live-status-pill ' + (isAnyFestivalActive ? 'is-active' : 'is-inactive')}>
            <span className="festive-status-dot" />
            <span>
              {isAnyFestivalActive
                ? `Active on Storefront: ${activeFestivalMeta?.name || 'Festive'}`
                : 'All Festive Themes Inactive'}
            </span>
          </div>

          <button
            type="button"
            className="admin-btn-preview"
            onClick={handleToggleStorefrontPreview}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>
              {previewTheme === selectedFestivalId
                ? `Exit ${currentFestivalMeta.name} Preview`
                : `Preview ${currentFestivalMeta.name} Storefront`}
            </span>
          </button>
        </div>
      </div>

      {/* -----------------------------------------------------------------
          2. Visual Festival Selector Grid (Diwali, Christmas, New Year, Sankranthi)
          ----------------------------------------------------------------- */}
      <div className="festive-selector-section">
        <h3 className="festive-section-heading">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#D4AF37" strokeWidth="2" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Select Festival to Configure
        </h3>
        <p className="festive-section-subheading">
          Choose a festival theme below to customize its visual assets, hero copy, announcement message, and schedule.
        </p>

        <div className="festive-selector-grid">
          {FESTIVALS.map(f => {
            const isSelected = selectedFestivalId === f.id;
            const fConfig = state.themes?.[f.id] || {};
            const isLive = activeStorefrontFestivalId === f.id;

            return (
              <button
                type="button"
                key={f.id}
                className={'festive-theme-card' + (isSelected ? ' is-selected' : '')}
                onClick={() => setSelectedFestivalId(f.id)}
                aria-pressed={isSelected}
              >
                <div className="festive-card-thumb-wrap">
                  <img
                    src={f.thumb}
                    alt={`${f.name} Theme Preview`}
                    className="festive-card-thumb-img"
                    loading="lazy"
                  />
                  {isSelected && (
                    <span className="festive-card-selected-badge">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Selected Theme
                    </span>
                  )}
                  <span className="festive-card-season-tag">{f.season}</span>
                </div>

                <div className="festive-card-info-box">
                  <div className="festive-card-title-row">
                    <span className="festive-card-name">{f.name}</span>
                    <span className={'festive-card-status-dot ' + (isLive ? 'active' : (fConfig.enabled ? 'active' : 'draft'))}>
                      {isLive ? 'Live on Store' : (fConfig.enabled ? 'Enabled' : 'Disabled')}
                    </span>
                  </div>
                  <span className="festive-card-tagline">{f.tagline}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* -----------------------------------------------------------------
          3. Workspace Mode Switcher (Settings / Split View / Full Preview)
          ----------------------------------------------------------------- */}
      <div className="festive-view-tabs" role="tablist" aria-label="Workspace View Mode">
        <button
          type="button"
          className={'festive-view-tab-btn' + (viewMode === 'settings' ? ' active' : '')}
          onClick={() => setViewMode('settings')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Configuration Settings</span>
        </button>

        <button
          type="button"
          className={'festive-view-tab-btn' + (viewMode === 'split' ? ' active' : '')}
          onClick={() => setViewMode('split')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
          <span>Split View (Settings + Live Preview)</span>
        </button>

        <button
          type="button"
          className={'festive-view-tab-btn' + (viewMode === 'preview' ? ' active' : '')}
          onClick={() => setViewMode('preview')}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>Full Live Preview</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className={'festive-workspace-grid' + (viewMode === 'split' ? ' is-split' : '') + (viewMode === 'preview' ? ' is-preview-only' : '')}>
        {/* =================================================================
            LEFT / MAIN COLUMN: Settings Forms
            ================================================================= */}
        {viewMode !== 'preview' && (
          <form onSubmit={handleSaveAndPublish}>
            {/* Card A: Activation & Scheduling */}
            <div className="festive-settings-card">
              <div className="festive-card-header">
                <div className="festive-card-header-left">
                  <div className="festive-card-header-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h3>Activation &amp; Scheduling</h3>
                    <p>Control whether {currentFestivalMeta.name} is active immediately or on set dates.</p>
                  </div>
                </div>
              </div>

              <div className="admin-toggle-list">
                {/* Manual Enable */}
                <div className="admin-toggle-item">
                  <div className="admin-toggle-text">
                    <strong>Enable {currentFestivalMeta.name} Theme Manually</strong>
                    <span>Immediately activates this theme on the storefront. Overrides schedule.</span>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={!!currentConfig.enabled}
                      onChange={e => updateSelectedConfig('enabled', e.target.checked)}
                    />
                    <span className="admin-switch-slider" />
                  </label>
                </div>

                {/* Auto Schedule */}
                <div className="admin-toggle-item">
                  <div className="admin-toggle-text">
                    <strong>Date-Based Auto Activation</strong>
                    <span>Automatically activate this theme within the configured date range.</span>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={!!currentConfig.auto_schedule}
                      onChange={e => updateSelectedConfig('auto_schedule', e.target.checked)}
                    />
                    <span className="admin-switch-slider" />
                  </label>
                </div>

                {currentConfig.auto_schedule && (
                  <div className="admin-two-col-grid" style={{ padding: '0 4px' }}>
                    <div>
                      <label className="admin-input-label">Schedule Start Date</label>
                      <input
                        type="date"
                        className="admin-text-input"
                        value={currentConfig.start_date || ''}
                        onChange={e => updateSelectedConfig('start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="admin-input-label">Schedule End Date</label>
                      <input
                        type="date"
                        className="admin-text-input"
                        value={currentConfig.end_date || ''}
                        onChange={e => updateSelectedConfig('end_date', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Splash Screen Toggle */}
                <div className="admin-toggle-item">
                  <div className="admin-toggle-text">
                    <strong>Festive Welcome Splash Screen</strong>
                    <span>Displays an elegant welcome screen with brand logo once per session.</span>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={!!currentConfig.splash_enabled}
                      onChange={e => updateSelectedConfig('splash_enabled', e.target.checked)}
                    />
                    <span className="admin-switch-slider" />
                  </label>
                </div>

                {/* Pattern Texture Toggle */}
                <div className="admin-toggle-item">
                  <div className="admin-toggle-text">
                    <strong>Subtle Background Pattern Texture</strong>
                    <span>Applies a subtle, restrained seasonal pattern overlay to the hero section.</span>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={!!currentConfig.texture_enabled}
                      onChange={e => updateSelectedConfig('texture_enabled', e.target.checked)}
                    />
                    <span className="admin-switch-slider" />
                  </label>
                </div>
              </div>
            </div>

            {/* Card B: Top Announcement Bar */}
            <div className="festive-settings-card">
              <div className="festive-card-header">
                <div className="festive-card-header-left">
                  <div className="festive-card-header-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  </div>
                  <div>
                    <h3>Top Announcement Bar</h3>
                    <p>Customize the announcement strip shown above the website navigation.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="admin-input-label">Announcement Text</label>
                <input
                  type="text"
                  className="admin-text-input"
                  value={currentConfig.announcement_text || ''}
                  onChange={e => updateSelectedConfig('announcement_text', e.target.value)}
                  placeholder={`${currentFestivalMeta.name} Specials | Personalised Gifts & Prints`}
                />
              </div>

              <div className="admin-two-col-grid">
                <div>
                  <label className="admin-input-label">CTA Button Label</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.announcement_cta_label || ''}
                    onChange={e => updateSelectedConfig('announcement_cta_label', e.target.value)}
                    placeholder="Explore Collection"
                  />
                </div>
                <div>
                  <label className="admin-input-label">CTA Target Link</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.announcement_cta_link || ''}
                    onChange={e => updateSelectedConfig('announcement_cta_link', e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>

              {/* In-Card Live Announcement Bar Preview */}
              <div style={{ marginTop: 16 }}>
                <span className="admin-preview-label-tag">✦ Live Announcement Strip Preview</span>
                <div style={{
                  background: `linear-gradient(90deg, ${currentFestivalMeta.primaryColor} 0%, ${currentFestivalMeta.secondaryColor} 100%)`,
                  border: `1px solid ${currentFestivalMeta.accentColor}60`,
                  borderRadius: 10,
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: currentFestivalMeta.highlightColor }}>✦</span>
                    <span style={{ fontWeight: 600 }}>{currentConfig.announcement_text || `${currentFestivalMeta.name} Specials`}</span>
                  </div>
                  <span style={{
                    background: `linear-gradient(135deg, ${currentFestivalMeta.accentColor}, ${currentFestivalMeta.highlightColor})`,
                    color: currentFestivalMeta.primaryColor,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    fontWeight: 800,
                    fontSize: '0.74rem'
                  }}>
                    {currentConfig.announcement_cta_label || 'Explore'} →
                  </span>
                </div>
              </div>
            </div>

            {/* Card C: Homepage Hero Banner */}
            <div className="festive-settings-card">
              <div className="festive-card-header">
                <div className="festive-card-header-left">
                  <div className="festive-card-header-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div>
                    <h3>Homepage Hero Banner</h3>
                    <p>Select the 16:9 hero background and edit the HTML headline, description and buttons.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="admin-input-label">Select Hero Image (16:9 Aspect Ratio)</label>
                <div className="admin-image-picker-grid">
                  {currentFestivalMeta.heroImages.map(img => {
                    const isSelected = currentConfig.hero_image === img.path;
                    return (
                      <button
                        type="button"
                        key={img.id}
                        className={'admin-image-card' + (isSelected ? ' is-active' : '')}
                        onClick={() => updateSelectedConfig('hero_image', img.path)}
                        aria-pressed={isSelected}
                      >
                        <div className="admin-image-card-thumb-wrap">
                          <img src={img.path} alt={img.name} loading="lazy" />
                          {isSelected && <span className="admin-image-card-badge">✓ Selected</span>}
                        </div>
                        <div className="admin-image-card-body">
                          <div className="admin-image-card-name">{img.name}</div>
                          <div className="admin-image-card-desc">{img.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="admin-two-col-grid" style={{ marginBottom: 14 }}>
                <div>
                  <label className="admin-input-label">Hero Eyebrow Tag</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.hero_eyebrow || ''}
                    onChange={e => updateSelectedConfig('hero_eyebrow', e.target.value)}
                    placeholder="FESTIVE COLLECTION"
                  />
                </div>
                <div>
                  <label className="admin-input-label">Hero Headline</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.hero_headline || ''}
                    onChange={e => updateSelectedConfig('hero_headline', e.target.value)}
                    placeholder="Make It Personal"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="admin-input-label">Hero Description</label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={currentConfig.hero_description || ''}
                  onChange={e => updateSelectedConfig('hero_description', e.target.value)}
                  placeholder="Personalised gifts and custom prints crafted for memorable celebrations."
                />
              </div>

              <div className="admin-two-col-grid">
                <div>
                  <label className="admin-input-label">Primary CTA Label</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.hero_cta_label || ''}
                    onChange={e => updateSelectedConfig('hero_cta_label', e.target.value)}
                    placeholder="Explore Collection"
                  />
                </div>
                <div>
                  <label className="admin-input-label">Primary CTA Link</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.hero_cta_link || ''}
                    onChange={e => updateSelectedConfig('hero_cta_link', e.target.value)}
                    placeholder="/products"
                  />
                </div>
              </div>
            </div>

            {/* Card D: Festive Promotional Banner */}
            <div className="festive-settings-card">
              <div className="festive-card-header">
                <div className="festive-card-header-left">
                  <div className="festive-card-header-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div>
                    <h3>Festive Promotional Banner Slot</h3>
                    <p>Replaces the standard right promo card on the homepage while this festival is active.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="admin-input-label">Select Promotional Banner Image</label>
                <div className="admin-image-picker-grid">
                  {currentFestivalMeta.promoImages.map(img => {
                    const isSelected = currentConfig.promo_image === img.path;
                    return (
                      <button
                        type="button"
                        key={img.id}
                        className={'admin-image-card' + (isSelected ? ' is-active' : '')}
                        onClick={() => updateSelectedConfig('promo_image', img.path)}
                        aria-pressed={isSelected}
                      >
                        <div className="admin-image-card-thumb-wrap">
                          <img src={img.path} alt={img.name} loading="lazy" />
                          {isSelected && <span className="admin-image-card-badge">✓ Selected</span>}
                        </div>
                        <div className="admin-image-card-body">
                          <div className="admin-image-card-name">{img.name}</div>
                          <div className="admin-image-card-desc">{img.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="admin-two-col-grid" style={{ marginBottom: 14 }}>
                <div>
                  <label className="admin-input-label">Promo Eyebrow Pill</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.promo_eyebrow || ''}
                    onChange={e => updateSelectedConfig('promo_eyebrow', e.target.value)}
                    placeholder="SEASONAL SPECIALS"
                  />
                </div>
                <div>
                  <label className="admin-input-label">Promo Title</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.promo_title || ''}
                    onChange={e => updateSelectedConfig('promo_title', e.target.value)}
                    placeholder="Personalised Gift Hampers"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="admin-input-label">Promo Description</label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={currentConfig.promo_description || ''}
                  onChange={e => updateSelectedConfig('promo_description', e.target.value)}
                  placeholder="Custom ceramic mugs, engraved wooden frames & corporate hampers."
                />
              </div>

              <div className="admin-two-col-grid">
                <div>
                  <label className="admin-input-label">Promo CTA Label</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.promo_cta_label || ''}
                    onChange={e => updateSelectedConfig('promo_cta_label', e.target.value)}
                    placeholder="Shop Festive Gifts"
                  />
                </div>
                <div>
                  <label className="admin-input-label">Promo Target Link</label>
                  <input
                    type="text"
                    className="admin-text-input"
                    value={currentConfig.promo_cta_link || ''}
                    onChange={e => updateSelectedConfig('promo_cta_link', e.target.value)}
                    placeholder="/products?cat=photo-frames"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="festive-admin-action-bar">
              <button
                type="button"
                className="admin-btn-reset"
                onClick={handleResetDefaults}
              >
                Reset to Recommended Defaults
              </button>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  className="admin-btn-preview"
                  onClick={handleToggleStorefrontPreview}
                >
                  {previewTheme === selectedFestivalId ? 'Exit Preview' : '👁 Preview Storefront'}
                </button>

                <button
                  type="submit"
                  className="admin-btn-save"
                  disabled={saving || !dirty}
                >
                  {saving ? 'Publishing...' : (dirty ? `Save & Publish ${currentFestivalMeta.name}` : (activeStorefrontFestivalId === selectedFestivalId ? 'Published & Live' : 'Changes Saved'))}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* =================================================================
            RIGHT / PREVIEW COLUMN: Live Storefront Workspace
            ================================================================= */}
        {viewMode !== 'settings' && (
          <div className="admin-live-workspace-panel">
            <div className="festive-settings-card" style={{ padding: 20 }}>
              <div className="festive-card-header" style={{ marginBottom: 12, paddingBottom: 10 }}>
                <div className="festive-card-header-left">
                  <div className="festive-card-header-icon" style={{ background: currentFestivalMeta.primaryColor, color: currentFestivalMeta.highlightColor }}>
                    ✦
                  </div>
                  <div>
                    <h3>Live Storefront Preview Workspace</h3>
                    <p>Real-time rendering of {currentFestivalMeta.name} banner and promotional card.</p>
                  </div>
                </div>
              </div>

              <div className="festive-preview-stage" data-festive-theme={currentFestivalMeta.id}>
                <span className="admin-preview-label-tag">Top Announcement Bar</span>
                <TopBar preview previewConfig={currentConfig} />

                <span className="admin-preview-label-tag">Homepage Hero Banner</span>
                <DiwaliHeroBanner config={currentConfig} preview />

                <span className="admin-preview-label-tag">Homepage Promotional Card</span>
                <HomePromoBanners isFestive config={currentConfig} preview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export as DiwaliThemeManager for zero-breakage compatibility
export { FestiveThemeAdmin as DiwaliThemeManager };
