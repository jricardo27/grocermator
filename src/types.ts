export interface IngredientEntity {
  id: string;
  name: string;
  category: string; // 'produce', 'dairy', 'pantry', etc.
  shelfLife: number; // days
  packageSize: number; // standard quantity per package
  unit: string; // unit for the package size
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  ingredientId?: string; // Link to the entity
  shelfLife?: number;
  packageSize?: number;
}

export interface SeasonalInfo {
  type: 'season' | 'months';
  seasons?: ('spring' | 'summer' | 'fall' | 'winter')[];
  includeMonths?: number[]; // 1-12
  excludeMonths?: number[]; // 1-12
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  servings: number; // default: 2
  instructions?: string;
  imageUrl?: string;
  seasonal?: SeasonalInfo;
}

export interface MealPlan {
  id: string;
  recipes: Recipe[];
  days: number;
  createdAt: string; // ISO date string
  startDate?: string; // ISO date for when plan starts
  isFavorite?: boolean;
}

export interface AppData {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  ingredients?: IngredientEntity[]; // New field for central ingredient database
}

// Standard units for dropdowns
export const STANDARD_UNITS = [
  // Volume
  'tsp', 'tbsp', 'cup', 'ml', 'l', 'fl oz',
  // Weight
  'g', 'kg', 'oz', 'lb',
  // Count
  'pc', 'whole', 'clove', 'slice',
  // Other
  'bunch', 'can', 'package', 'box', 'bag'
] as const;

export type StandardUnit = typeof STANDARD_UNITS[number];
