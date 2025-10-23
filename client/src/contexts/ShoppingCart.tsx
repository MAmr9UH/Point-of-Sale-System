import { createContext, useContext }  from 'react';
import { useState } from 'react';
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
    const [items, setItems] = useState<any>({});
    const addItem = (item: any) => { 
        setItems((prev : any) => {
            console.log('addItem called with:', item);
            if (item.id in prev) {
                let temp = { ...prev };

                temp[item.id].quantity += 1;
                return temp;
            } else {
                return { ...prev, [item.id]: { ...item, quantity: 1 } };
            }
        });
        if (!item.price) return;
        setTotal(total + item.price);
        setTax((total + item.price) * 0.1); // Example: 10% tax
        setGrandTotal(total + item.price + (total + item.price) * 0.1); 
     };
    const removeItem = (itemId: string) => { 
        setItems((prev: any) => {
            if (!(itemId in prev)) return prev;
            const newItems = { ...prev };
            delete newItems[itemId];
            return newItems;
        });
        const item = items[itemId];
        if (!item || !item.price) {
            return;
        }
        setTotal(total - item.price);
        setTax((total - (item ? item.price : 0)) * 0.1); // Example: 10% tax
        setGrandTotal(total - (item ? item.price : 0) + (total - (item ? item.price : 0)) * 0.1);
     }
    const clearCart = () => {
        setItems([]);
        setTotal(0);
        setTax(0);
        setGrandTotal(0);
    };
    const adjustQuantity = (itemId: string, delta: number) => {
        setItems((prev: any) => {
            if (!(itemId in prev)) return prev;
            const newItems = { ...prev };
            const item = newItems[itemId];
            if (!item || !item["price"]) {
                return newItems;
            }
            newItems[itemId].quantity += delta;
            if (newItems[itemId].quantity <= 0) {
                delete newItems[itemId];
            }
            console.log(total, grandTotal, tax, delta, item.price, item);
            setTax((total + delta * item["price"]) * 0.1); // Example: 10% tax
            setGrandTotal((total + delta * item["price"]) * 1.1);
            setTotal(total + delta * item["price"]);
            
            
            return newItems;

        });
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
