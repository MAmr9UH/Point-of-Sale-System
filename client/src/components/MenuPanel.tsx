import { useEffect, useState } from 'react';
import MenuItem from './MenuItem';
import CustomizationModal from './CustomizationModal';
import type { IngredientCustomization } from './CustomizationModal';
import './MenuPanel.css';
import * as fetchMenuUtils from '../utils/fetchMenu';
import type { MenuItem as MenuItemType, MenuItemCategory } from '../types/MenuItem';
import { useShoppingCart } from '../contexts/ShoppingCart';
import type { ItemCustomization } from '../contexts/ShoppingCart';
import { useToaster } from '../contexts/ToastContext';

const MenuPanel = () => {
    
    const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
    const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
    const { addItem } = useShoppingCart();
    const { addToast } = useToaster();

    useEffect(() => {
        fetchMenuUtils.fetchMenuEm().then(items => {
            setMenuItems(items);
        });
    }, []);

    const handleOpenCustomization = (item: MenuItemType) => {
        setSelectedItem(item);
        setIsCustomizationOpen(true);
    };

    const handleCloseCustomization = () => {
        setIsCustomizationOpen(false);
        setSelectedItem(null);
    };

    const handleAddToCart = (item: MenuItemType, customizations: IngredientCustomization[]) => {
        // Convert IngredientCustomization to ItemCustomization with ingredient names
        const itemCustomizations: ItemCustomization[] = customizations.map(custom => {
            const ingredient = item.Ingredients.find(ing => ing.IngredientID === custom.ingredientId);
            return {
                ingredientId: custom.ingredientId,
                ingredientName: ingredient?.Name || 'Unknown',
                changeType: custom.changeType,
                quantityDelta: custom.quantityDelta,
                priceAdjustment: parseFloat(ingredient?.PriceAdjustment || '0')
            };
        });
        
        // Add item to cart with customizations
        addItem(item, itemCustomizations.length > 0 ? itemCustomizations : undefined);
        
        // Log customizations for debugging
        if (itemCustomizations.length > 0) {
            console.log('Item customizations:', itemCustomizations);
        }
        
        addToast(`Added ${item.Name} to cart`, 'success', 2000);
    };


    // Group items by category
    const groupedItems = menuItems.reduce((acc, item) => {
        const category = item.Category || 'other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<MenuItemCategory | 'other', MenuItemType[]>);

    // Get sorted categories
    const categoryOrder: (MenuItemCategory | 'other')[] = ['appetizer', 'entree', 'dessert', 'beverage', 'other'];
    const categories = categoryOrder.filter(cat => groupedItems[cat] && groupedItems[cat].length > 0);

    return (
        <>
            <div id="menu-panel">
                {categories.map(category => (
                    <div key={category} className="menu-category">
                        <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                        <div className="menu-grid">
                            {groupedItems[category].map(item => (
                                <MenuItem 
                                    key={item.MenuItemID} 
                                    item={item} 
                                    onOpenCustomization={handleOpenCustomization}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <CustomizationModal
                item={selectedItem}
                isOpen={isCustomizationOpen}
                onClose={handleCloseCustomization}
                onAddToCart={handleAddToCart}
            />
        </>
    );
};

export default MenuPanel;