import React, { useState, useEffect } from 'react';
import { useToaster } from '../../contexts/ToastContext';
import './MenuItemCustomizationTab.css';

interface MenuItem {
  MenuItemID: number;
  Name: string;
  Category: string;
  Price: number;
}

interface Ingredient {
  IngredientID: number;
  Name: string;
  CostPerUnit: number;
}

interface Customization {
  UsedForID?: number;
  MenuItemID: number;
  IngredientID: number;
  IngredientName?: string;
  CustomizableCategory: string | null;
  QuantityRequired: number;
  MaxiumQuantity?: number; // Frontend typo version
  MaximumQuantity?: number; // Backend correct version
  IsDefault: boolean;
  PriceAdjustment: number;
  IsRequired: boolean;
  CanSubstitute: boolean;
}

interface DroppedIngredient {
  ingredient: Ingredient;
  customization: {
    QuantityRequired: number;
    MaxiumQuantity: number;
    IsDefault: boolean;
    PriceAdjustment: number;
    IsRequired: boolean;
    CanSubstitute: boolean;
  };
  existingId?: number; // For editing existing customizations
}

interface Category {
  id: string;
  name: string;
  items: DroppedIngredient[];
  isSubstitutable: boolean;
  isRequired: boolean;
}

export const MenuItemCustomizationTab: React.FC = () => {
  const { addToast } = useToaster();

  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIngredient, setDraggedIngredient] = useState<Ingredient | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'base', name: 'Base Ingredients', items: [], isSubstitutable: false, isRequired: false }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadMenuItems();
    loadIngredients();
  }, []);

  useEffect(() => {
    if (selectedMenuItem) {
      loadExistingCustomizations(selectedMenuItem);
    } else {
      // Reset categories when no menu item is selected
      setCategories([{ id: 'base', name: 'Base Ingredients', items: [], isSubstitutable: false, isRequired: false }]);
    }
  }, [selectedMenuItem]);

  const loadMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/items');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
      addToast('Failed to load menu items', 'error', 5000);
    }
  };

  const loadIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      addToast('Failed to load ingredients', 'error', 5000);
    }
  };

  const loadExistingCustomizations = async (menuItemId: number) => {
    try {
      const response = await fetch(`/api/menu/customizations/${menuItemId}`);
      const customizations: Customization[] = await response.json();
      
      // Group customizations by category
      const grouped: Record<string, DroppedIngredient[]> = {};
      
      customizations.forEach(cust => {
        const categoryName = cust.CustomizableCategory || 'Base Ingredients';
        const ingredient = ingredients.find(i => i.IngredientID === cust.IngredientID);
        
        if (ingredient) {
          if (!grouped[categoryName]) {
            grouped[categoryName] = [];
          }
          
          grouped[categoryName].push({
            ingredient,
            customization: {
              QuantityRequired: cust.QuantityRequired,
              MaxiumQuantity: cust.MaximumQuantity || cust.MaxiumQuantity || 1, // Handle both spellings
              IsDefault: cust.IsDefault,
              PriceAdjustment: cust.PriceAdjustment,
              IsRequired: cust.IsRequired,
              CanSubstitute: cust.CanSubstitute,
            },
            existingId: cust.UsedForID
          });
        }
      });
      
      // Create categories from grouped data
      const newCategories: Category[] = Object.entries(grouped).map(([name, items], index) => {
        // Determine category-level flags from items
        const isSubstitutable = items.length > 0 && items[0].customization.CanSubstitute;
        const isRequired = items.length > 0 && items[0].customization.IsRequired;
        
        return {
          id: index === 0 && name === 'Base Ingredients' ? 'base' : `cat-${Date.now()}-${index}`,
          name,
          items,
          isSubstitutable,
          isRequired
        };
      });
      
      setCategories(newCategories.length > 0 ? newCategories : [{ id: 'base', name: 'Base Ingredients', items: [], isSubstitutable: false, isRequired: false }]);
    } catch (error) {
      console.error('Error loading customizations:', error);
      addToast('Failed to load existing customizations', 'error', 5000);
    }
  };

  const filteredIngredients = ingredients.filter(ing =>
    ing.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIngredientIcon = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('milk')) return '🥛';
    if (lower.includes('coffee') || lower.includes('espresso')) return '☕';
    if (lower.includes('sugar') || lower.includes('syrup')) return '🍯';
    if (lower.includes('cream')) return '🍦';
    if (lower.includes('chocolate') || lower.includes('cocoa')) return '🍫';
    if (lower.includes('vanilla')) return '🌼';
    if (lower.includes('caramel')) return '🍮';
    if (lower.includes('tea')) return '🍵';
    if (lower.includes('water')) return '💧';
    if (lower.includes('ice')) return '🧊';
    return '🔸';
  };

  const handleDragStart = (e: React.DragEvent, ingredient: Ingredient) => {
    setDraggedIngredient(ingredient);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedIngredient(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    // Auto-scroll when dragging near edges
    const SCROLL_ZONE = 50; // pixels from edge to trigger scroll
    const SCROLL_SPEED = 10; // pixels to scroll
    const clientY = e.clientY;
    const windowHeight = window.innerHeight;
    
    if (clientY < SCROLL_ZONE) {
      // Near top - scroll up
      window.scrollBy(0, -SCROLL_SPEED);
    } else if (clientY > windowHeight - SCROLL_ZONE) {
      // Near bottom - scroll down
      window.scrollBy(0, SCROLL_SPEED);
    }
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    
    if (!draggedIngredient) return;

    // Check if ingredient already exists in any category
    const alreadyExists = categories.some(cat =>
      cat.items.some(item => item.ingredient.IngredientID === draggedIngredient.IngredientID)
    );

    if (alreadyExists) {
      addToast('This ingredient is already added to a category', 'error', 3000);
      setDraggedIngredient(null);
      return;
    }

    const newItem: DroppedIngredient = {
      ingredient: draggedIngredient,
      customization: {
        QuantityRequired: 1,
        MaxiumQuantity: 10,
        IsDefault: false,
        PriceAdjustment: 0,
        IsRequired: false,
        CanSubstitute: false,
      }
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, items: [...cat.items, newItem] };
      }
      return cat;
    }));

    setDraggedIngredient(null);
  };

  const handleRemoveItem = (categoryId: string, ingredientId: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter(item => item.ingredient.IngredientID !== ingredientId)
        };
      }
      return cat;
    }));
  };

  const handleUpdateCustomization = (
    categoryId: string,
    ingredientId: number,
    field: keyof DroppedIngredient['customization'],
    value: any
  ) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.ingredient.IngredientID === ingredientId) {
              return {
                ...item,
                customization: { ...item.customization, [field]: value }
              };
            }
            return item;
          })
        };
      }
      return cat;
    }));
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      items: [],
      isSubstitutable: false,
      isRequired: false
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categories.length === 1) {
      addToast('You must have at least one category', 'error', 3000);
      return;
    }
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const handleCategoryNameChange = (categoryId: string, newName: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, name: newName };
      }
      return cat;
    }));
  };

  const handleCategoryFlagChange = (categoryId: string, flag: 'isSubstitutable' | 'isRequired', value: boolean) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        const updatedCat = { ...cat, [flag]: value };
        
        // Only update CanSubstitute on all items
        updatedCat.items = cat.items.map(item => ({
          ...item,
          customization: {
            ...item.customization,
            CanSubstitute: flag === 'isSubstitutable' ? value : updatedCat.isSubstitutable,
            // IsRequired stays at item level unless category is substitutable
            IsRequired: updatedCat.isSubstitutable ? updatedCat.isRequired : item.customization.IsRequired
          }
        }));
        
        // Validate: if substitutable and has items, ensure exactly one default
        if (updatedCat.isSubstitutable && updatedCat.items.length > 0) {
          const defaultCount = updatedCat.items.filter(item => item.customization.IsDefault).length;
          if (defaultCount === 0) {
            // Set first item as default
            updatedCat.items[0].customization.IsDefault = true;
          } else if (defaultCount > 1) {
            // Keep only the first default, unset others
            let foundFirst = false;
            updatedCat.items = updatedCat.items.map(item => ({
              ...item,
              customization: {
                ...item.customization,
                IsDefault: item.customization.IsDefault && !foundFirst ? (foundFirst = true) : false
              }
            }));
          }
        }
        
        return updatedCat;
      }
      return cat;
    }));
  };

  const handleToggleDefault = (categoryId: string, ingredientId: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId && cat.isSubstitutable) {
        return {
          ...cat,
          items: cat.items.map(item => ({
            ...item,
            customization: {
              ...item.customization,
              IsDefault: item.ingredient.IngredientID === ingredientId
            }
          }))
        };
      }
      return cat;
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedMenuItem) {
      addToast('Please select a menu item first', 'error', 3000);
      return;
    }

    const allItems = categories.flatMap(cat => cat.items);
    if (allItems.length === 0) {
      addToast('Please add at least one ingredient customization', 'error', 3000);
      return;
    }

    setIsSaving(true);

    try {
      // First, delete all existing customizations
      const existingResponse = await fetch(`/api/menu/customizations/${selectedMenuItem}`);
      const existingCustomizations: Customization[] = await existingResponse.json();
      
      for (const cust of existingCustomizations) {
        await fetch(`/api/menu/customizations/${cust.UsedForID}`, {
          method: 'DELETE',
        });
      }

      // Then create all new customizations
      for (const category of categories) {
        for (const item of category.items) {
          const payload = {
            MenuItemID: selectedMenuItem,
            IngredientID: item.ingredient.IngredientID,
            CustomizableCategory: category.name === 'Base Ingredients' ? null : category.name,
            QuantityRequired: item.customization.QuantityRequired,
            MaximumQuantity: item.customization.MaxiumQuantity || item.customization.QuantityRequired,
            IsDefault: item.customization.IsDefault,
            PriceAdjustment: item.customization.PriceAdjustment,
            // If category is substitutable, use category-level isRequired, otherwise use item-level
            IsRequired: category.isSubstitutable ? category.isRequired : item.customization.IsRequired,
            CanSubstitute: category.isSubstitutable,
          };

          const res = await fetch('/api/menu/customizations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${res.status}`);
          }
        }
      }

      setSuccessMessage('🎉 All customizations saved successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      addToast('Customizations saved successfully!', 'success', 3000);
      
      // Reload customizations
      if (selectedMenuItem) {
        await loadExistingCustomizations(selectedMenuItem);
      }
    } catch (err) {
      console.error('Error saving customizations:', err);
      addToast(
        err instanceof Error ? err.message : 'Failed to save customizations',
        'error',
        5000
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedMenuItemData = menuItems.find(item => item.MenuItemID === selectedMenuItem);
  const totalCustomizations = categories.reduce((sum, cat) => sum + cat.items.length, 0);

  // Calculate minimum profit margin
  const calculateMinimumProfitMargin = (): { cost: number; price: number; items: string[] } | null => {
    if (!selectedMenuItemData || categories.length === 0) {
      return null;
    }

    const basePrice = selectedMenuItemData.Price;
    
    // Generate all possible valid customization configurations
    const generateConfigurations = (categoryIndex: number, currentConfig: DroppedIngredient[]): DroppedIngredient[][] => {
      if (categoryIndex >= categories.length) {
        return [currentConfig];
      }

      const category = categories[categoryIndex];
      const configs: DroppedIngredient[][] = [];

      if (category.isSubstitutable) {
        // For substitutable categories, must pick exactly one item
        category.items.forEach(item => {
          configs.push(...generateConfigurations(categoryIndex + 1, [...currentConfig, item]));
        });
      } else {
        // For non-substitutable categories
        const requiredItems = category.items.filter(item => item.customization.IsRequired);
        const optionalItems = category.items.filter(item => !item.customization.IsRequired);

        // Always include required items
        let baseConfig = [...currentConfig, ...requiredItems];

        // Generate all combinations of optional items (include or exclude)
        const optionalCombinations = (index: number, current: DroppedIngredient[]): DroppedIngredient[][] => {
          if (index >= optionalItems.length) {
            return [current];
          }
          // Include this optional item
          const withItem = optionalCombinations(index + 1, [...current, optionalItems[index]]);
          // Exclude this optional item
          const withoutItem = optionalCombinations(index + 1, current);
          return [...withItem, ...withoutItem];
        };

        const optionalConfigs = optionalCombinations(0, baseConfig);
        optionalConfigs.forEach(config => {
          configs.push(...generateConfigurations(categoryIndex + 1, config));
        });
      }

      return configs;
    };

    const allConfigurations = generateConfigurations(0, []);
    
    if (allConfigurations.length === 0) {
      return null;
    }

    // Calculate profit margin for each configuration
    let minMargin = Infinity;
    let worstConfig: { cost: number; price: number; items: string[] } | null = null;

    allConfigurations.forEach(config => {
      const totalCost = config.reduce((sum, item) => {
        return sum + (Number(item.ingredient.CostPerUnit) * Number(item.customization.QuantityRequired));
      }, 0);

      const totalPriceAdjustment = config.reduce((sum, item) => {
        return sum + Number(item.customization.PriceAdjustment);
      }, 0);

      const finalPrice = basePrice + totalPriceAdjustment;
      const margin = finalPrice - totalCost;

      if (margin < minMargin) {
        minMargin = margin;
        worstConfig = {
          cost: totalCost,
          price: finalPrice,
          items: config.map(item => `${item.ingredient.Name} (${Number(item.customization.QuantityRequired)}x)`)
        };
      }
    });
    console.log(worstConfig)
    return worstConfig;
  };

  const minProfitMarginData = calculateMinimumProfitMargin();

  return (
    <div className="customization-game-container">
      {isSaving && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="game-header">
        <h1 className="game-title">🎮 Ingredient Customization Builder</h1>
        <p className="game-subtitle">Drag & Drop ingredients to create the perfect customization experience</p>
      </div>

      {successMessage && (
        <div className="success-message">
          <span className="success-message-icon">✨</span>
          <span className="success-message-text">{successMessage}</span>
          <button className="close-success-btn" onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      {/* Help Panel */}
      <div className="help-panel">
        <div className="help-title">
          <span>💡</span> How to Use
        </div>
        <ul className="help-steps">
          <li>Select a menu item from the dropdown below</li>
          <li>Drag ingredients from the left palette into category zones</li>
          <li>Customize each ingredient's behavior and pricing</li>
          <li>Create new categories for different customization groups</li>
          <li><strong>Logic:</strong> Ingredients NOT required = removable | Max &gt; Default = addable</li>
          <li>Click "Save All Customizations" when done</li>
        </ul>
      </div>

      {/* Menu Item Selection */}
      <div className="menu-selector-card">
        <h2>🍽️ Select Menu Item to Customize</h2>
        <select
          className="menu-selector"
          id='menu-item-selection'
          value={selectedMenuItem || ''}
          onChange={(e) => {
            setSelectedMenuItem(e.target.value ? parseInt(e.target.value) : null);
            setSuccessMessage('');
          }}
        >
          <option value="">Choose a menu item...</option>
          {menuItems.map((item) => (
            <option key={item.MenuItemID} value={item.MenuItemID}>
              {item.Name} - ${Number(item.Price).toFixed(2)} ({item.Category})
            </option>
          ))}
        </select>

        {selectedMenuItemData && (
          <>
            <div className="selected-item-banner">
              <div className="selected-item-name">
                ⭐ {selectedMenuItemData.Name}
              </div>
              <div className="selected-item-details">
                Base Price: ${Number(selectedMenuItemData.Price).toFixed(2)} • 
                Category: {selectedMenuItemData.Category} • 
                Active Customizations: {totalCustomizations}
              </div>
            </div>

            {minProfitMarginData && (
              <div className="profit-margin-card">
                <div className="profit-margin-header">
                  <span className="profit-margin-icon">📊</span>
                  <span className="profit-margin-title">Minimum Profit Margin Analysis</span>
                </div>
                <div className="profit-margin-content">
                  <div className="profit-margin-main">
                    <div className="profit-margin-label">Worst Case Margin:</div>
                    <div className={`profit-margin-value ${(Number(minProfitMarginData.price) - Number(minProfitMarginData.cost)) < 0 ? 'negative' : ''}`}>
                      ${(Number(minProfitMarginData.price) - Number(minProfitMarginData.cost)).toFixed(2)}
                      <span className="profit-margin-percentage">
                        ({Number(minProfitMarginData.cost) > 0 ? ((Number(minProfitMarginData.price) - Number(minProfitMarginData.cost)) / Number(minProfitMarginData.cost) * 100).toFixed(1) : '0.0'}%)
                      </span>
                    </div>
                  </div>
                  <div className="profit-margin-breakdown">
                    <div className="profit-stat">
                      <span className="stat-label">Total Cost:</span>
                      <span className="stat-value">${Number(minProfitMarginData.cost).toFixed(2)}</span>
                    </div>
                    <div className="profit-stat">
                      <span className="stat-label">Final Price:</span>
                      <span className="stat-value">${Number(minProfitMarginData.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <details className="profit-margin-details">
                    <summary className="profit-margin-summary">View Worst Configuration</summary>
                    <ul className="worst-config-list">
                      {minProfitMarginData.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Game Board */}
      {selectedMenuItem ? (
        <>
          <div className="customization-board">
            {/* Ingredients Palette */}
            <div className="ingredients-palette">
              <div className="palette-header">
                <span className="palette-icon">🧩</span>
                <span>Ingredient Palette</span>
              </div>
              <div className="glass-search-wrapper">
                <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  id="ingredient-search"
                  type="text"
                  className="glass-search-input"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <div className="search-results-count">
                  Found {filteredIngredients.length} ingredient{filteredIngredients.length !== 1 ? 's' : ''}
                </div>
              )}
              <div className="ingredients-list">
                {filteredIngredients.map((ingredient) => {
                  const isUsed = categories.some(cat =>
                    cat.items.some(item => item.ingredient.IngredientID === ingredient.IngredientID)
                  );
                  
                  return (
                    <div
                      key={ingredient.IngredientID}
                      className={`ingredient-card ${draggedIngredient?.IngredientID === ingredient.IngredientID ? 'dragging' : ''}`}
                      draggable={!isUsed}
                      onDragStart={(e) => !isUsed && handleDragStart(e, ingredient)}
                      onDragEnd={handleDragEnd}
                      style={{ opacity: isUsed ? 0.4 : 1, cursor: isUsed ? 'not-allowed' : 'grab' }}
                    >
                      <span className="ingredient-icon">{getIngredientIcon(ingredient.Name)}</span>
                      <div className="ingredient-info">
                        <div className="ingredient-name">{ingredient.Name}</div>
                        <div className="ingredient-cost">${Number(ingredient.CostPerUnit).toFixed(2)}/unit</div>
                      </div>
                      {isUsed && <span style={{ fontSize: '12px' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drop Zones */}
            <div className="drop-zones-container">
              <div className="drop-zones-header">
                <h2 className="drop-zones-title">🎯 Customization Categories</h2>
                <button className="add-category-btn" onClick={handleAddCategory}>
                  <span>+</span> Add Category
                </button>
              </div>

              <div className="category-zones">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="category-zone"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    <div className="category-header">
                      <input
                        id={`category-name-${category.id}`}
                        type="text"
                        className="category-name-input"
                        value={category.name}
                        onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                        placeholder="Category name..."
                      />
                      <div className="category-flags">
                        <label className={`category-toggle ${category.isSubstitutable ? 'active' : ''}`} title="Items in this category can substitute for each other">
                          <input
                            type="checkbox"
                            checked={category.isSubstitutable}
                            onChange={(e) => handleCategoryFlagChange(category.id, 'isSubstitutable', e.target.checked)}
                          />
                          <span>🔄 Substitutable</span>
                        </label>
                        {category.isSubstitutable && (
                          <label className={`category-toggle ${category.isRequired ? 'active' : ''}`} title="This category is required">
                            <input
                              type="checkbox"
                              checked={category.isRequired}
                              onChange={(e) => handleCategoryFlagChange(category.id, 'isRequired', e.target.checked)}
                            />
                            <span>⭐ Required</span>
                          </label>
                        )}
                      </div>
                      {categories.length > 1 && (
                        <button
                          className="delete-category-btn"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>

                    <div className="dropped-items">
                      {category.items.length === 0 ? (
                        <div className="empty-zone-message">
                          ⬇️ Drag ingredients here
                        </div>
                      ) : (
                        category.items.map((item) => (
                          <div key={item.ingredient.IngredientID} className="dropped-item-card">
                            <div className="dropped-item-header">
                              <div className="dropped-item-name">
                                <span>{getIngredientIcon(item.ingredient.Name)}</span>
                                {item.ingredient.Name}
                              </div>
                              <button
                                className="remove-item-btn"
                                onClick={() => handleRemoveItem(category.id, item.ingredient.IngredientID)}
                              >
                                ✕ Remove
                              </button>
                            </div>

                            <div className="customization-controls">
                              <div className="control-group">
                                <label className="control-label">Qty Required</label>
                                <input
                                  id={`qty-required-${category.id}-${item.ingredient.IngredientID}`}
                                  type="number"
                                  className="control-input"
                                  min="1"
                                  value={item.customization.QuantityRequired}
                                  onChange={(e) => handleUpdateCustomization(
                                    category.id,
                                    item.ingredient.IngredientID,
                                    'QuantityRequired',
                                    parseInt(e.target.value) || 1
                                  )}
                                />
                              </div>
                              <div className="control-group">
                                <label className="control-label">Max Qty</label>
                                <input
                                  id={`max-qty-${category.id}-${item.ingredient.IngredientID}`}
                                  type="number"
                                  className="control-input"
                                  min="1"
                                  value={item.customization.MaxiumQuantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    handleUpdateCustomization(
                                      category.id,
                                      item.ingredient.IngredientID,
                                      'MaxiumQuantity',
                                      isNaN(val) || val < 1 ? 1 : val
                                    );
                                  }}
                                />
                              </div>
                              <div className="control-group">
                                <label className="control-label">Price Adjust ($)</label>
                                <input
                                  id={`price-adjust-${category.id}-${item.ingredient.IngredientID}`}
                                  type="number"
                                  className="control-input"
                                  step="0.01"
                                  value={item.customization.PriceAdjustment}
                                  onChange={(e) => handleUpdateCustomization(
                                    category.id,
                                    item.ingredient.IngredientID,
                                    'PriceAdjustment',
                                    parseFloat(e.target.value) || 0
                                  )}
                                />
                              </div>
                            </div>

                            <div className="behavior-toggles">
                              {category.isSubstitutable ? (
                                <label className={`behavior-toggle ${item.customization.IsDefault ? 'active' : ''}`}>
                                  <input
                                    id={`is-default-${category.id}-${item.ingredient.IngredientID}`}
                                    type="radio"
                                    name={`default-${category.id}`}
                                    checked={item.customization.IsDefault}
                                    onChange={() => handleToggleDefault(category.id, item.ingredient.IngredientID)}
                                  />
                                  ⭐ Default
                                </label>
                              ) : (
                                <>
                                  <label className={`behavior-toggle ${item.customization.IsDefault ? 'active' : ''}`}>
                                    <input
                                      id={`is-default-${category.id}-${item.ingredient.IngredientID}`}
                                      type="checkbox"
                                      checked={item.customization.IsDefault}
                                      onChange={(e) => handleUpdateCustomization(
                                        category.id,
                                        item.ingredient.IngredientID,
                                        'IsDefault',
                                        e.target.checked
                                      )}
                                    />
                                    ⭐ Default
                                  </label>
                                  <label className={`behavior-toggle ${item.customization.IsRequired ? 'active' : ''}`}>
                                    <input
                                      id={`is-required-${category.id}-${item.ingredient.IngredientID}`}
                                      type="checkbox"
                                      checked={item.customization.IsRequired}
                                      onChange={(e) => handleUpdateCustomization(
                                        category.id,
                                        item.ingredient.IngredientID,
                                        'IsRequired',
                                        e.target.checked
                                      )}
                                    />
                                    ⚠️ Required
                                  </label>
                                </>
                              )}
                            </div>
                            
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', paddingLeft: '4px' }}>
                              💡 {category.isSubstitutable ? (
                                <>Category is <strong>🔄 Substitutable</strong> {category.isRequired && <strong>⭐ Required</strong>} (Select one default)</>
                              ) : (
                                <>Set <strong>⭐ Default</strong> and <strong>⚠️ Required</strong> per item</>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            className="save-all-btn"
            onClick={handleSaveAll}
            disabled={isSaving || totalCustomizations === 0}
          >
            {isSaving ? (
              <>
                <span>⏳</span> Saving...
              </>
            ) : (
              <>
                <span>💾</span> Save All Customizations ({totalCustomizations})
              </>
            )}
          </button>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <div className="empty-state-title">Ready to Build!</div>
          <div className="empty-state-message">
            Select a menu item above to start creating customizations
          </div>
        </div>
      )}
    </div>
  );
};