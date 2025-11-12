import "./WelcomePageDD.css";
import "./WelcomePageDD-Carousel.css";
import {TopNav} from "../components/TopNav";
import { useWelcomePage } from "../contexts/WelcomePageContext";
import { useState, useEffect } from "react";

interface CustomerFeedback {
  Rating: number;
  Comments: string;
  SubmittedAt: string;
  Fname: string;
  Lname: string;
}

export default function WelcomePageDD() {

  const { pageData, isLoading, error } = useWelcomePage();
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch('/api/welcome/feedback');
        if (response.ok) {
          const data = await response.json();
          setFeedback(data);
        }
      } catch (err) {
        console.error('Failed to fetch feedback:', err);
      }
    };
    
    fetchFeedback();
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (feedback.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFeedbackIndex((prev) => 
        prev === feedback.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [feedback]);

  const handlePrevFeedback = () => {
    setCurrentFeedbackIndex((prev) => 
      prev === 0 ? feedback.length - 1 : prev - 1
    );
  };

  const handleNextFeedback = () => {
    setCurrentFeedbackIndex((prev) => 
      prev === feedback.length - 1 ? 0 : prev + 1
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="feedback-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="welcome-container">
        <TopNav />
        <div className="welcome-card loading-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="welcome-container">
        <TopNav />
        <div className="welcome-card">
          <p style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
            Error loading page data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Debug: Log background URL
  console.log('WelcomePage - BackgroundURL:', pageData?.BackgroundURL);

  return (
    <div 
      className="welcome-container" 
      style={{
        backgroundImage: pageData?.BackgroundURL ? `url("${pageData.BackgroundURL}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
       <TopNav />
       
      <header className="welcome-header-outside fade-in">
        <h1 className="welcome-title-outside">{pageData?.FoodTruckName || "Default Name"}</h1>
      </header>
       
      <div className="welcome-card slide-in">
        <main className="welcome-main">
          <div className="welcome-section fade-in delay-1">
            <div className="welcome-section-header">
              <svg className="welcome-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 15.5 8.5 15.5s8.5-10.25 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
              <h2>Location & Hours</h2>
            </div>
            {pageData?.ActiveLocations && pageData.ActiveLocations.length > 0 ? (
              pageData.ActiveLocations.map((loc: any, index: number) => (
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

          <div className="welcome-section fade-in delay-2">
            <div className="welcome-section-header">
               <svg className="welcome-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <h2>About Us</h2>
            </div>
            <p>
              { pageData?.Tagline || "We are CS students trying to survive Professor Uma class..." }
            </p>
          </div>
        </main>
        </div>

      {/* Customer Feedback Carousel */}
      {feedback.length > 0 && (
        <div className="feedback-carousel-container fade-in delay-4">
          <h2 className="feedback-carousel-title">What Our Customers Say</h2>
          <div className="feedback-carousel">
            <button 
              className="carousel-btn carousel-btn-prev" 
              onClick={handlePrevFeedback}
              aria-label="Previous feedback"
            >
              ❮
            </button>

            <div className="feedback-card">
              {renderStars(feedback[currentFeedbackIndex].Rating)}
              <p className="feedback-comment">
                "{feedback[currentFeedbackIndex].Comments || 'Great experience!'}"
              </p>
              <p className="feedback-author">
                - {feedback[currentFeedbackIndex].Fname} {feedback[currentFeedbackIndex].Lname}
              </p>
              <p className="feedback-date">
                {new Date(feedback[currentFeedbackIndex].SubmittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <button 
              className="carousel-btn carousel-btn-next" 
              onClick={handleNextFeedback}
              aria-label="Next feedback"
            >
              ❯
            </button>
          </div>

          <div className="carousel-dots">
            {feedback.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentFeedbackIndex ? 'active' : ''}`}
                onClick={() => setCurrentFeedbackIndex(index)}
                aria-label={`Go to feedback ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <footer className="welcome-footer fade-in delay-3">
        © {new Date().getFullYear()} TEAM 4
      </footer>
    </div>
  );
}
