import { db } from '../db/connection.js';

/**
 * Reads ingredient catalog entries for inventory selection.
 * @returns {Promise<Array<{id:number,name:string,cost:number}>>}
 */
export async function fetchIngredients() {
  const [rows] = await db.query(`
    SELECT
      IngredientID AS id,
      Name AS name,
      CostPerUnit AS costPerUnit
    FROM Ingredient
    ORDER BY Name ASC
  `);

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    cost: Number(row.costPerUnit ?? 0)
  }));
}

/**
 * Fetches menu items from the persistent menu_item table.
 * @returns {Promise<Array>} Menu items formatted for the frontend.
 */
export async function fetchMenuItems() {
  const [rows] = await db.query(`
    SELECT
      MenuItemID AS id,
      Name AS name,
      Description AS description,
      Price AS price,
      Category AS category,
      Availability AS availability
    FROM Menu_Item
    ORDER BY MenuItemID DESC
  `);

  return rows.map(row => ({
    ...row,
    availability: Boolean(row.availability)
  }));
}

/**
 * Inserts a new menu item into the menu_item table.
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.description
 * @param {number} payload.price
 * @param {string} payload.category
 * @param {boolean} payload.available
 * @returns {Promise<Object>} Newly created menu item data.
 */
export async function createMenuItem(payload) {
  const { Name, Description, Price, Category, Availability } = payload;

  console.log(payload)

  const categoryMap = {
    food: 'entree',
    entree: 'entree',
    drink: 'beverage',
    beverage: 'beverage',
    dessert: 'dessert',
  };

  const normalizedCategory =
    (Category && categoryMap[Category.toLowerCase()]) || Category || 'entree';

  const [result] = await db.execute(
    `
      INSERT INTO Menu_Item (Name, Description, Price, Category, Availability)
      VALUES (?, ?, ?, ?, ?)
    `,
    [Name, Description, Price, normalizedCategory, Availability ? 1 : 0]
  );

  return {
    id: result.insertId,
    name: Name,
    description: Description,
    price: Price,
    category: normalizedCategory,
    availability: Boolean(Availability),
  };
}

/**
 * Returns all utility payments stored in the database.
 * @returns {Promise<Array>}
 */
export async function fetchUtilityPayments() {
  const [rows] = await db.query(`
    SELECT
      PaymentID AS id,
      PaymentID AS paymentId,
      UtilityType AS type,
      Amount AS amount,
      LocationName AS locationName,
      DATE_FORMAT(PaymentDate, '%Y-%m-%d') AS date,
      CreatedAt AS createdAt
    FROM Utility_Payment
    ORDER BY PaymentDate DESC, PaymentID DESC
  `);

  return rows;
}

/**
 * Saves a utility payment captured from the management UI.
 * @param {Object} payload
 * @param {string} payload.paymentId
 * @param {string} payload.type
 * @param {number} payload.amount
 * @param {string} payload.date - ISO (YYYY-MM-DD) date string.
 * @param {string} payload.locationName
 * @returns {Promise<Object>}
 */
export async function createUtilityPayment(payload) {
  const paymentCode = payload.paymentId || `P-${Date.now()}`;
  const type = (payload.type || 'other').toLowerCase();
  const utilityTypeOptions = new Set([
    'water',
    'electricity',
    'gas',
    'internet',
    'phone',
    'other',
  ]);
  const utilityType = utilityTypeOptions.has(type) ? type : 'other';
  const amount = Number(payload.amount ?? 0);
  const date = payload.date
    ? new Date(payload.date).toISOString().slice(0, 19).replace('T', ' ')
    : new Date().toISOString().slice(0, 19).replace('T', ' ');
  const locationName = payload.locationName || null;

  const [result] = await db.execute(
    `
      INSERT INTO Utility_Payment (LocationName, PaymentDate, Amount, UtilityType)
      VALUES (?, ?, ?, ?)
    `,
    [locationName, date, amount, utilityType]
  );

  return {
    id: result.insertId,
    paymentId: paymentCode,
    type: utilityType,
    amount,
    date,
    locationName,
  };
}

/**
 * Fetches inventory orders for display on the management tab.
 * @returns {Promise<Array>}
 */
export async function fetchInventoryOrders() {
  const [rows] = await db.query(`
    SELECT
      s.ShipmentID AS id,
      s.Status AS status,
      s.Cost AS costPerUnit,
      s.QuantityReceived AS quantity,
      DATE_FORMAT(s.ShipmentDate, '%Y-%m-%d') AS receivedDate,
      s.IngredientID AS ingredientId,
      i.Name AS ingredientName
    FROM Inventory_Shipment s
    LEFT JOIN Ingredient i ON s.IngredientID = i.IngredientID
    ORDER BY s.ShipmentDate DESC, s.ShipmentID DESC
  `);

  return rows.map(row => ({
    id: row.id,
    status: row.status,
    ingredientItem:
      row.ingredientName ||
      (row.ingredientId ? `Ingredient #${row.ingredientId}` : 'Unknown'),
    costPerUnit: row.costPerUnit ?? 0,
    quantity: row.quantity ?? 0,
    receivedDate: row.receivedDate,
  }));
}

/**
 * Persists an inventory order coming from the UI.
 * @param {Object} payload
 * @param {string} payload.status
 * @param {string} payload.ingredientItem
 * @param {number} payload.costPerUnit
 * @param {number} payload.quantity
 * @param {string} payload.receivedDate - ISO (YYYY-MM-DD) date string.
 * @returns {Promise<Object>}
 */
export async function createInventoryOrder(payload) {
  const { status, ingredientItem, costPerUnit, quantity, receivedDate } = payload;

  let ingredientId = null;
  if (ingredientItem) {
    const [ingredientRows] = await db.execute(
      'SELECT IngredientID FROM Ingredient WHERE Name = ? LIMIT 1',
      [ingredientItem]
    );
    if (Array.isArray(ingredientRows) && ingredientRows.length > 0) {
      ingredientId = ingredientRows[0]?.IngredientID ?? null;
    }
  }

  const normalizedStatus = ['pending', 'received', 'cancelled'].includes(status ?? '')
    ? status
    : 'pending';

  const shipmentDate = receivedDate
    ? new Date(receivedDate).toISOString().slice(0, 19).replace('T', ' ')
    : null;

  const [result] = await db.execute(
    `
      INSERT INTO Inventory_Shipment
        (Status, IngredientID, Cost, QuantityReceived, ShipmentDate)
      VALUES (?, ?, ?, ?, ?)
    `,
    [normalizedStatus, ingredientId, Number(costPerUnit ?? 0), Number(quantity ?? 0), shipmentDate]
  );

  return {
    id: result.insertId,
    status: normalizedStatus,
    ingredientItem,
    costPerUnit: Number(costPerUnit ?? 0),
    quantity: Number(quantity ?? 0),
    receivedDate: receivedDate || null,
  };
}
