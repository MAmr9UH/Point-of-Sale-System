import React, { useState, useEffect } from 'react';
import { fetchMenuEm, updateMenuItem } from '../../utils/fetchMenu';
import type { MenuItem } from '../../types/MenuItem';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemForm } from './MenuItemForm';
import { PlusIcon } from './Icons';
import { useToaster } from '../../contexts/ToastContext';

export const MenuTab: React.FC = () => {
  const { addToast } = useToaster();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form state
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState(true);
  const [imageURL, setImageURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setIsLoadingMenu(true);
    try {
      const items = await fetchMenuEm();
      setMenuItems(items);
    } catch (err) {
      console.error('❌ Error loading menu items:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const openMenuForm = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.Name);
      setItemDescription(item.Description);
      setItemPrice(item.Price);
      setCategory(item.Category);
      setAvailable(item.Availability === 1);
      setImageURL(item.ImageURL || '');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemDescription('');
      setItemPrice('');
      setCategory('');
      setAvailable(true);
      setImageURL('');
    }
    setShowMenuForm(true);
    setSaveMessage('');
  };

  const closeMenuForm = () => {
    setShowMenuForm(false);
    setEditingItem(null);
    setSaveMessage('');
  };

  const isFormValid = Boolean(
    itemName.trim() &&
      itemDescription.trim() &&
      parseFloat(itemPrice) > 0 &&
      category.trim()
  );

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSaving(true);
    setSaveMessage('');

    const updatedItem: MenuItem = {
      MenuItemID: editingItem?.MenuItemID || 0,
      Name: itemName,
      Description: itemDescription,
      Price: itemPrice,
      Category: category as 'appetizer' | 'entree' | 'dessert' | 'beverage',
      Availability: available ? 1 : 0,
      ImageURL: imageURL || '',
      Ingredients: editingItem?.Ingredients || []
    };

    try {
      await updateMenuItem(updatedItem);
      
      // Update the menu items list immediately without refresh
      if (editingItem) {
        // Update existing item
        setMenuItems(prevItems =>
          prevItems.map(item =>
            item.MenuItemID === updatedItem.MenuItemID ? updatedItem : item
          )
        );
      } else {
        // Add new item (fetch to get the new ID from server)
        setIsRefetching(true);
        const items = await fetchMenuEm();
        setMenuItems(items);
        setIsRefetching(false);
      }
      
      addToast(
        editingItem ? '✔ Menu item updated!' : '✔ Menu item created!',
        'success'
      );
      setSaveMessage(editingItem ? '✔ Menu item updated!' : '✔ Menu item created!');
      
      // Form will auto-close after showing success message (handled in MenuItemForm)
    } catch (err) {
      console.error('Save error:', err);
      addToast('❌ Failed to save menu item', 'error');
      setSaveMessage('❌ Failed to save menu item');
      setIsRefetching(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    
    if (!confirm(`Are you sure you want to delete "${editingItem.Name}"?`)) {
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch(`/api/menu/${editingItem.MenuItemID}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete menu item');
      }

      // Remove item from list immediately
      setMenuItems(prevItems =>
        prevItems.filter(item => item.MenuItemID !== editingItem.MenuItemID)
      );

      addToast('✔ Menu item deleted!', 'success');
      closeMenuForm();
    } catch (err) {
      console.error('Delete error:', err);
      addToast('❌ Failed to delete menu item', 'error');
      setSaveMessage('❌ Failed to delete menu item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Menu Items</h1>
        <p className="page-subtitle">Manage your restaurant's menu items</p>
      </div>

      {isLoadingMenu || isRefetching ? (
        <div className="loading-spinner">
          {isLoadingMenu ? 'Loading menu items...' : 'Updating menu...'}
        </div>
      ) : (
        <div className="menu-items-grid">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.MenuItemID}
              item={item}
              onClick={() => openMenuForm(item)}
            />
          ))}
        </div>
      )}

      {/* Add Button - Fixed Bottom Right */}
      <button className="add-menu-item-btn" onClick={() => openMenuForm()}>
        <PlusIcon style={{ width: '24px', height: '24px' }} />
      </button>

      {/* Modal Form */}
      {showMenuForm && (
        <MenuItemForm
          editingItem={editingItem}
          itemName={itemName}
          setItemName={setItemName}
          itemDescription={itemDescription}
          setItemDescription={setItemDescription}
          itemPrice={itemPrice}
          setItemPrice={setItemPrice}
          category={category}
          setCategory={setCategory}
          available={available}
          setAvailable={setAvailable}
          imageURL={imageURL}
          setImageURL={setImageURL}
          isSaving={isSaving}
          saveMessage={saveMessage}
          onSave={handleSave}
          onClose={closeMenuForm}
          onDelete={handleDelete}
          isFormValid={isFormValid}
        />
      )}
    </div>
  );
};
