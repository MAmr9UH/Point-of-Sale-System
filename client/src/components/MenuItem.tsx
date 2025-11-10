import "./MenuItem.css"
import type { MenuItem as MenuItemType } from "../types/MenuItem";

interface MenuItemProps {
    item: MenuItemType;
    onOpenCustomization: (item: MenuItemType) => void;
}

const MenuItem = ({ item, onOpenCustomization }: MenuItemProps) => {
    
    // Note: Background color is dynamic from data, so it remains an inline style.
    // All other styling is handled by the 'menu-item-color' class.
    const itemStyle = {
        backgroundColor: '#f5f5f5',
        color: '#333',
    };


    return (
        
        <div className="menu-item menu-item-color" style={itemStyle} onClick={() => onOpenCustomization(item)}>
            <img src={item.ImageURL ? item.ImageURL : "https://placehold.co/1920x1080/bca28e/ffffff?text=" + encodeURI(item.Name)} alt={item.Name} className="menu-item-image" />
            <span className="menu-item-name">{item.Name}</span>
            <span className="menu-item-price">${item.Price}</span>
        </div>
    );
};

export default MenuItem;