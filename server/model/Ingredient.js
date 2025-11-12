class Ingredient {
    constructor(data = {}) {
        this.IngredientID = data.IngredientID || null;
        this.name = data.Name || '';
        this.quantityInStock = data.QuantityInStock !== undefined ? data.QuantityInStock : 0;
        this.costPerUnit = data.CostPerUnit || 0;
        this.createdAt = data.CreatedAt || null;
        this.lastUpdatedAt = data.LastUpdatedAt || null;
    }

    /**
     * Validates the Ingredient instance
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

        // Quantity validation - must be a non-negative integer
        if (this.quantityInStock === null || this.quantityInStock === undefined) {
            errors.push('Quantity in stock is required');
        } else {
            const quantity = parseInt(this.quantityInStock);
            if (isNaN(quantity) || quantity < 0) {
                errors.push('Quantity in stock must be a non-negative integer');
            } else if (!Number.isInteger(quantity)) {
                errors.push('Quantity in stock must be an integer');
            }
        }

        // Cost per unit validation - must be a positive number with max 2 decimal places
        if (this.costPerUnit === null || this.costPerUnit === undefined || this.costPerUnit === '') {
            errors.push('Cost per unit is required');
        } else {
            const cost = parseFloat(this.costPerUnit);
            if (isNaN(cost) || cost < 0) {
                errors.push('Cost per unit must be a non-negative number');
            } else if (cost > 99999999.99) {
                errors.push('Cost per unit exceeds maximum allowed value (99999999.99)');
            } else {
                // Check for max 2 decimal places
                const decimalPlaces = (this.costPerUnit.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    errors.push('Cost per unit must have at most 2 decimal places');
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converts the Ingredient instance to a plain object for database insertion
     * @returns {Object}
     */
    toJSON() {
        return {
            IngredientID: this.IngredientID,
            Name: this.name,
            QuantityInStock: this.quantityInStock,
            CostPerUnit: this.costPerUnit,
            CreatedAt: this.createdAt,
            LastUpdatedAt: this.lastUpdatedAt
        };
    }

    /**
     * Creates an Ingredient instance from database row
     * @param {Object} row - Database row object
     * @returns {Ingredient}
     */
    static fromDB(row) {
        return new Ingredient({
            IngredientID: row.IngredientID,
            Name: row.Name,
            QuantityInStock: row.QuantityInStock,
            CostPerUnit: row.CostPerUnit,
            CreatedAt: row.CreatedAt,
            LastUpdatedAt: row.LastUpdatedAt
        });
    }

    /**
     * Validates and returns data ready for database insertion (excluding auto-generated fields)
     * @returns {Object} Returns formatted data if valid
     * @throws {Error} If validation fails
     */
    getInsertData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        return {
            Name: this.name.trim(),
            QuantityInStock: parseInt(this.quantityInStock),
            CostPerUnit: parseFloat(this.costPerUnit)
        };
    }

    /**
     * Validates and returns data ready for database update
     * @returns {Object} Returns formatted data if valid
     * @throws {Error} If validation fails
     */
    getUpdateData() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const updateData = {
            Name: this.name.trim(),
            QuantityInStock: parseInt(this.quantityInStock),
            CostPerUnit: parseFloat(this.costPerUnit)
        };

        // Only include IngredientID if it exists
        if (this.IngredientID) {
            updateData.IngredientID = this.IngredientID;
        }

        return updateData;
    }
}

import { db } from '../db/connection.js';

/**
 * Get all ingredients from the database
 * @returns {Promise<Array>} Array of all ingredients
 */
export const getAllIngredients = async () => {
    const query = `
        SELECT IngredientID, Name, QuantityInStock, CostPerUnit, CreatedAt, LastUpdatedAt
        FROM pos.Ingredient
        ORDER BY Name ASC
    `;
    const [results] = await db.query(query);
    return results.map(row => Ingredient.fromDB(row).toJSON());
};

/**
 * Get a single ingredient by ID
 * @param {number} ingredientId - The ingredient ID
 * @returns {Promise<Object|null>} Ingredient object or null if not found
 */
export const getIngredientById = async (ingredientId) => {
    const query = `
        SELECT IngredientID, Name, QuantityInStock, CostPerUnit, CreatedAt, LastUpdatedAt
        FROM pos.Ingredient
        WHERE IngredientID = ?
    `;
    const [results] = await db.query(query, [ingredientId]);
    
    if (results.length === 0) {
        return null;
    }
    
    return Ingredient.fromDB(results[0]).toJSON();
};

