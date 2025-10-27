import { useState, useEffect } from 'react';
import './CustomizationModal.css';
import type { MenuItem, Ingredient } from '../types/MenuItem';

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
    const [customizations, setCustomizations] = useState<Map<number, IngredientCustomization>>(new Map());
    const [selectedSubstitutions, setSelectedSubstitutions] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        if (isOpen && item) {
            // Reset customizations when modal opens
            setCustomizations(new Map());
            
            // Set default selections for substitutable categories
            const defaultSubstitutions = new Map<string, number>();
            const categorizedIngredients = groupByCategory(item.Ingredients);
            
            Object.entries(categorizedIngredients).forEach(([category, ingredients]) => {
                const requiredSubstitutable = ingredients.find(ing => ing.IsRequired && ing.CanSubstitute);
                if (requiredSubstitutable) {
                    defaultSubstitutions.set(category, requiredSubstitutable.IngredientID);
                }
            });
            
            setSelectedSubstitutions(defaultSubstitutions);
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    const groupByCategory = (ingredients: Ingredient[]) => {
        return ingredients.reduce((acc, ingredient) => {
            // Skip ingredients that are required and cannot be substituted (they'll always be included)
            if (ingredient.IsRequired && !ingredient.CanSubstitute) {
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

    const handleToggleIngredient = (ingredient: Ingredient) => {
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
        const defaultIngredient = ingredients.find(ing => ing.IsRequired && ing.CanSubstitute);
        
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
        if (newQuantity > ingredient.MaxiumQuantity || newQuantity < ingredient.QuantityRequired) {
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

    const handleAddToCart = () => {
        onAddToCart(item, Array.from(customizations.values()));
        onClose();
    };

    const categorizedIngredients = groupByCategory(item.Ingredients);
    const hasCustomizations = Object.keys(categorizedIngredients).length > 0;

    return (
        <div className="customization-modal-overlay" onClick={onClose}>
            <div className="customization-modal" onClick={(e) => e.stopPropagation()}>
                <div className="customization-header">
                    <h2>{item.Name}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
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
                    ) : (
                        <div className="customization-options">
                            <h3>Customize Your Order</h3>
                            
                            {Object.entries(categorizedIngredients).map(([category, ingredients]) => {
                                const hasSubstitutable = ingredients.some(ing => ing.CanSubstitute);
                                const hasRemovable = ingredients.some(ing => ing.IsRemovable && !ing.CanSubstitute);
                                
                                return (
                                    <div key={category} className="customization-category">
                                        <h4>{category}</h4>
                                        
                                        {hasSubstitutable && (
                                            <div className="substitution-options">
                                                {ingredients
                                                    .filter(ing => ing.CanSubstitute)
                                                    .map(ingredient => (
                                                        <label key={ingredient.IngredientID} className="radio-option">
                                                            <input
                                                                type="radio"
                                                                name={category}
                                                                checked={selectedSubstitutions.get(category) === ingredient.IngredientID}
                                                                onChange={() => handleSubstitution(category, ingredient.IngredientID, ingredients)}
                                                            />
                                                            <span>{ingredient.Name}</span>
                                                        </label>
                                                    ))}
                                            </div>
                                        )}
                                        
                                        {hasRemovable && (
                                            <div className="removable-options">
                                                {ingredients
                                                    .filter(ing => ing.IsRemovable && !ing.CanSubstitute)
                                                    .map(ingredient => {
                                                        const isRemoved = customizations.has(ingredient.IngredientID);
                                                        const customization = customizations.get(ingredient.IngredientID);
                                                        const currentQty = customization 
                                                            ? ingredient.QuantityRequired + customization.quantityDelta 
                                                            : ingredient.QuantityRequired;
                                                        
                                                        return (
                                                            <div key={ingredient.IngredientID} className="ingredient-option">
                                                                <label className="checkbox-option">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!isRemoved}
                                                                        onChange={() => handleToggleIngredient(ingredient)}
                                                                    />
                                                                    <span>{ingredient.Name}</span>
                                                                </label>
                                                                
                                                                {!isRemoved && ingredient.MaxiumQuantity > ingredient.QuantityRequired && (
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
                                                                            disabled={currentQty >= ingredient.MaxiumQuantity}
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
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="add-to-cart-btn" onClick={handleAddToCart}>
                        Add to Cart - ${item.Price}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal;
