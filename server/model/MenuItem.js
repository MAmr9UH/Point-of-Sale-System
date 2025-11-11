class MenuItem {
    constructor(data = {}) {
        this.MIID = data.MIID || null;
        this.name = data.name || '';
        this.description = data.description || null;
        this.price = data.price || 0;
        this.category = data.category || null;
        this.availability = data.availability !== undefined ? data.availability : true;
        this.imageURL = data.imageURL || null;
        this.createdAt = data.createdAt || null;
        this.lastUpdatedAt = data.lastUpdatedAt || null;
    }

    /**
     * Validates the MenuItem instance
     * @returns {Object} { isValid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        // Name validation - required, max 30 characters
        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        } else if (this.name.length > 30) {
            errors.push('Name must not exceed 30 characters');
        }

        // Description validation - optional, max 500 characters
        if (this.description && this.description.length > 500) {
            errors.push('Description must not exceed 500 characters');
        }

        // Price validation - required, must be a positive number with max 2 decimal places
        if (this.price === null || this.price === undefined || this.price === '') {
            errors.push('Price is required');
        } else {
            const priceNum = parseFloat(this.price);
            if (isNaN(priceNum) || priceNum < 0) {
                errors.push('Price must be a positive number');
            } else if (priceNum > 99999999.99) {
                errors.push('Price exceeds maximum allowed value (99999999.99)');
            } else {
                // Check for max 2 decimal places
                const decimalPlaces = (this.price.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    errors.push('Price must have at most 2 decimal places');
                }
            }
        }

        // Category validation - must be one of the allowed values
        const validCategories = ['appetizer', 'entree', 'dessert', 'beverage'];
        if (this.category && !validCategories.includes(this.category)) {
            errors.push(`Category must be one of: ${validCategories.join(', ')}`);
        }

        // Availability validation - must be boolean
        if (typeof this.availability !== 'boolean') {
            errors.push('Availability must be a boolean value');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the MenuItem instance to a plain object for database insertion
     * @returns {Object}
     */
    toJSON() {
        return {
            MIID: this.MIID,
            Name: this.name,
            Description: this.description,
            Price: this.price,
            ImageURL: this.imageURL,
            Category: this.category,
            Availability: this.availability,
            CreatedAt: this.createdAt,
            LastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Creates a MenuItem instance from database row
     * @param {Object} row - Database row object
     * @returns {MenuItem}
     */
    static fromDB(row) {
        return new MenuItem({
            MIID: row.MIID,
            name: row.Name,
            description: row.Description,
            price: row.Price,
            category: row.Category,
            imageURL: row.ImageURL,
            availability: row.Availability,
            createdAt: row.CreatedAt,
            lastUpdatedAt: row.LastUpdatedAt
        });
    }

    /**
     * Validates and returns data ready for database insertion (excluding auto-generated fields)
     * @returns {Object|null} Returns formatted data if valid, null otherwise
     */
    getInsertData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        return {
            Name: this.name.trim(),
            Description: this.description ? this.description.trim() : null,
            Price: parseFloat(this.price),
            Category: this.category,
            Availability: this.availability
        };
    }

    /**
     * Validates and returns data ready for database update
     * @returns {Object|null} Returns formatted data if valid, null otherwise
     */
    getUpdateData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const updateData = {
            Name: this.name.trim(),
            Description: this.description ? this.description.trim() : null,
            Price: parseFloat(this.price),
            Category: this.category,
            Availability: this.availability
        };

        // Only include MIID if it exists
        if (this.MIID) {
            updateData.MIID = this.MIID;
        }

        return updateData;
    }
}

import { db } from '../db/connection.js';

