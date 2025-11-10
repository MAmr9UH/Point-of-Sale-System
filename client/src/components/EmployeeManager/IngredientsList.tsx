import React from 'react';
import type { Ingredient } from '../../types/Ingredient';

interface IngredientsListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: number) => void;
  searchTerm?: string;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
  ingredients,
  onEdit,
  onDelete,
  searchTerm = '',
}) => {
  if (ingredients.length === 0) {
    return (
      <div className="empty-state">
        {searchTerm ? (
          <p>No ingredients found matching "{searchTerm}". Try a different search term.</p>
        ) : (
          <p>No ingredients added yet. Click the + button to add one!</p>
        )}
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="ingredients-grid">
      {ingredients.map((ingredient) => {
        const isLowStock = ingredient.QuantityInStock <= 10;
        
        return (
          <div key={ingredient.IngredientID} className="ingredient-card">
            <div className="ingredient-header">
              <h3 className="ingredient-name">{ingredient.Name}</h3>
              {isLowStock && (
                <span className="low-stock-badge">⚠️ Low Stock</span>
              )}
            </div>
            
            <div className="ingredient-details">
              <div className="ingredient-detail">
                <span className="detail-label">Cost per Unit:</span>
                <span className="detail-value">
                  ${typeof ingredient.CostPerUnit === 'string' 
                    ? parseFloat(ingredient.CostPerUnit).toFixed(2)
                    : ingredient.CostPerUnit.toFixed(2)}
                </span>
              </div>
              
              <div className="ingredient-detail">
                <span className="detail-label">Quantity in Stock:</span>
                <span className={`detail-value ${isLowStock ? 'low-stock' : ''}`}>
                  {ingredient.QuantityInStock}
                </span>
              </div>
              
              {ingredient.LastUpdatedAt && (
                <div className="ingredient-detail">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{formatDate(ingredient.LastUpdatedAt)}</span>
                </div>
              )}
            </div>

            <div className="ingredient-actions">
              <button
                className="btn-edit"
                onClick={() => onEdit(ingredient)}
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => ingredient.IngredientID && onDelete(ingredient.IngredientID)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
