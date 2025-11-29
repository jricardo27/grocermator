import type { Recipe, Ingredient, MealPlan } from '../types';
import { getShelfLife } from '../data/ingredientDatabase';
import { isRecipeInSeason } from './seasonal';

export interface PlannerOptions {
    days: number;
    startDate?: Date;
    optimizeWaste?: boolean;
    allowRepeats?: boolean;
    seasonalOnly?: boolean;
    recentRecipes?: string[]; // IDs of recipes to avoid
}

export function generateMealPlan(recipes: Recipe[], options: PlannerOptions | number): MealPlan {
    // Handle legacy call signature (recipes, days)
    const opts: PlannerOptions = typeof options === 'number' ? { days: options } : options;

    const {
        days,
        startDate = new Date(),
        optimizeWaste = false,
        allowRepeats = false,
        seasonalOnly = false,
        recentRecipes = []
    } = opts;

    let availableRecipes = [...recipes];

    // Filter seasonal recipes if requested
    if (seasonalOnly) {
        availableRecipes = availableRecipes.filter(r => isRecipeInSeason(r, startDate));
    }

    // Filter out recent recipes if we have enough alternatives
    if (availableRecipes.length > days + recentRecipes.length) {
        availableRecipes = availableRecipes.filter(r => !recentRecipes.includes(r.id));
    }

    let selectedRecipes: Recipe[] = [];

    if (availableRecipes.length === 0) {
        return createEmptyPlan(days, startDate);
    }

    if (optimizeWaste) {
        selectedRecipes = generateOptimizedSelection(availableRecipes, days, allowRepeats);
    } else {
        selectedRecipes = generateRandomSelection(availableRecipes, days, allowRepeats);
    }

    return {
        id: crypto.randomUUID(),
        recipes: selectedRecipes,
        days,
        createdAt: new Date().toISOString(),
        startDate: startDate.toISOString(),
    };
}

function createEmptyPlan(days: number, startDate: Date): MealPlan {
    return {
        id: crypto.randomUUID(),
        recipes: [],
        days,
        createdAt: new Date().toISOString(),
        startDate: startDate.toISOString(),
    };
}

function generateRandomSelection(recipes: Recipe[], days: number, allowRepeats: boolean): Recipe[] {
    const selected: Recipe[] = [];
    let pool = [...recipes];

    for (let i = 0; i < days; i++) {
        if (pool.length === 0) {
            if (allowRepeats) {
                pool = [...recipes]; // Reset pool if repeats allowed
            } else {
                break; // Stop if no repeats and pool empty
            }
        }

        const randomIndex = Math.floor(Math.random() * pool.length);
        const recipe = pool[randomIndex];
        selected.push(recipe);

        if (!allowRepeats) {
            pool.splice(randomIndex, 1);
        }
    }

    return selected;
}

function generateOptimizedSelection(recipes: Recipe[], days: number, allowRepeats: boolean): Recipe[] {
    // 1. Score recipes based on perishability of ingredients
    // 2. Try to chain recipes that share ingredients

    const scoredRecipes = recipes.map(recipe => {
        const perishabilityScore = calculatePerishabilityScore(recipe);
        return { recipe, score: perishabilityScore, used: false };
    });

    // Sort by perishability (more perishable first)
    scoredRecipes.sort((a, b) => a.score - b.score);

    const selected: Recipe[] = [];
    const currentIngredients = new Set<string>();

    for (let i = 0; i < days; i++) {
        // Find best candidate for next slot
        // Criteria:
        // 1. Not used (unless repeats allowed)
        // 2. Shares ingredients with current list (to minimize waste)
        // 3. High perishability (use early)

        let bestCandidateIndex = -1;
        let bestCandidateScore = -Infinity;

        for (let j = 0; j < scoredRecipes.length; j++) {
            const candidate = scoredRecipes[j];

            if (candidate.used && !allowRepeats) continue;

            let score = 0;

            // Factor 1: Perishability (already sorted, but add weight)
            // Earlier slots prefer higher perishability
            const perishabilityFactor = (days - i) / days;
            score += (100 - candidate.score) * perishabilityFactor;

            // Factor 2: Ingredient overlap
            const overlap = calculateOverlap(candidate.recipe, currentIngredients);
            score += overlap * 20; // Weight overlap heavily

            if (score > bestCandidateScore) {
                bestCandidateScore = score;
                bestCandidateIndex = j;
            }
        }

        if (bestCandidateIndex !== -1) {
            const chosen = scoredRecipes[bestCandidateIndex];
            selected.push(chosen.recipe);
            chosen.used = true;

            // Add ingredients to current set for next iteration's overlap check
            chosen.recipe.ingredients.forEach(ing => {
                currentIngredients.add(ing.name.toLowerCase());
            });
        } else {
            // Fallback if we run out of candidates (shouldn't happen if logic is correct/repeats allowed)
            break;
        }
    }

    return selected;
}

function calculatePerishabilityScore(recipe: Recipe): number {
    if (recipe.ingredients.length === 0) return 100; // No ingredients = shelf stable

    let minShelfLife = Infinity;

    recipe.ingredients.forEach(ing => {
        const life = getShelfLife(ing.name);
        if (life < minShelfLife) minShelfLife = life;
    });

    return minShelfLife;
}

function calculateOverlap(recipe: Recipe, currentIngredients: Set<string>): number {
    let overlap = 0;
    recipe.ingredients.forEach(ing => {
        if (currentIngredients.has(ing.name.toLowerCase())) {
            overlap++;
        }
    });
    return overlap;
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
