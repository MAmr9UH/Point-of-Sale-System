import { createContext, useContext }  from 'react';
import { useState } from 'react';
import type { MenuItem } from '../types/MenuItem';

export interface ItemCustomization {
    ingredientId: number;
    ingredientName: string;
    changeType: 'added' | 'removed' | 'substituted';
    quantityDelta: number;
    priceAdjustment: number; // Price adjustment for this ingredient
}

interface CartItem extends MenuItem {
    quantity: number;
    customizations?: ItemCustomization[];
    cartItemId: string; // Unique ID for cart item (to handle same item with different customizations)
    adjustedPrice: number; // Base price + customization adjustments
}

interface ShoppingCartContextType {
    items: Record<string, CartItem>;
    addItem: (item: MenuItem, customizations?: ItemCustomization[]) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    adjustQuantity: (itemId: string, delta: number) => void;
    total: number;
    tax: number;
    grandTotal: number;
}
const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const ShoppingCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<Record<string, CartItem>>({});
    
    const calculateAdjustedPrice = (item: MenuItem, customizations?: ItemCustomization[]): number => {
        let basePrice = parseFloat(item.Price);
        
        if (!customizations || customizations.length === 0) {
            return basePrice;
        }
        
        // Add price adjustments from customizations
        const adjustmentTotal = customizations.reduce((total, custom) => {
            // Only add price adjustments for substitutions and additions
            if (custom.changeType === 'substituted' || custom.changeType === 'added') {
                return total + (custom.priceAdjustment * Math.abs(custom.quantityDelta));
            }
            return total;
        }, 0);
        
        return basePrice + adjustmentTotal;
    };
    
    const generateCartItemId = (item: MenuItem, customizations?: ItemCustomization[]): string => {
        // Create a unique ID based on item ID and customizations
        if (!customizations || customizations.length === 0) {
            return String(item.MenuItemID);
        }

        console.log('Generating cart item ID for item:', item, 'with customizations:', customizations);

        const customizationString = customizations
            .map(c => `${c.ingredientId}:${c.changeType}:${c.quantityDelta}`)
            .sort()
            .join('|');
        return `${item.MenuItemID}-${btoa(customizationString).substring(0, 10)}`;
    };
    
    const addItem = (item: MenuItem, customizations?: ItemCustomization[]) => { 
        const adjustedPrice = calculateAdjustedPrice(item, customizations);
        
        setItems((prev) => {
            console.log('addItem called with:', item, 'customizations:', customizations);
            const cartItemId = generateCartItemId(item, customizations);
            
            if (cartItemId in prev) {
                const temp = { ...prev };
                temp[cartItemId] = {
                    ...temp[cartItemId],
                    quantity: temp[cartItemId].quantity + 1
                };
                return temp;
            } else {
                return { 
                    ...prev, 
                    [cartItemId]: { 
                        ...item, 
                        quantity: 1,
                        customizations: customizations,
                        cartItemId: cartItemId,
                        adjustedPrice: adjustedPrice
                    } 
                };
            }
        });
        
        if (!adjustedPrice) return;
        setTotal(total + adjustedPrice);
        setTax((total + adjustedPrice) * 0.1); // Example: 10% tax
        setGrandTotal(total + adjustedPrice + (total + adjustedPrice) * 0.1); 
     };
    const removeItem = (itemId: string) => { 
        const item = items[itemId];
        if (!item || !item.adjustedPrice) {
            return;
        }
        setItems((prev) => {
            if (!(itemId in prev)) return prev;
            const newItems = { ...prev };
            delete newItems[itemId];
            return newItems;
        });
        const itemTotal = item.adjustedPrice * item.quantity;
        setTotal(total - itemTotal);
        setTax((total - itemTotal) * 0.1); // Example: 10% tax
        setGrandTotal(total - itemTotal + (total - itemTotal) * 0.1);
     }
    const clearCart = () => {
        setItems({});
        setTotal(0);
        setTax(0);
        setGrandTotal(0);
    };
    const adjustQuantity = (itemId: string, delta: number) => {
        const item = items[itemId];
        if (!item || !item.adjustedPrice) {
            return;
        }
        setItems((prev) => {
            if (!(itemId in prev)) return prev;
            const newItems = { ...prev };
            newItems[itemId] = {
                ...newItems[itemId],
                quantity: newItems[itemId].quantity + delta
            };
            if (newItems[itemId].quantity <= 0) {
                delete newItems[itemId];
            }
            return newItems;
        });
        const priceChange = delta * item.adjustedPrice;
        const newTotal = total + priceChange;
        setTotal(newTotal);
        setTax(newTotal * 0.1); // Example: 10% tax
        setGrandTotal(newTotal * 1.1);
    };

    const [total, setTotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);

    return (
        <ShoppingCartContext.Provider value={{ items, addItem, removeItem, clearCart, adjustQuantity, total, tax, grandTotal }}>
            {children}
        </ShoppingCartContext.Provider>
    );
};

export const useShoppingCart = (): ShoppingCartContextType => {
    const context = useContext(ShoppingCartContext);
    if (!context) {
        throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
    }
    return context;
};