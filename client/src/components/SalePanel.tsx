import { useState } from 'react';
import './SalePanel.css';
import { useShoppingCart } from '../contexts/ShoppingCart';
import { useToaster } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import type { MenuItem } from '../types/MenuItem';

interface CartItem extends MenuItem {
    quantity: number;
}

const OrderItem = ({ item }: { item: CartItem }) => {
    const { adjustQuantity } = useShoppingCart();
    const { addToast } = useToaster();

    return <div className="order-item order-item-animate">
        <div>
            <div className="order-item-name">{item.Name}</div>
            <div className="order-item-details">{item.Category}</div>
            {item.Description && <div className="order-item-details">{item.Description}</div>}
        </div>
        <div className="order-item-price">
            ${item.Price} 
            <span><span className="adjust" onClick={() => {
                adjustQuantity(String(item.MenuItemID), -1);
                addToast(`Removed x1 ${item.Name} from cart`, 'info', 2000);
            }}>&lt;</span>x{item.quantity}<span className="adjust" onClick={() => {
                adjustQuantity(String(item.MenuItemID), 1);
                addToast(`Added x1 ${item.Name} to cart`, 'info', 2000);
            }}>&gt;</span></span>

            
        </div>
    </div>
}

const SalePanel = () => {
    const [activeTab, setActiveTab] = useState('Check');
    const { items, tax, grandTotal } = useShoppingCart();
    const navigate = useNavigate();
    return (
        <aside id="sale-panel">
            <h2 id="sale-title">New sale</h2>
            <div id="sale-tabs">
                <button
                    className={`tab ${activeTab === 'Check' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Check')}
                >
                    Check
                </button>
                <button
                    className={`tab ${activeTab === 'Actions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Actions')}
                >
                    Actions
                </button>
            </div>
            <div id="sale-content">
                {Object.values(items).map((item: any) => ( <OrderItem key={item.MenuItemID} item={item} /> ))}

            </div>
            <div id="totals-section">
                <div className="total-row">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
            </div>
            <div className="total-row grand-total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
            </div>
            <div id="sale-footer">
                <button className="footer-button footer-button-secondary">Print</button>
                <button className="footer-button footer-button-secondary">Pay</button>
            <button
            className="footer-button footer-button-primary"
            onClick={() => navigate('/checkout')}
            >
            Send
            </button>
            </div>
        </aside>
    );
};

export default SalePanel;