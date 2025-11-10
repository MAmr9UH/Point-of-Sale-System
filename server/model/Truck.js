import { db } from '../db/connection.js';

export const editPage = async (form) => {

    try {
        // Build dynamic UPDATE query with only the fields that are provided
        const updates = [];
        const values = [];

        if (form.FoodTruckName !== undefined) {
            updates.push('FoodTruckName = ?');
            values.push(form.FoodTruckName);
        }
        
        if (form.BackgroundURL !== undefined) {
            updates.push('BackgroundURL = ?');
            values.push(form.BackgroundURL);
        }
        
        if (form.Tagline !== undefined) {
            updates.push('Tagline = ?');
            values.push(form.Tagline);
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE pos.truck
            SET ${updates.join(', ')}
            WHERE managerid = 2
        `;

        await db.execute(query, values);
        console.log('Edit page updated successfully');
    } catch (error) {
        console.error('Error updating edit page:', error);
        throw error;
    }

}