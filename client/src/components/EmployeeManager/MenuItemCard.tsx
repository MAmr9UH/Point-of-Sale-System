import React from 'react';
import type { MenuItem } from '../../types/MenuItem';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick }) => {
  return (
    <div
      className="menu-item-card"
      onClick={onClick}
    >
      <div className="menu-item-image">
        {item.ImageURL ? (
          <img src={item.ImageURL} alt={item.Name} />
        ) : (
          <div className="menu-item-placeholder">📷</div>
        )}
      </div>
      <div className="menu-item-details">
        <p className="menu-item-description">{item.Name}</p>
        <div className="menu-item-footer">
          <span className="menu-item-price">${parseFloat(item.Price).toFixed(2)}</span>
          <span className={`menu-item-badge ${item.Availability === 1 ? 'available' : 'unavailable'}`}>
            {item.Availability === 1 ? '✓ Available' : '✗ Unavailable'}
          </span>
        </div>
        <span className="menu-item-category">{item.Category}</span>
      </div>
    </div>
  );
};