export const getAllMenuItems = async (availableOnly = true) => {
    const query = `
        SELECT *, MI.name as MIName, MI.MenuItemID as MIID, I.name as IName
        FROM pos.Menu_Item as MI LEFT JOIN pos.Used_For as UF on MI.MenuItemID = UF.MenuItemID
        LEFT JOIN pos.Ingredient as I ON UF.IngredientID = I.IngredientID
        ${availableOnly ? "WHERE MI.Availability = TRUE" : ""}
        `;
    const [results] = await db.query(query);
    const items = results;
    let final = {};
    for (const item of items) {

        if (!final[item.MIID]) {
            final[item.MIID] = {
                MenuItemID: item.MIID,
                Name: item.MIName,
                Description: item.Description,
                Price: item.Price,
                Category: item.Category,
                Availability: item.Availability,
                ImageURL: item.ImageURL,
                Ingredients: []
            };
        } 
        if (item.IngredientID)
            final[item.MIID].Ingredients.push({
                IngredientID: item.IngredientID,
                PriceAdjustment: item.PriceAdjustment,
                Name: item.IName,
                CustomizableCategory: item.CustomizableCategory || "Other",
                QuantityRequired: item.QuantityRequired,
                MaximumQuantity: item.MaximumQuantity,
                IsRemovable: item.IsRemovable,
                IsRequired: item.IsRequired,
                CanSubstitute: item.CanSubstitute
            })
    } 


    return Object.values(final);
}

export const getMenuItemByIds = async (menuItemIds) => {
    if (!menuItemIds || menuItemIds.length === 0) {
        return [];
    }

    const placeholders = menuItemIds.map(() => '?').join(',');
    const query = `
        SELECT *, MI.name as MIName, MI.MenuItemID as MIID, I.name as IName
        FROM pos.Menu_Item as MI LEFT JOIN pos.Used_For as UF on MI.MenuItemID = UF.MenuItemID
        LEFT JOIN pos.Ingredient as I ON UF.IngredientID = I.IngredientID
        WHERE MI.MenuItemID IN (${placeholders});
    `;

    const [results] = await db.query(query, menuItemIds);

    let final = {};
    for (const item of results) {

        if (!final[item.MIID]) {
            final[item.MIID] = {
                MenuItemID: item.MIID,
                Name: item.MIName,
                Description: item.Description,
                Price: item.Price,
                Category: item.Category,
                Availability: item.Availability,
                ImageURL: item.ImageURL,
                Ingredients: []
            };
        }
        if (item.IngredientID)
            final[item.MIID].Ingredients.push({
                IngredientID: item.IngredientID,
                PriceAdjustment: item.PriceAdjustment,
                Name: item.IName,
                CustomizableCategory: item.CustomizableCategory || "Other",
                QuantityRequired: item.QuantityRequired,
                MaximumQuantity: item.MaximumQuantity,
                IsRemovable: item.IsRemovable,
                IsRequired: item.IsRequired,
                CanSubstitute: item.CanSubstitute
            })
    }


    return final;
}

export const updateMenuItem = async (menuItemId, updateData) => {
    if (!menuItemId) {
        throw new Error('MenuItemID is required for update');
    }
    console.log(updateData);

    const [ res ] = await db.query('SELECT * FROM Menu_Item WHERE MenuItemID = ?', [menuItemId]);
    const oldmenuItem = res.length > 0 ? MenuItem.fromDB(res[0]) : null;

    if (!oldmenuItem) {
        throw new Error(`Menu item with ID ${menuItemId} not found`);
    }

    let updatedMenuItem = { ...oldmenuItem };


    updatedMenuItem.MIID = menuItemId;
    updatedMenuItem.availability = updateData.Availability == 1 ? true : false;
    updatedMenuItem.category = updateData.Category;
    updatedMenuItem.description = updateData.Description;
    updatedMenuItem.name = updateData.Name;
    updatedMenuItem.price = updateData.Price;
    const menuItemInstance = new MenuItem(updatedMenuItem);

    console.log('New Menu Item:', updatedMenuItem);

    if (!menuItemInstance.validate().isValid) {
        throw new Error(`Validation failed: ${menuItemInstance.validate().errors.join(', ')}`);
    }

    const query = `

        UPDATE Menu_Item
        SET Name = ?, Description = ?, Price = ?, Category = ?, Availability = ?
        WHERE MenuItemID = ?;
    `;

    const [results] = await db.query(query, [
        updatedMenuItem.name,
        updatedMenuItem.description,
        updatedMenuItem.price,
        updatedMenuItem.category,
        updatedMenuItem.availability,
        menuItemId
    ]);

    return results;
}

export const deleteMenuItem = async (menuItemId) => {
    if (!menuItemId) {
        throw new Error('MenuItemID is required for deletion');
    }
    const query = `
        DELETE FROM Menu_Item
        WHERE MenuItemID = ?;
    `;
    const [results] = await db.query(query, [menuItemId]);
    return results;
}



export default MenuItem;
