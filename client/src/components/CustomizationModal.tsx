import { useState, useEffect } from 'react';
import './CustomizationModal.css';
import type { MenuItem, Ingredient } from '../types/MenuItem';
import { useToaster } from '../contexts/ToastContext';

interface CustomizationModalProps {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (item: MenuItem, customizations: IngredientCustomization[]) => void;
}

export interface IngredientCustomization {
    ingredientId: number;
    changeType: 'added' | 'removed' | 'substituted';
    quantityDelta: number;
}

const CustomizationModal = ({ item, isOpen, onClose, onAddToCart }: CustomizationModalProps) => {
    const { addToast } = useToaster();
    const [customizations, setCustomizations] = useState<Map<number, IngredientCustomization>>(new Map());
    const [selectedSubstitutions, setSelectedSubstitutions] = useState<Map<string, number>>(new Map());
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            // Reset states
            setIsClosing(false);
            setCustomizations(new Map());
            
            // Trigger opening animation
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
            
            // Set default selections for substitutable categories
            const defaultSubstitutions = new Map<string, number>();
            const categorizedIngredients = groupByCategory(item.Ingredients);
            
            Object.entries(categorizedIngredients).forEach(([category, ingredients]) => {
                const requiredSubstitutable = ingredients.find(ing => ing.IsRequired === 1 && ing.CanSubstitute === 1);
                if (requiredSubstitutable) {
                    defaultSubstitutions.set(category, requiredSubstitutable.IngredientID);
                }
            });
            
            setSelectedSubstitutions(defaultSubstitutions);
        } else {
            setIsVisible(false);
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    const groupByCategory = (ingredients: Ingredient[]) => {
        return ingredients.reduce((acc, ingredient) => {
            // Skip ingredients that are required, cannot be substituted, AND cannot be added
            // (they'll always be included at the default quantity with no customization options)
            if (ingredient.IsRequired === 1 && ingredient.CanSubstitute === 0 && ingredient.MaximumQuantity <= ingredient.QuantityRequired) {
                return acc;
            }
            
            const category = ingredient.CustomizableCategory || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(ingredient);
            return acc;
        }, {} as Record<string, Ingredient[]>);
    };

    // Check if ingredient has sufficient stock
    const hasInsufficientStock = (ingredient: Ingredient, requiredQuantity: number = ingredient.QuantityRequired): boolean => {
        return ingredient.QuantityInStock < requiredQuantity;
    };

    // Check if menu item should be disabled due to insufficient stock
    const isMenuItemAvailable = (): boolean => {
        // Check all required non-substitutable ingredients
        const requiredIngredients = item.Ingredients.filter(
            ing => ing.IsRequired === 1 && ing.CanSubstitute === 0
        );
        
        // If any required ingredient doesn't have enough stock, disable the item
        return !requiredIngredients.some(ing => hasInsufficientStock(ing));
    };

    const itemAvailable = isMenuItemAvailable();

    // Calculate total price adjustment based on customizations
    const calculatePriceAdjustment = (): number => {
        let total = 0;
        customizations.forEach((customization, ingredientId) => {
            const ingredient = item?.Ingredients.find(ing => ing.IngredientID === ingredientId);
            if (ingredient) {
                const pricePerUnit = parseFloat(ingredient.PriceAdjustment) || 0;
                if (customization.changeType === 'removed') {
                    // Removing ingredients doesn't add cost
                    total += 0;
                } else if (customization.changeType === 'substituted') {
                    // Substitution: charge for the new ingredient
                    total += pricePerUnit * Math.abs(customization.quantityDelta);
                } else if (customization.changeType === 'added') {
                    // Adding more: charge for the extra quantity
                    total += pricePerUnit * customization.quantityDelta;
                }
            }
        });
        return total;
    };

    const handleToggleIngredient = (ingredient: Ingredient) => {
        // Prevent removing required ingredients when max > default (they can only add more)
        if (ingredient.IsRequired === 1 && ingredient.MaximumQuantity > ingredient.QuantityRequired) {
            addToast('This ingredient is required and cannot be removed. You can only add more.', 'error', 3000);
            return;
        }
        
        const newCustomizations = new Map(customizations);
        
        if (customizations.has(ingredient.IngredientID)) {
            newCustomizations.delete(ingredient.IngredientID);
        } else {
            newCustomizations.set(ingredient.IngredientID, {
                ingredientId: ingredient.IngredientID,
                changeType: 'removed',
                quantityDelta: -ingredient.QuantityRequired,
            });
        }
        
        setCustomizations(newCustomizations);
    };

    const handleSubstitution = (category: string, newIngredientId: number, ingredients: Ingredient[]) => {
        const oldIngredientId = selectedSubstitutions.get(category);
        const newSubstitutions = new Map(selectedSubstitutions);
        newSubstitutions.set(category, newIngredientId);
        setSelectedSubstitutions(newSubstitutions);

        // Update customizations
        const newCustomizations = new Map(customizations);
        
        // If there was a previous selection and it's different, mark it for removal
        if (oldIngredientId && oldIngredientId !== newIngredientId) {
            const oldIngredient = ingredients.find(ing => ing.IngredientID === oldIngredientId);
            if (oldIngredient) {
                newCustomizations.set(oldIngredientId, {
                    ingredientId: oldIngredientId,
                    changeType: 'removed',
                    quantityDelta: -oldIngredient.QuantityRequired,
                });
            }
        }
        
        // Check if the new selection is the default (required) ingredient
        const newIngredient = ingredients.find(ing => ing.IngredientID === newIngredientId);
        const defaultIngredient = ingredients.find(ing => ing.IsRequired === 1 && ing.CanSubstitute === 1);
        
        if (newIngredient && defaultIngredient && newIngredientId !== defaultIngredient.IngredientID) {
            // This is a substitution
            newCustomizations.set(newIngredientId, {
                ingredientId: newIngredientId,
                changeType: 'substituted',
                quantityDelta: newIngredient.QuantityRequired,
            });
        } else {
            // This is the default, remove any customization
            newCustomizations.delete(newIngredientId);
        }
        
        setCustomizations(newCustomizations);
    };

    const handleQuantityChange = (ingredient: Ingredient, delta: number) => {
        const newCustomizations = new Map(customizations);
        const current = customizations.get(ingredient.IngredientID);
        
        const currentQuantity = current ? ingredient.QuantityRequired + current.quantityDelta : ingredient.QuantityRequired;
        const newQuantity = currentQuantity + delta;
        
        // Validate against max quantity
        if (newQuantity > ingredient.MaximumQuantity || newQuantity < ingredient.QuantityRequired) {
            return;
        }
        
        const totalDelta = newQuantity - ingredient.QuantityRequired;
        
        if (totalDelta === 0) {
            newCustomizations.delete(ingredient.IngredientID);
        } else {
            newCustomizations.set(ingredient.IngredientID, {
                ingredientId: ingredient.IngredientID,
                changeType: 'added',
                quantityDelta: totalDelta,
            });
        }
        
        setCustomizations(newCustomizations);
    };

    const validateRequiredIngredients = (): { isValid: boolean; message: string } => {
        // Check each category to ensure required ingredients are selected
        const categorizedIngredients = groupByCategory(item.Ingredients);
        
        for (const [category, ingredients] of Object.entries(categorizedIngredients)) {
            // Check if this category has required substitutable ingredients
            const requiredSubstitutableIngredients = ingredients.filter(ing => ing.IsRequired === 1 && ing.CanSubstitute === 1);
            
            if (requiredSubstitutableIngredients.length > 0) {
                // Make sure one is selected (not removed)
                const selectedIngredient = selectedSubstitutions.get(category);
                
                if (!selectedIngredient) {
                    return {
                        isValid: false,
                        message: `Please select an option for "${category}"`
                    };
                }
                
                // Check if the selected ingredient was removed
                const customization = customizations.get(selectedIngredient);
                if (customization && customization.changeType === 'removed') {
                    return {
                        isValid: false,
                        message: `Please select an option for "${category}"`
                    };
                }
            }
            
            // Check for non-substitutable required ingredients that might have been removed
            const requiredNonSubstitutable = ingredients.filter(ing => ing.IsRequired === 1 && ing.CanSubstitute === 0);
            for (const ingredient of requiredNonSubstitutable) {
                const customization = customizations.get(ingredient.IngredientID);
                if (customization && customization.changeType === 'removed') {
                    return {
                        isValid: false,
                        message: `"${ingredient.Name}" is required and cannot be removed`
                    };
                }
            }
        }
        
        return { isValid: true, message: '' };
    };

    const handleAddToCart = () => {
        // Validate required ingredients
        const validation = validateRequiredIngredients();
        if (!validation.isValid) {
            // Show error message with toast
            addToast(validation.message, 'error', 4000);
            return;
        }
        
        onAddToCart(item, Array.from(customizations.values()));
        addToast(`${item?.Name} added to cart!`, 'success', 2000);
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300); // Match animation duration
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const categorizedIngredients = groupByCategory(item.Ingredients);
    const hasCustomizations = Object.keys(categorizedIngredients).length > 0;

    return (
        <div 
            className="customization-modal-overlay" 
            onClick={handleClose}
            style={{
                opacity: isVisible && !isClosing ? 1 : 0,
                transition: 'opacity 0.3s ease-out'
            }}
        >
            <div 
                className="customization-modal" 
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: isVisible && !isClosing ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                    opacity: isVisible && !isClosing ? 1 : 0,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
            >
                <div className="customization-header">
                    <h2>{item.Name}</h2>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>
                
                <div className="customization-body">
                    <div className="item-preview">
                        <img 
                            src={item.ImageURL || `https://placehold.co/400x300/bca28e/ffffff?text=${encodeURI(item.Name)}`} 
                            alt={item.Name}
                        />
                        <p className="item-description">{item.Description}</p>
                        <p className="item-price">${item.Price}</p>
                    </div>

                    {!hasCustomizations ? (
                        <div className="no-customizations">
                            <p>No customizations available for this item.</p>
                        </div>
                    ) : !itemAvailable ? (
                        <div className="unavailable-message">
                            <div className="unavailable-icon">⚠️</div>
                            <h3>Item Currently Unavailable</h3>
                            <p>This item cannot be ordered because required ingredients are out of stock.</p>
                        </div>
                    ) : (
                        <div className="customization-options">
                            <h3>Customize Your Order</h3>
                            
                            {Object.entries(categorizedIngredients).map(([category, ingredients]) => {
                                const hasSubstitutable = ingredients.some(ing => ing.CanSubstitute === 1);
                                // Show non-substitutable section if there are removable OR addable items (including required addable)
                                const hasNonSubstitutableOptions = ingredients.some(ing => 
                                    ing.CanSubstitute === 0 && 
                                    (ing.IsRequired === 0 || ing.MaximumQuantity > ing.QuantityRequired)
                                );
                                
                                return (
                                    <div key={category} className="customization-category">
                                        <h4>{category}</h4>
                                        
                                        {hasSubstitutable && (
                                            <div className="substitution-options">
                                                {ingredients
                                                    .filter(ing => ing.CanSubstitute === 1)
                                                    .map(ingredient => {
                                                        const priceAdj = parseFloat(ingredient.PriceAdjustment) || 0;
                                                        const isDefault = ingredient.IsRequired === 1;
                                                        const showPrice = !isDefault && priceAdj > 0;
                                                        const isAddable = ingredient.MaximumQuantity > ingredient.QuantityRequired;
                                                        const isSelected = selectedSubstitutions.get(category) === ingredient.IngredientID;
                                                        
                                                        // Calculate current quantity for selected substitutable ingredient
                                                        const customization = customizations.get(ingredient.IngredientID);
                                                        let currentQty = ingredient.QuantityRequired;
                                                        if (customization?.changeType === 'added') {
                                                            currentQty = ingredient.QuantityRequired + customization.quantityDelta;
                                                        }
                                                        
                                                        // Check if base required quantity has insufficient stock
                                                        const outOfStock = hasInsufficientStock(ingredient);
                                                        
                                                        return (
                                                            <div key={ingredient.IngredientID} className={`substitutable-ingredient-option ${outOfStock ? 'out-of-stock' : ''}`}>
                                                                <label className="radio-option">
                                                                    <input
                                                                        type="radio"
                                                                        name={category}
                                                                        checked={isSelected}
                                                                        onChange={() => handleSubstitution(category, ingredient.IngredientID, ingredients)}
                                                                        disabled={outOfStock}
                                                                    />
                                                                    <span>
                                                                        {ingredient.Name}
                                                                        {outOfStock && <span className="stock-badge"> (Out of Stock)</span>}
                                                                        {!outOfStock && showPrice && <span className="price-badge"> +${priceAdj.toFixed(2)}</span>}
                                                                        {!outOfStock && isDefault && <span className="default-badge"> (Included)</span>}
                                                                        {!outOfStock && isAddable && priceAdj > 0 && (
                                                                            <span className="price-info"> (+${priceAdj.toFixed(2)} per extra)</span>
                                                                        )}
                                                                    </span>
                                                                </label>
                                                                
                                                                {isSelected && isAddable && !outOfStock && (
                                                                    <div className="quantity-controls">
                                                                        <button 
                                                                            onClick={() => handleQuantityChange(ingredient, -1)}
                                                                            disabled={currentQty <= ingredient.QuantityRequired}
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span>{currentQty}</span>
                                                                        <button 
                                                                            onClick={() => handleQuantityChange(ingredient, 1)}
                                                                            disabled={currentQty >= ingredient.MaximumQuantity || currentQty >= ingredient.QuantityInStock}
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                        
                                        {hasNonSubstitutableOptions && (
                                            <div className="removable-options">
                                                {ingredients
                                                    .filter(ing => ing.CanSubstitute === 0 && (ing.IsRequired === 0 || ing.MaximumQuantity > ing.QuantityRequired))
                                                    .map(ingredient => {
                                                        const customization = customizations.get(ingredient.IngredientID);
                                                        const isRemoved = customization?.changeType === 'removed';
                                                        
                                                        // Calculate current quantity
                                                        let currentQty = ingredient.QuantityRequired;
                                                        if (isRemoved) {
                                                            currentQty = 0;
                                                        } else if (customization?.changeType === 'added') {
                                                            currentQty = ingredient.QuantityRequired + customization.quantityDelta;
                                                        }
                                                        
                                                        const isAddable = ingredient.MaximumQuantity > ingredient.QuantityRequired;
                                                        // Removable = NOT required (IsRequired === 0)
                                                        const isRemovable = ingredient.IsRequired === 0;
                                                        const priceAdj = parseFloat(ingredient.PriceAdjustment) || 0;
                                                        // Only grey out completely if base required quantity is out of stock
                                                        const outOfStock = hasInsufficientStock(ingredient, isRemoved ? 0 : ingredient.QuantityRequired);
                                                        
                                                        return (
                                                            <div key={ingredient.IngredientID} className={`ingredient-option ${outOfStock ? 'out-of-stock' : ''}`}>
                                                                <div className="ingredient-info">
                                                                    {isRemovable ? (
                                                                        <label className="checkbox-option">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!isRemoved}
                                                                                onChange={() => handleToggleIngredient(ingredient)}
                                                                                disabled={outOfStock && !isRemoved}
                                                                            />
                                                                            <span>
                                                                                {ingredient.Name}
                                                                                {outOfStock && !isRemoved && <span className="stock-badge"> (Out of Stock)</span>}
                                                                            </span>
                                                                        </label>
                                                                    ) : (
                                                                        <span className="ingredient-name">
                                                                            {ingredient.Name}
                                                                            {outOfStock && <span className="stock-badge"> (Out of Stock)</span>}
                                                                            {!outOfStock && <span className="default-badge"> (Included)</span>}
                                                                        </span>
                                                                    )}
                                                                    {!outOfStock && isAddable && (
                                                                        <span className="price-info">
                                                                            {priceAdj > 0 ? `+$${priceAdj.toFixed(2)} per extra` : 'Can add more'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                {!isRemoved && isAddable && !outOfStock && (
                                                                    <div className="quantity-controls">
                                                                        <button 
                                                                            onClick={() => handleQuantityChange(ingredient, -1)}
                                                                            disabled={currentQty <= ingredient.QuantityRequired}
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span>{currentQty}</span>
                                                                        <button 
                                                                            onClick={() => handleQuantityChange(ingredient, 1)}
                                                                            disabled={currentQty >= ingredient.MaximumQuantity || currentQty >= ingredient.QuantityInStock}
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <div className="customization-footer">
                    <button className="cancel-btn" onClick={handleClose}>Cancel</button>
                    <button 
                        className="add-to-cart-btn" 
                        onClick={handleAddToCart}
                        disabled={!itemAvailable}
                    >
                        {(() => {
                            if (!itemAvailable) {
                                return 'Item Unavailable';
                            }
                            const basePrice = parseFloat(item.Price);
                            const adjustment = calculatePriceAdjustment();
                            const total = basePrice + adjustment;
                            return adjustment > 0 
                                ? `Add to Cart - $${total.toFixed(2)} (Base: $${basePrice.toFixed(2)} + $${adjustment.toFixed(2)})`
                                : `Add to Cart - $${total.toFixed(2)}`;
                        })()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
