import type { Recipe, Ingredient, MealPlan } from '../types';

export function generateMealPlan(recipes: Recipe[], days: number): MealPlan {
    const selectedRecipes: Recipe[] = [];

    if (recipes.length === 0) {
        return {
            id: crypto.randomUUID(),
            recipes: [],
            days,
            createdAt: new Date().toISOString(),
        };
    }

    // Simple random selection for now
    const pool = [...recipes];
    for (let i = 0; i < days; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        selectedRecipes.push(pool[randomIndex]);
    }

    return {
        id: crypto.randomUUID(),
        recipes: selectedRecipes,
        days,
        createdAt: new Date().toISOString(),
    };
}

export function calculateShoppingList(mealPlan: MealPlan): Ingredient[] {
    return calculateShoppingListV2(mealPlan);
}

export function calculateShoppingListV2(mealPlan: MealPlan): Ingredient[] {
    const map = new Map<string, Ingredient>();

    mealPlan.recipes.forEach((recipe) => {
        recipe.ingredients.forEach((ing) => {
            const key = `${ing.name.trim().toLowerCase()}|${ing.unit.trim().toLowerCase()}`;
            const existing = map.get(key);

            if (existing) {
                existing.quantity += ing.quantity;
            } else {
                map.set(key, { ...ing, name: ing.name.trim(), unit: ing.unit.trim() });
            }
        });
    });

    return Array.from(map.values());
}
