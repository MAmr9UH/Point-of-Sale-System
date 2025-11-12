import { useState } from 'react';
import './SalePanel.css';
import { useShoppingCart } from '../contexts/ShoppingCart';
import type { ItemCustomization } from '../contexts/ShoppingCart';
import { useToaster } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import type { MenuItem } from '../types/MenuItem';

interface CartItem extends MenuItem {
    quantity: number;
    customizations?: ItemCustomization[];
    cartItemId: string;
}

const OrderItem = ({ item }: { item: CartItem }) => {
    const { adjustQuantity } = useShoppingCart();
    const { addToast } = useToaster();

    return <div className="order-item order-item-animate">
        <div>
            <div className="order-item-name">{item.Name}</div>
            <div className="order-item-details">{item.Category}</div>
            {item.Description && <div className="order-item-details">{item.Description}</div>}
            
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
        </div>
        <div className="order-item-price">
            ${item.Price} 
            <span><span className="adjust" onClick={() => {
                adjustQuantity(item.cartItemId, -1);
                addToast(`Removed x1 ${item.Name} from cart`, 'info', 2000);
            }}>&lt;</span>x{item.quantity}<span className="adjust" onClick={() => {
                adjustQuantity(item.cartItemId, 1);
                addToast(`Added x1 ${item.Name} to cart`, 'info', 2000);
            }}>&gt;</span></span>

            
        </div>
    </div>
}

const SalePanel = () => {
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'phone' | 'processing'>('cart');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
    const { items, tax, grandTotal, clearCart } = useShoppingCart();
    const { addToast } = useToaster();
    const { user } = useAuth();

    const handleSendToPay = () => {
        if (Object.keys(items).length === 0) {
            addToast('Cart is empty!', 'error', 3000);
            return;
        }
        setCheckoutStep('payment');
    };

    const handleSkipPayment = () => {
        setPaymentMethod('cash');
        setCheckoutStep('phone');
    };

    const handleCardPayment = () => {
        // Simulate card payment processing
        setTimeout(() => {
            setPaymentMethod('card');
            setCheckoutStep('phone');
        }, 1500);
    };

    const handlePhoneSubmit = async () => {
        setCheckoutStep('processing');
        
        try {
            const orderItems = Object.values(items).map((item: any) => ({
                id: item.MenuItemID,
                quantity: item.quantity,
                price: parseFloat(item.adjustedPrice.toFixed(2)),
                customizations: item.customizations || []
            }));

            const response = await fetch('/api/checkout/staffCreateOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staffId: (user as any)?.StaffID,
                    phoneNumber: phoneNumber || null,
                    orderItems,
                    paymentMethod,
                    totalAmount: parseFloat(grandTotal.toFixed(2))
                })
            });

            const data = await response.json();

            if (data.success) {
                addToast('Order created successfully!', 'success', 3000);
                clearCart();
                setCheckoutStep('cart');
                setPhoneNumber('');
            } else {
                throw new Error(data.error || 'Failed to create order');
            }
        } catch (error: any) {
            addToast(error.message || 'Failed to create order', 'error', 4000);
            setCheckoutStep('phone');
        }
    };

    const handleCancel = () => {
        setCheckoutStep('cart');
        setPhoneNumber('');
    };

    // Payment waiting screen
    if (checkoutStep === 'payment') {
        return (
            <aside id="sale-panel" className="checkout-screen">
                <div className="checkout-content">
                    <div className="payment-waiting">
                        <div className="payment-icon">💳</div>
                        <h2>Waiting for card payment...</h2>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <button 
                            className="footer-button footer-button-primary"
                            onClick={handleCardPayment}
                        >
                            Payment Complete
                        </button>
                        <button 
                            className="footer-button footer-button-secondary"
                            onClick={handleSkipPayment}
                        >
                            Skip - Customer Pays by Cash
                        </button>
                        <button 
                            className="footer-button footer-button-tertiary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </aside>
        );
    }

    // Phone number input screen
    if (checkoutStep === 'phone') {
        return (
            <aside id="sale-panel" className="checkout-screen">
                <div className="checkout-content">
                    <div className="phone-input-screen">
                        <h2>Customer Phone Number</h2>
                        <p className="phone-subtitle">Optional - for order tracking and loyalty points</p>
                        <input
                            type="tel"
                            className="phone-input"
                            placeholder="(123) 456-7890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            maxLength={10}
                        />
                        <div className="payment-method-display">
                            Payment Method: <strong>{paymentMethod === 'card' ? '💳 Card' : '💵 Cash'}</strong>
                        </div>
                        <button 
                            className="footer-button footer-button-primary"
                            onClick={handlePhoneSubmit}
                        >
                            Complete Order
                        </button>
                        <button 
                            className="footer-button footer-button-secondary"
                            onClick={() => {
                                setPhoneNumber('');
                                handlePhoneSubmit();
                            }}
                        >
                            Skip Phone Number
                        </button>
                        <button 
                            className="footer-button footer-button-tertiary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </aside>
        );
    }

    // Processing screen
    if (checkoutStep === 'processing') {
        return (
            <aside id="sale-panel" className="checkout-screen">
                <div className="checkout-content">
                    <div className="processing-screen">
                        <div className="spinner-large"></div>
                        <h2>Creating Order...</h2>
                        <p>Please wait</p>
                    </div>
                </div>
            </aside>
        );
    }

    // Normal cart view
    return (
        <aside id="sale-panel">
            <h2 id="sale-title">New sale</h2>
            <div id="sale-content">
                {Object.values(items).map((item: any) => ( <OrderItem key={item.cartItemId || item.MenuItemID} item={item} /> ))}

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
                <button 
                    className="footer-button footer-button-primary"
                    onClick={handleSendToPay}
                >
                    Send to Pay
                </button>
            </div>
        </aside>
    );
};

export default SalePanel;