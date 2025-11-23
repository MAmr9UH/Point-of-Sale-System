-- =====================================================
-- Inventory Management Triggers
-- =====================================================
-- These triggers handle automatic inventory subtraction when orders are placed
-- 
-- Logic:
-- 1. When an Order_Item is inserted, subtract ingredients based on:
--    - Non-substitutable ingredients (IsRemovable=0, IsRequired=1): Subtract QuantityRequired
--    - Substitutable ingredients: Only subtract the default ingredient (IsDefault=1) for each CustomizableCategory
-- 
-- 2. When OrderItemCustomization is inserted, apply the customization delta:
--    - QuantityDelta is multiplied by the Order_Item.Quantity
--    - Positive delta: Adding extra ingredients (e.g., +1 for extra cheese)
--    - Negative delta: Removing/substituting ingredients (e.g., -1 for no beef)
-- =====================================================

USE pos;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS subtract_ingredients_after_order;
DROP TRIGGER IF EXISTS apply_customization_inventory;

DELIMITER //

-- =====================================================
-- Trigger 1: Subtract base ingredients when Order_Item is created
-- =====================================================
CREATE TRIGGER subtract_ingredients_after_order 
AFTER INSERT ON Order_Item 
FOR EACH ROW
BEGIN
    -- Subtract ingredients based on menu item recipe
    -- For non-substitutable ingredients (IsRemovable=0 AND IsRequired=1): subtract QuantityRequired
    -- For substitutable ingredients: only subtract the default ingredient (IsDefault=1) per category
    UPDATE Ingredient AS i
    JOIN Used_For AS uf ON i.IngredientID = uf.IngredientID
    SET i.QuantityInStock = i.QuantityInStock - (uf.QuantityRequired * NEW.Quantity)
    WHERE uf.MenuItemID = NEW.MenuItemID
      AND (
          -- Non-substitutable required ingredients (always subtract)
          (uf.IsRequired = TRUE)
          OR
          -- Substitutable ingredients (only subtract the default for each category)
          (uf.IsDefault = TRUE AND uf.CustomizableCategory IS NOT NULL)
      );
END//

-- =====================================================
-- Trigger 2: Apply customization inventory changes
-- =====================================================
CREATE TRIGGER apply_customization_inventory 
AFTER INSERT ON OrderItemCustomization 
FOR EACH ROW
BEGIN
    DECLARE item_quantity INT;
    
    -- Get the quantity of the order item
    SELECT Quantity INTO item_quantity
    FROM Order_Item
    WHERE OrderItemID = NEW.OrderItemID;
    
    -- Apply the inventory change based on customization
    -- QuantityDelta represents the per-item change:
    --   Positive: adding extra ingredients (e.g., +1 for extra cheese)
    --   Negative: removing ingredients (e.g., -1 for removing beef when substituting)
    -- 
    -- The actual inventory change is: QuantityDelta * OrderItem.Quantity
    -- 
    -- Examples:
    --   - Customer orders 2 burgers with extra cheese (+1): subtract 1 * 2 = 2 extra cheese
    --   - Customer substitutes beef with vegan patty: 
    --       * Remove beef: QuantityDelta = -1, subtract -1 * 2 = add back 2 beef
    --       * Add vegan patty: QuantityDelta = +1, subtract 1 * 2 = 2 vegan patties
    
    UPDATE Ingredient
    SET QuantityInStock = QuantityInStock - (NEW.QuantityDelta * item_quantity)
    WHERE IngredientID = NEW.IngredientID;
END//

DELIMITER ;

-- =====================================================
-- Verification Queries (for testing)
-- =====================================================
-- To verify the triggers are working correctly:
-- 
-- 1. Check ingredient stock before order:
--    SELECT Name, QuantityInStock FROM Ingredient WHERE IngredientID IN (...);
-- 
-- 2. Create an order with Order_Item
-- 
-- 3. Check ingredient stock after Order_Item insert:
--    SELECT Name, QuantityInStock FROM Ingredient WHERE IngredientID IN (...);
--    Should see: Required ingredients subtracted, only default substitutable ingredients subtracted
-- 
-- 4. Add OrderItemCustomization records
-- 
-- 5. Check ingredient stock after customization:
--    SELECT Name, QuantityInStock FROM Ingredient WHERE IngredientID IN (...);
--    Should see: Additional delta applied (customization * quantity)
-- =====================================================
