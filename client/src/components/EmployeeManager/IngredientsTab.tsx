import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/jwtAuth';
import { IngredientsForm } from './IngredientsForm.tsx';
import { IngredientsList } from './IngredientsList.tsx';
import { PlusIcon } from './Icons';
import { useToaster } from '../../contexts/ToastContext';
import type { Ingredient } from '../../types/Ingredient';

export const IngredientsTab: React.FC = () => {
  const { addToast } = useToaster();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [quantityInStock, setQuantityInStock] = useState('');

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/ingredients');
      if (!response.ok) {
        throw new Error(`Failed to load ingredients: ${response.statusText}`);
      }
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to load ingredients',
        'error',
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openForm = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setName(ingredient.Name);
      setCostPerUnit(
        typeof ingredient.CostPerUnit === 'string' 
          ? ingredient.CostPerUnit 
          : ingredient.CostPerUnit.toString()
      );
      setQuantityInStock(ingredient.QuantityInStock.toString());
    } else {
      resetForm();
    }
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingIngredient(null);
    setName('');
    setCostPerUnit('');
    setQuantityInStock('');
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = async () => {
    try {
      const payload: Partial<Ingredient> = {
        Name: name,
        CostPerUnit: costPerUnit,
        QuantityInStock: parseInt(quantityInStock),
      };

      const method = editingIngredient ? 'PUT' : 'POST';
      const url = editingIngredient 
        ? `/api/ingredients/${editingIngredient.IngredientID}` 
        : '/api/ingredients';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save ingredient: ${response.statusText}`);
      }

      addToast(
        editingIngredient ? 'Ingredient updated successfully!' : 'Ingredient created successfully!',
        'success',
        3000
      );
      closeForm();
      await loadIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to save ingredient',
        'error',
        5000
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;

    try {
      const response = await authenticatedFetch(`/api/ingredients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete ingredient: ${response.statusText}`);
      }

      addToast('Ingredient deleted successfully!', 'success', 3000);
      await loadIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      addToast(
        error instanceof Error ? error.message : 'Failed to delete ingredient',
        'error',
        5000
      );
    }
  };

  return (
    <div className="form-container">
      <div className="page-header">
        <h1 className="page-title">Ingredients Management</h1>
        <p className="page-subtitle">Add and manage ingredients for your menu items</p>
      </div>

      <div className="search-container">
        <div className="glass-search-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            className="glass-search-input"
            placeholder="Search ingredients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div className="search-results-count">
            Found {filteredIngredients.length} ingredient{filteredIngredients.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-message">Loading ingredients...</div>
      ) : (
        <IngredientsList
          ingredients={filteredIngredients}
          onEdit={openForm}
          onDelete={handleDelete}
          searchTerm={searchTerm}
        />
      )}

      <button className="add-menu-item-btn" onClick={() => openForm()}>
        <PlusIcon style={{ width: '24px', height: '24px' }} />
      </button>

      {showForm && (
        <IngredientsForm
          editingIngredient={editingIngredient}
          name={name}
          setName={setName}
          costPerUnit={costPerUnit}
          setCostPerUnit={setCostPerUnit}
          quantityInStock={quantityInStock}
          setQuantityInStock={setQuantityInStock}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </div>
  );
};
