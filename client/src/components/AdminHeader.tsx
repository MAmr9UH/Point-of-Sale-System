import React from "react";
import "./AdminHeader.css";

type AdminHeaderProps = {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ title = "Admin", subtitle, rightSlot }) => {
  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <div className="admin-header__title">{title}</div>
        {subtitle && <div className="admin-header__subtitle">{subtitle}</div>}
      </div>
      <div className="admin-header__right">{rightSlot}</div>
    </header>
  );
};

export default AdminHeader;
