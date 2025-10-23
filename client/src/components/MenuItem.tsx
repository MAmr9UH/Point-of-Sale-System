import "./MenuItem.css"
import { useShoppingCart } from "../contexts/ShoppingCart";
import { useToaster } from "../contexts/ToastContext";

const MenuItem = ({ item } : any) => {
    const { addItem } = useShoppingCart();
    const { addToast } = useToaster();
    if (item.image) {
        return (
            <div className="menu-item" onClick={() => {
            addItem(item);
            addToast(`Added ${item.name} to cart`, 'info', 2000);
        }}>
                <img src={item.image} alt={item.name} className="menu-item-image" />
                <span className="menu-item-name">{item.name}</span>
            </div>
        );
    }
    
    // Note: Background color is dynamic from data, so it remains an inline style.
    // All other styling is handled by the 'menu-item-color' class.
    const itemStyle = {
        backgroundColor: item.color,
        color: item.color === '#f5f5f5' ? '#333' : '#fff',
    };


    return (
        <div className="menu-item menu-item-color" style={itemStyle} onClick={() => {
            addItem(item);
            addToast(`Added ${item.name} to cart`, 'info', 2000);
        }}>
            {item.icon === '%' && <div className="menu-item-percent-icon">%</div>}
            <span className="menu-item-name">{item.name}</span>
            {item.count && <span className="menu-item-count">{item.count} items</span>}
        </div>
    );
};

export default MenuItem;