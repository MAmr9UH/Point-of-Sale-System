import { db } from '../db/connection.js';

export const getThreshold = async () => {
  try {
    const [rows] = await db.query(
      'SELECT LowStockThreshold FROM globalthreshold WHERE Id = 1'
    );
    return rows[0]?.LowStockThreshold || 10;
  } catch (error) {
    console.error('Error getting threshold:', error);
    throw error;
  }
};

export const updateThreshold = async (threshold) => {
  try {
    const [result] = await db.query(
      'UPDATE globalthreshold SET LowStockThreshold = ? WHERE Id = 1',
      [threshold]
    );
    return result;
  } catch (error) {
    console.error('Error updating threshold:', error);
    throw error;
  }
};