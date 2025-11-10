export interface Ingredient {
  IngredientID?: number;
  Name: string;
  CostPerUnit: string | number;
  QuantityInStock: number;
  CreatedAt?: string;
  LastUpdatedAt?: string;
}
