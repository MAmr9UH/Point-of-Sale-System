import { Link } from "react-router-dom";
import "./TopNav.css";

export function TopNav() {
  return (
    <header className="topnav">
      <div className="nav-left">
        <Link to="/menu" className="btn btn-ghost">Menu</Link>
      </div>
      <div className="nav-center">
        <Link to="/" className="brand">Food Truck POS</Link>
      </div>
      <div className="nav-right">
        <Link to="/login" className="btn btn-primary">Log in</Link>
        <Link to="/signup" className="btn btn-ghost">Sign up</Link>
      </div>
    </header>
  );
}
