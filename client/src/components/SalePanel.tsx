import { useState } from 'react';
import './SalePanel.css';
import { useShoppingCart } from '../contexts/ShoppingCart';
import type { ItemCustomization } from '../contexts/ShoppingCart';
import { useToaster } from '../contexts/ToastContext';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
=======
>>>>>>> origin/main
import type { MenuItem } from '../types/MenuItem';

interface CartItem extends MenuItem {
    quantity: number;
<<<<<<< HEAD
=======
    customizations?: ItemCustomization[];
    cartItemId: string;
>>>>>>> origin/main
}

const OrderItem = ({ item }: { item: CartItem }) => {
    const { adjustQuantity } = useShoppingCart();
    const { addToast } = useToaster();

    return <div className="order-item order-item-animate">
        <div>
            <div className="order-item-name">{item.Name}</div>
            <div className="order-item-details">{item.Category}</div>
            {item.Description && <div className="order-item-details">{item.Description}</div>}
<<<<<<< HEAD
=======
            
            {item.customizations && item.customizations.length > 0 && (
                <div className="order-item-customizations">
                    {item.customizations.map((custom, idx) => (
                        <div key={idx} className="order-customization">
                            {custom.changeType === 'removed' && (
                                <span className="custom-removed">✕ No {custom.ingredientName}</span>
                            )}
                            {custom.changeType === 'substituted' && (
                                <span className="custom-substituted">→ {custom.ingredientName}</span>
                            )}
                            {custom.changeType === 'added' && custom.quantityDelta > 0 && (
                                <span className="custom-added">
                                    + Extra {custom.ingredientName}{custom.quantityDelta > 1 ? ` (x${custom.quantityDelta})` : ''}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
>>>>>>> origin/main
        </div>
        <div className="order-item-price">
            ${item.Price} 
            <span><span className="adjust" onClick={() => {
<<<<<<< HEAD
                adjustQuantity(String(item.MenuItemID), -1);
                addToast(`Removed x1 ${item.Name} from cart`, 'info', 2000);
            }}>&lt;</span>x{item.quantity}<span className="adjust" onClick={() => {
                adjustQuantity(String(item.MenuItemID), 1);
=======
                adjustQuantity(item.cartItemId, -1);
                addToast(`Removed x1 ${item.Name} from cart`, 'info', 2000);
            }}>&lt;</span>x{item.quantity}<span className="adjust" onClick={() => {
                adjustQuantity(item.cartItemId, 1);
>>>>>>> origin/main
                addToast(`Added x1 ${item.Name} to cart`, 'info', 2000);
            }}>&gt;</span></span>

            
        </div>
    </div>
}

const SalePanel = () => {
    const [activeTab, setActiveTab] = useState('Check');
    const { items, tax, grandTotal } = useShoppingCart();
<<<<<<< HEAD
    const navigate = useNavigate();
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
                {Object.values(items).map((item: any) => ( <OrderItem key={item.MenuItemID} item={item} /> ))}
=======
                {Object.values(items).map((item: any) => ( <OrderItem key={item.cartItemId || item.MenuItemID} item={item} /> ))}
>>>>>>> origin/main

            </div>
            <div id="totals-section">
                <div className="total-row">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
            </div>
            <div className="total-row grand-total">
                <span>Total</span>
                <span>${Math.abs(grandTotal).toFixed(2)}</span>
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