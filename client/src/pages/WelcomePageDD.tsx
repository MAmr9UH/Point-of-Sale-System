import "./WelcomePageDD.css";
import {TopNav} from "../components/TopNav";
import React, { useEffect, useState } from "react";

import { fetchWelcomePage } from "../utils/fetchWelcomePage";

export default function WelcomePageDD() {
  const [welcomeData, setWelcomeData] = useState<any>(null);
  useEffect(() => {

    fetchWelcomePage().then((data) => {
      setWelcomeData(data);
    });
    
  }, []);

  return (
    <div className="welcome-container">
       <TopNav />  {/* ⬅️ new navbar */}
      <div className="welcome-card">
        <h1 className="welcome-title">Food Truck POS {welcomeData?.name}</h1>
        <p className="welcome-subtitle">🚚 Fresh • Fast • Friendly</p>

        <div className="welcome-section">
          <h2>📍 Location</h2>
          <p>Houston, Texas</p>
          <p>Tue–Sun • 11:00 AM – 8:00 PM</p>
        </div>

        <div className="welcome-section">
          <h2>🍔 About Us</h2>
          <p>
            We are a CS students trying to survive Professor Uma class...
          </p>
        </div>
        </div>
      <footer className="welcome-footer">
        © {new Date().getFullYear()} TEAM 4•
      </footer>
    </div>
  );
}
