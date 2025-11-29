export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

export interface MealPlan {
  id: string;
  recipes: Recipe[];
  days: number;
  createdAt: string; // ISO date string
}

export interface AppData {
  recipes: Recipe[];
  mealPlans: MealPlan[];
}
