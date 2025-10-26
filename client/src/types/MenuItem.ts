export interface MenuItem {
    MenuItemID: number;
    Name: string;
    Description: string;
    Price: string;
    ImageURL: string;
    Category: 'appetizer' | 'entree' | 'dessert' | 'beverage';
    Availability: number; // 0 or 1 (boolean from database)
}

export type MenuItemCategory = 'appetizer' | 'entree' | 'dessert' | 'beverage';
