import "./WelcomePageDD.css";
import {TopNav} from "../components/TopNav";
import { useWelcomePage } from "../contexts/WelcomePageContext";

export default function WelcomePageDD() {

  const { pageData, isLoading, error } = useWelcomePage();

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

  return (
    <div className="welcome-container" style={{ backgroundImage: `url(${pageData?.BackgroundURL})` }}>
       <TopNav />
      <div className="welcome-card slide-in">
        <header className="welcome-header fade-in">
          <h1 className="welcome-title">{pageData?.FoodTruckName || "Default Name"}</h1>
        </header>

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
      <footer className="welcome-footer fade-in delay-3">
        © {new Date().getFullYear()} TEAM 4
      </footer>
    </div>
  );
}