/**
 * Get ingredients by multiple IDs
 * @param {Array<number>} ingredientIds - Array of ingredient IDs
 * @returns {Promise<Array>} Array of ingredients
 */
export const getIngredientsByIds = async (ingredientIds) => {
    if (!ingredientIds || ingredientIds.length === 0) {
        return [];
    }

    const placeholders = ingredientIds.map(() => '?').join(',');
    const query = `
        SELECT IngredientID, Name, QuantityInStock, CostPerUnit, CreatedAt, LastUpdatedAt
        FROM pos.Ingredient
        WHERE IngredientID IN (${placeholders})
        ORDER BY Name ASC
    `;
    
    const [results] = await db.query(query, ingredientIds);
    return results.map(row => Ingredient.fromDB(row).toJSON());
};

/**
 * Get ingredients with low stock (quantity <= threshold)
 * @param {number} threshold - Stock threshold (default: 10)
 * @returns {Promise<Array>} Array of low stock ingredients
 */
export const getLowStockIngredients = async (threshold = 10) => {
    const query = `
        SELECT IngredientID, Name, QuantityInStock, CostPerUnit, CreatedAt, LastUpdatedAt
        FROM pos.Ingredient
        WHERE QuantityInStock <= ?
        ORDER BY QuantityInStock ASC, Name ASC
    `;
    const [results] = await db.query(query, [threshold]);
    return results.map(row => Ingredient.fromDB(row).toJSON());
};

/**
 * Create a new ingredient
 * @param {Object} ingredientData - Ingredient data
 * @returns {Promise<Object>} Created ingredient with ID
 */
export const createIngredient = async (ingredientData) => {
    const ingredient = new Ingredient(ingredientData);
    const insertData = ingredient.getInsertData();
    
    const query = `
        INSERT INTO pos.Ingredient (Name, QuantityInStock, CostPerUnit)
        VALUES (?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
        insertData.Name,
        insertData.QuantityInStock,
        insertData.CostPerUnit
    ]);
    
    // Return the created ingredient with its new ID
    return await getIngredientById(result.insertId);
};

/**
 * Update an existing ingredient
 * @param {number} ingredientId - The ingredient ID to update
 * @param {Object} ingredientData - Updated ingredient data
 * @returns {Promise<Object>} Updated ingredient
 */
export const updateIngredient = async (ingredientId, ingredientData) => {
    // Merge with ID to ensure validation works
    const ingredient = new Ingredient({ ...ingredientData, IngredientID: ingredientId });
    console.log('Update Data:', ingredient);
    const updateData = ingredient.getUpdateData();
    

    const query = `
        UPDATE pos.Ingredient
        SET Name = ?, QuantityInStock = ?, CostPerUnit = ?
        WHERE IngredientID = ?
    `;
    
    await db.query(query, [
        updateData.Name,
        updateData.QuantityInStock,
        updateData.CostPerUnit,
        ingredientId
    ]);
    
    // Return the updated ingredient
    return await getIngredientById(ingredientId);
};

/**
 * Update ingredient stock quantity
 * @param {number} ingredientId - The ingredient ID
 * @param {number} quantityChange - Amount to add (positive) or subtract (negative)
 * @returns {Promise<Object>} Updated ingredient
 */
export const updateIngredientStock = async (ingredientId, quantityChange) => {
    const query = `
        UPDATE pos.Ingredient
        SET QuantityInStock = QuantityInStock + ?
        WHERE IngredientID = ?
    `;
    
    await db.query(query, [quantityChange, ingredientId]);
    
    // Return the updated ingredient
    return await getIngredientById(ingredientId);
};

/**
 * Delete an ingredient
 * @param {number} ingredientId - The ingredient ID to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteIngredient = async (ingredientId) => {
    const query = `
        DELETE FROM pos.Ingredient
        WHERE IngredientID = ?
    `;
    
    const [result] = await db.query(query, [ingredientId]);
    return result.affectedRows > 0;
};

/**
 * Search ingredients by name
 * @param {string} searchTerm - Search term for ingredient name
 * @returns {Promise<Array>} Array of matching ingredients
 */
export const searchIngredientsByName = async (searchTerm) => {
    const query = `
        SELECT IngredientID, Name, QuantityInStock, CostPerUnit, CreatedAt, LastUpdatedAt
        FROM pos.Ingredient
        WHERE Name LIKE ?
        ORDER BY Name ASC
    `;
    
    const [results] = await db.query(query, [`%${searchTerm}%`]);
    return results.map(row => Ingredient.fromDB(row).toJSON());
};

export default Ingredient;
