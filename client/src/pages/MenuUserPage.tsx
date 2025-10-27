import { useState, useEffect, useRef } from 'react';
import MenuPanel from '../components/MenuPanel';
import './MenuUserPage.css';
import { useShoppingCart } from '../contexts/ShoppingCart';
import { useNavigate } from 'react-router-dom';

// Custom hook to detect clicks outside a component
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const ShoppingCartPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { items, removeItem, adjustQuantity, tax, grandTotal, clearCart, total } = useShoppingCart();
    const panelRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const navigate = useNavigate();

    useClickOutside(panelRef as React.RefObject<HTMLDivElement>, () => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Match animation duration
    });

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Match animation duration
    };

    if (!isOpen && !isAnimating) return null;

    const cartItems = Object.values(items);

    return (
        <div ref={panelRef} className={`shopping-cart-panel ${isAnimating ? 'open' : ''}`}>
            <div className="panel-arrow"></div>
            <div className="panel-header">
                <h2>Shopping Cart</h2>
                <button className="close-button" onClick={handleClose}>&times;</button>
            </div>
            
            <div className="panel-body">
                {cartItems.length === 0 ? (
                    <div className="empty-cart">Your cart is empty</div>
                ) : (
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item.cartItemId || item.MenuItemID} className="cart-item">
                                <div className="cart-item-info">
                                    <div className="cart-item-name">{item.Name}</div>
                                    <div className="cart-item-price">
                                        ${item.adjustedPrice ? item.adjustedPrice.toFixed(2) : parseFloat(item.Price).toFixed(2)}
                                        {item.adjustedPrice && item.adjustedPrice !== parseFloat(item.Price) && (
                                            <span style={{ 
                                                textDecoration: 'line-through', 
                                                marginLeft: '6px', 
                                                color: '#9ca3af',
                                                fontSize: '0.85em'
                                            }}>
                                                ${parseFloat(item.Price).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {item.customizations && item.customizations.length > 0 && (
                                    <div className="cart-item-customizations">
                                        {item.customizations.map((custom, idx) => (
                                            <div key={idx} className="customization-item">
                                                {custom.changeType === 'removed' && (
                                                    <span className="custom-removed">
                                                        ✕ No {custom.ingredientName}
                                                    </span>
                                                )}
                                                {custom.changeType === 'substituted' && (
                                                    <span className="custom-substituted">
                                                        → {custom.ingredientName}
                                                        {custom.priceAdjustment > 0 && ` (+$${custom.priceAdjustment.toFixed(2)})`}
                                                    </span>
                                                )}
                                                {custom.changeType === 'added' && custom.quantityDelta > 0 && (
                                                    <span className="custom-added">
                                                        + Extra {custom.ingredientName}
                                                        {custom.quantityDelta > 1 && ` (×${custom.quantityDelta})`}
                                                        {custom.priceAdjustment > 0 && ` (+$${(custom.priceAdjustment * custom.quantityDelta).toFixed(2)})`}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="cart-item-controls">
                                    <div className="qty-controls">
                                        <button 
                                            className="qty-btn"
                                            onClick={() => adjustQuantity(item.cartItemId || String(item.MenuItemID), -1)}
                                        >
                                            -
                                        </button>
                                        <span className="quantity">{item.quantity}</span>
                                        <button 
                                            className="qty-btn"
                                            onClick={() => adjustQuantity(item.cartItemId || String(item.MenuItemID), 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeItem(item.cartItemId || String(item.MenuItemID))}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="panel-footer">
                <div className="totals">
                    <div className="total-row">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="total-row grand-total">
                        <span>Grand Total</span>
                        <span>${Math.abs(grandTotal).toFixed(2)}</span>
                    </div>
                </div>
                <div className="footer-actions">
                    <button className="clear-btn" onClick={clearCart} disabled={cartItems.length === 0}>
                        Clear Cart
                    </button>
                    <button className="checkout-btn" disabled={cartItems.length === 0} onClick={() => {
                        navigate("/checkout");
                    }}>
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

const MenuUserPage = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { items } = useShoppingCart();
    const [isItemAdded, setIsItemAdded] = useState(false);
    const navigate = useNavigate();
    
    const itemCount = Object.values(items).reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        if (itemCount > 0) {
            setIsItemAdded(true);
            const timer = setTimeout(() => setIsItemAdded(false), 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [itemCount]);

    return (
        <div className="menu-user-page">
            <header className="user-header">
                <h1 className="user-title">Our Menu</h1>
                <div className="cart-container">
                    <button className="home-button" onClick={() => navigate('/')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        <span className="home-label">Home</span>
                    </button>
                    <button className={`cart-button ${isItemAdded ? 'item-added' : ''}`} onClick={() => setIsCartOpen(prev => !prev)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <span className="cart-label">Cart</span>
                        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                    </button>
                    <ShoppingCartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                </div>
            </header>
            
            <div className="user-content">
                <MenuPanel />
            </div>
        </div>
    );
};

export default MenuUserPage;
