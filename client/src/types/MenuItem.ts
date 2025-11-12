export interface MenuItem {
    MenuItemID: number;
    Name: string;
    Description: string;
    Price: string;
    ImageURL: string;
    Category: 'appetizer' | 'entree' | 'dessert' | 'beverage';
    Availability: number; // 0 or 1 (boolean from database)
    Ingredients: Ingredient[];
}

export type MenuItemCategory = 'appetizer' | 'entree' | 'dessert' | 'beverage';

export interface Ingredient {
    IngredientID: number;
    Name: string;
    PriceAdjustment: string;
    CustomizableCategory: string;
    QuantityRequired: number;
    MaximumQuantity: number;
    IsRemovable: number; // 0 or 1
    IsRequired: number; // 0 or 1
    CanSubstitute: number; // 0 or 1
};
