import { useState, useEffect } from 'react';
import './EditLandingPage.css';
import { TopNav } from '../components/TopNav';
import { useWelcomePage } from '../contexts/WelcomePageContext';
import { updateLandingPage } from '../utils/editLandingPage';

export default function EditLandingPage() {
  const { pageData, isLoading: isLoadingData } = useWelcomePage();
  
  // State for editable content
  const [title, setTitle] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Hydrate form with welcome page data
  useEffect(() => {
    if (pageData) {
      setTitle(pageData.FoodTruckName || '');
      setAboutText(pageData.Tagline || ''); // Tagline is the About Us text
      setBackgroundImageUrl(pageData.BackgroundURL || '');
    }
  }, [pageData]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    const result = await updateLandingPage({
      title,
      aboutText,
      backgroundImageUrl
    });
    
    if (result.success) {
      setSaveMessage('✓ ' + result.message);
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('✗ ' + result.message);
    }
    
    setIsSaving(false);
  };

  const handleReset = () => {
    if (pageData) {
      setTitle(pageData.FoodTruckName || '');
      setAboutText(pageData.Tagline || ''); // Tagline is the About Us text
      setBackgroundImageUrl(pageData.BackgroundURL || '');
      setSaveMessage('');
    }
  };

  if (isLoadingData) {
    return (
      <div className="edit-landing-container">
        <TopNav />
        <div className="edit-landing-content">
          <div className="loading-message">
            <p>Loading welcome page data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-landing-container">
      <TopNav />
      
      <div className="edit-landing-content">
        <header className="edit-landing-header">
          <h1>Edit Welcome Page</h1>
          <p>Make changes on the left and see a live preview on the right</p>
        </header>

        <div className="edit-landing-main">
          {/* Editor Panel */}
          <div className="editor-panel">
            <div className="editor-header">
              <h2>✏️ Editor</h2>
              <div className="editor-actions">
                <button className="btn-reset" onClick={handleReset} disabled={isSaving}>
                  Reset
                </button>
                <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="editor-form">
              {/* Background Image URL Section */}
              <div className="form-section">
                <h3>Background Image</h3>
                <div className="form-group">
                  <label htmlFor="backgroundImageUrl">Background Image URL</label>
                  <input
                    id="backgroundImageUrl"
                    type="url"
                    value={backgroundImageUrl}
                    onChange={(e) => setBackgroundImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="field-hint">Enter a direct URL to an image. Recommended: 1920x1080px or larger.</p>
                  {backgroundImageUrl && (
                    <div className="image-preview-box">
                      <img src={backgroundImageUrl} alt="Background preview" onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Title Section */}
              <div className="form-section">
                <h3>Main Title</h3>
                <div className="form-group">
                  <label htmlFor="title">Food Truck Name</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Food Truck POS"
                  />
                  <p className="field-hint">This is the main title displayed on your welcome page.</p>
                </div>
              </div>

              {/* About Section */}
              <div className="form-section">
                <h3>About Us</h3>
                <div className="form-group">
                  <label htmlFor="about">Description</label>
                  <textarea
                    id="about"
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    placeholder="Tell visitors about your food truck..."
                    rows={6}
                  />
                  <p className="field-hint">Describe your food truck, cuisine, or story.</p>
                </div>
              </div>

              {/* Save Message */}
              {saveMessage && (
                <div className={`save-message ${saveMessage.includes('✓') ? 'success' : 'error'}`}>
                  {saveMessage}
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="preview-header">
              <h2>👁️ Live Preview</h2>
            </div>
            
            <div className="preview-content">
              <div 
                className="welcome-container"
                style={backgroundImageUrl ? {
                  backgroundImage: `url(${backgroundImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                } : {}}
              >
                <div className="welcome-header-outside">
                  <h1 className="welcome-title-outside">{title || 'Food Truck Name'}</h1>
                </div>

                <div className="welcome-card">
                  <main className="welcome-main">
                    <div className="welcome-section">
                      <div className="welcome-section-header">
                        <svg className="welcome-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 15.5 8.5 15.5s8.5-10.25 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5a3 3 0 110-6 3 3 0 010 6z" />
                        </svg>
                        <h2>Location & Hours</h2>
                      </div>
                      {pageData?.ActiveLocations && pageData.ActiveLocations.length > 0 ? (
                        pageData.ActiveLocations.map((loc, index) => (
                          <div key={index} className="location-entry">
                            <p className="location-name">{loc.LocationName}</p>
                            {loc.DaysOfWeek && loc.DaysOfWeek.length > 0 && (
                              <p className="location-day">{loc.DaysOfWeek.join(', ')} - 11:00 AM - 6:00 PM</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="no-locations">No active locations available.</p>
                      )}
                    </div>

                    <div className="welcome-section">
                      <div className="welcome-section-header">
                        <svg className="welcome-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        </svg>
                        <h2>About Us</h2>
                      </div>
                      <p>{aboutText || 'Tell visitors about your food truck...'}</p>
                    </div>
                  </main>
                </div>
                <footer className="welcome-footer">
                  © {new Date().getFullYear()} TEAM 4
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
