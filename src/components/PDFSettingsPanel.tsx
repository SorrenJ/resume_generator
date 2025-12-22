import { useState, useEffect } from 'react';

// Add this interface for type safety
interface PDFSettings {
  fontSize: number;
  lineHeight: number;
  margins: number;
  showFullURLs: boolean;
}

// Create this component/function for the UI controls
export const PDFSettingsPanel = ({ onSettingsChange }: { onSettingsChange: (settings: PDFSettings) => void }) => {
  const [settings, setSettings] = useState<PDFSettings>({
    fontSize: 10,
    lineHeight: 0.2,
    margins: 0.5,
    showFullURLs: false
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Notify parent when settings change
  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handleChange = (key: keyof PDFSettings, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setSettings({
      fontSize: 10,
      lineHeight: 0.2,
      margins: 0.5,
      showFullURLs: false
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      minWidth: '250px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 16px',
          backgroundColor: '#f5f5f5',
          borderBottom: isExpanded ? '1px solid #ddd' : 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}
      >
        <span style={{ fontWeight: 'bold', color: '#333' }}>
          PDF Export Settings
        </span>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Settings Panel */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {/* Font Size Control */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333' }}>
              Font Size: <strong>{settings.fontSize}pt</strong>
            </label>
            <input
              type="range"
              min="8"
              max="14"
              step="0.5"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>

          {/* Line Height Control */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333' }}>
              Line Height: <strong>{settings.lineHeight.toFixed(2)} in</strong>
            </label>
            <input
              type="range"
              min="0.15"
              max="0.3"
              step="0.01"
              value={settings.lineHeight}
              onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
              <span>Tighter</span>
              <span>Looser</span>
            </div>
          </div>

          {/* Margins Control */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333' }}>
              Margins: <strong>{settings.margins.toFixed(2)} in</strong>
            </label>
            <input
              type="range"
              min="0.25"
              max="1.0"
              step="0.05"
              value={settings.margins}
              onChange={(e) => handleChange('margins', parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
              <span>Narrow</span>
              <span>Wide</span>
            </div>
          </div>

          {/* Show URLs Toggle */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <label style={{ flex: 1, fontSize: '14px', color: '#333' }}>
              Show Full URLs in PDF
            </label>
            <div
              onClick={() => handleChange('showFullURLs', !settings.showFullURLs)}
              style={{
                width: '44px',
                height: '24px',
                backgroundColor: settings.showFullURLs ? '#007bff' : '#ddd',
                borderRadius: '12px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: settings.showFullURLs ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              />
            </div>
          </div>

          {/* Preview Button */}
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={() => {
                // This would trigger a preview - you can implement this as needed
                alert(`Current settings:\nFont: ${settings.fontSize}pt\nLine Height: ${settings.lineHeight}in\nMargins: ${settings.margins}in\nShow URLs: ${settings.showFullURLs ? 'Yes' : 'No'}`);
              }}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Preview PDF with Current Settings
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reset to Defaults
          </button>

          {/* Info Text */}
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Settings apply to next PDF export
          </div>
        </div>
      )}
    </div>
  );
};
