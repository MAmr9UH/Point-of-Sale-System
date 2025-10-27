import { useState } from 'react';
import './EditLandingPage.css';
import { TopNav } from '../components/TopNav';
import { uploadFile } from '../utils/uploadFile';

export default function EditLandingPage() {
  // State for editable content
  const [title, setTitle] = useState('Food Truck POS');
  const [subtitle, setSubtitle] = useState('🚚 Fresh • Fast • Friendly');
  const [location, setLocation] = useState('Houston, Texas');
  const [hours, setHours] = useState('Tue–Sun • 11:00 AM – 8:00 PM');
  const [aboutText, setAboutText] = useState('We are CS students trying to survive Professor Uma class...');
  const [footerText, setFooterText] = useState('TEAM 4');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const imageUrl = await uploadFile(file);
      setBackgroundImage(imageUrl);
      console.log('Image uploaded successfully:', imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };


  const handleSave = () => {
    const data = {
      title,
      subtitle,
      location,
      hours,
      aboutText,
      footerText,
      backgroundImage
    };
    console.log('Saving welcome page data:', data);
    // TODO: Add API call to save data to backend
    alert('Welcome page settings saved! (Note: Backend integration pending)');
  };

  const handleReset = () => {
    setTitle('Food Truck POS');
    setSubtitle('🚚 Fresh • Fast • Friendly');
    setLocation('Houston, Texas');
    setHours('Tue–Sun • 11:00 AM – 8:00 PM');
    setAboutText('We are CS students trying to survive Professor Uma class...');
    setFooterText('TEAM 4');
    setBackgroundImage('');
    setUploadError('');
  };

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
                <button className="btn-reset" onClick={handleReset}>
                  Reset
                </button>
                <button className="btn-save" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            </div>

            <div className="editor-form">
              {/* Background Image Section */}
              <div className="form-section">
                <h3>Background Image</h3>
                <div className="form-group">
                  <label htmlFor="backgroundImage">Upload Background Image</label>
                  <div className="image-upload-container">
                    <input
                      id="backgroundImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    {isUploading && <p className="upload-status">Uploading...</p>}
                    {uploadError && <p className="upload-error">{uploadError}</p>}
                    {backgroundImage && (
                      <div className="image-preview-box">
                        <img src={backgroundImage} alt="Background preview" />
                        <button 
                          className="btn-remove-image"
                          onClick={() => setBackgroundImage('')}
                          type="button"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="field-hint">Recommended: 1920x1080px or larger. Max size: 5MB</p>
                </div>
              </div>

              {/* Title Section */}
              <div className="form-section">
                <h3>Header</h3>
                <div className="form-group">
                  <label htmlFor="title">Main Title</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Food Truck POS"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subtitle">Subtitle</label>
                  <input
                    id="subtitle"
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="🚚 Fresh • Fast • Friendly"
                  />
                </div>
              </div>

              {/* Location Section */}
              <div className="form-section">
                <h3>Location & Hours</h3>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Houston, Texas"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hours">Operating Hours</label>
                  <input
                    id="hours"
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Tue–Sun • 11:00 AM – 8:00 PM"
                  />
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
                    rows={4}
                  />
                </div>
              </div>

              {/* Footer Section */}
              <div className="form-section">
                <h3>Footer</h3>
                <div className="form-group">
                  <label htmlFor="footer">Footer Text</label>
                  <input
                    id="footer"
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="TEAM 4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <div className="preview-header">
              <h2>👁️ Live Preview</h2>
            </div>
            
            <div className="preview-content">
              <div 
                className="welcome-preview-container"
                style={backgroundImage ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                } : {}}
              >
                <div className="welcome-preview-card">
                  <header className="welcome-preview-header">
                    <h1 className="welcome-preview-title">{title}</h1>
                    <p className="welcome-preview-subtitle">{subtitle}</p>
                  </header>

                  <main className="welcome-preview-main">
                    <div className="welcome-preview-section">
                      <div className="welcome-preview-section-header">
                        <svg className="welcome-preview-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 15.5 8.5 15.5s8.5-10.25 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5a3 3 0 110-6 3 3 0 010 6z" />
                        </svg>
                        <h2>Location & Hours</h2>
                      </div>
                      <p>{location}</p>
                      <p>{hours}</p>
                    </div>

                    <div className="welcome-preview-section">
                      <div className="welcome-preview-section-header">
                        <svg className="welcome-preview-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                        </svg>
                        <h2>About Us</h2>
                      </div>
                      <p>{aboutText}</p>
                    </div>
                  </main>
                </div>
                <footer className="welcome-preview-footer">
                  © {new Date().getFullYear()} {footerText}
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
