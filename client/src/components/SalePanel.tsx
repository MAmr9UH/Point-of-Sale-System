import { useState } from 'react';
import './SalePanel.css';
import { useShoppingCart } from '../contexts/ShoppingCart';
import { useToaster } from '../contexts/ToastContext';
const OrderItem = ({ item }: any) => {
    const { adjustQuantity } = useShoppingCart();
    const { addToast } = useToaster();

    return <div className="order-item order-item-animate">
        <div>
            <div className="order-item-name">{item.name}</div>
            <div className="order-item-details">Large Fries</div>
            <div className="order-item-details">Add Honey Mustard</div>
        </div>
        <div className="order-item-price">
            {item.price} 
            <span><span className="adjust" onClick={() => {
                adjustQuantity(item.id, -1);
                addToast(`Removed x1 ${item.name} from cart`, 'info', 2000);
            }}>&lt;</span>x{item.quantity}<span className="adjust" onClick={() => {
                adjustQuantity(item.id, 1);
                addToast(`Added x1 ${item.name} to cart`, 'info', 2000);
            }}>&gt;</span></span>

            
        </div>
    </div>
}

const SalePanel = () => {
    const [activeTab, setActiveTab] = useState('Check');
    const { items, total, tax, grandTotal } = useShoppingCart();
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
                {Object.values(items).map((item: any) => ( <OrderItem key={item.id} item={item} /> ))}

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
                <button className="footer-button footer-button-primary">Send</button>
            </div>
        </aside>
    );
};

export default SalePanel;