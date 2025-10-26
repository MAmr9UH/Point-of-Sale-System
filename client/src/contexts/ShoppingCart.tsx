import { createContext, useContext, useState, useEffect } from 'react';

interface ShoppingCartContextType {
    items: any[];
    addItem: (item: any) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    adjustQuantity: (itemId: string, delta: number) => void;
    total: number;
    tax: number;
    grandTotal: number;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const ShoppingCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Load from sessionStorage on mount
    const [items, setItems] = useState<any>(() => {
        const saved = sessionStorage.getItem('cart-items');
        return saved ? JSON.parse(saved) : {};
    });

    // Save to sessionStorage whenever items change
    useEffect(() => {
        sessionStorage.setItem('cart-items', JSON.stringify(items));
    }, [items]);

    // Calculate totals from items (derived state - no separate useState needed)
    const total = Object.values(items).reduce((sum: number, item: any) => {
        const price = parseFloat(item.Price || item.price || 0);
        return sum + (price * item.quantity);
    }, 0);
    
    const tax = total * 0.0825; // 8.25% tax
    const grandTotal = total + tax;

    const addItem = (item: any) => { 
        setItems((prev : any) => {
            console.log('addItem called with:', item);
            const itemId = String(item.MenuItemID || item.id);
            if (itemId in prev) {
                return {
                    ...prev,
                    [itemId]: { ...prev[itemId], quantity: prev[itemId].quantity + 1 }
                };
            } else {
                return { ...prev, [itemId]: { ...item, quantity: 1 } };
            }
        });
    };

    const removeItem = (itemId: string) => { 
        setItems((prev: any) => {
            if (!(itemId in prev)) return prev;
            const { [itemId]: removed, ...rest } = prev;
            return rest;
        });
    };

    const clearCart = () => {
        setItems({});
        sessionStorage.removeItem('cart-items');
    };

    const adjustQuantity = (itemId: string, delta: number) => {
        setItems((prev: any) => {
            if (!(itemId in prev)) return prev;
            
            const newQuantity = prev[itemId].quantity + delta;
            
            // Remove item if quantity becomes 0 or less
            if (newQuantity <= 0) {
                const { [itemId]: removed, ...rest } = prev;
                return rest;
            }
            
            // Update quantity
            return {
                ...prev,
                [itemId]: { ...prev[itemId], quantity: newQuantity }
            };
        });
    };

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