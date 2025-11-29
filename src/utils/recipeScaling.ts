import type { Recipe, Ingredient } from '../types';

/**
 * Scale a recipe from one serving size to another
 */
export function scaleRecipe(recipe: Recipe, toServings: number): Recipe {
    const scaleFactor = toServings / recipe.servings;

    return {
        ...recipe,
        servings: toServings,
        ingredients: recipe.ingredients.map(ing => ({
            ...ing,
            quantity: roundToNearestFraction(ing.quantity * scaleFactor)
        }))
    };
}

/**
 * Round to nearest common fraction for better readability
 * e.g., 0.333 -> 0.33, 0.666 -> 0.67, 0.25 -> 0.25
 */
function roundToNearestFraction(value: number): number {
    // Common fractions
    const fractions = [
        { value: 0.125, display: 0.125 }, // 1/8
        { value: 0.25, display: 0.25 },   // 1/4
        { value: 0.33, display: 0.33 },   // 1/3
        { value: 0.5, display: 0.5 },     // 1/2
        { value: 0.67, display: 0.67 },   // 2/3
        { value: 0.75, display: 0.75 },   // 3/4
    ];

    const wholePart = Math.floor(value);
    const fractionalPart = value - wholePart;

    // If very close to whole number, round to it
    if (fractionalPart < 0.05) return wholePart;
    if (fractionalPart > 0.95) return wholePart + 1;

    // Find closest fraction
    let closestFraction = fractionalPart;
    let minDiff = 1;

    for (const frac of fractions) {
        const diff = Math.abs(fractionalPart - frac.value);
        if (diff < minDiff) {
            minDiff = diff;
            closestFraction = frac.display;
        }
    }

    return wholePart + closestFraction;
}

/**
 * Scale a single ingredient
 */
export function scaleIngredient(ingredient: Ingredient, scaleFactor: number): Ingredient {
    return {
        ...ingredient,
        quantity: roundToNearestFraction(ingredient.quantity * scaleFactor)
    };
}
