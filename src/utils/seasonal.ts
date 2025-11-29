import type { Recipe, SeasonalInfo } from '../types';

/**
 * Check if a recipe is in season for a given date
 */
export function isRecipeInSeason(recipe: Recipe, date: Date = new Date()): boolean {
    if (!recipe.seasonal) return true; // No seasonal restriction

    const month = date.getMonth() + 1; // 1-12
    const season = getSeason(date);

    if (recipe.seasonal.type === 'season') {
        return recipe.seasonal.seasons?.includes(season) ?? true;
    }

    if (recipe.seasonal.type === 'months') {
        // Check include list
        if (recipe.seasonal.includeMonths && recipe.seasonal.includeMonths.length > 0) {
            return recipe.seasonal.includeMonths.includes(month);
        }

        // Check exclude list
        if (recipe.seasonal.excludeMonths && recipe.seasonal.excludeMonths.length > 0) {
            return !recipe.seasonal.excludeMonths.includes(month);
        }
    }

    return true;
}

/**
 * Get the season for a given date
 */
export function getSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = date.getMonth() + 1; // 1-12

    // Northern hemisphere seasons
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
}

/**
 * Filter recipes by season
 */
export function filterSeasonalRecipes(recipes: Recipe[], date: Date = new Date()): Recipe[] {
    return recipes.filter(recipe => isRecipeInSeason(recipe, date));
}

/**
 * Get seasonal badge text for a recipe
 */
export function getSeasonalBadge(seasonal?: SeasonalInfo): string | null {
    if (!seasonal) return null;

    if (seasonal.type === 'season' && seasonal.seasons) {
        return seasonal.seasons.join(', ');
    }

    if (seasonal.type === 'months') {
        if (seasonal.includeMonths && seasonal.includeMonths.length > 0) {
            return `Months: ${seasonal.includeMonths.join(', ')}`;
        }
        if (seasonal.excludeMonths && seasonal.excludeMonths.length > 0) {
            return `Except: ${seasonal.excludeMonths.join(', ')}`;
        }
    }

    return null;
}

/**
 * Get month names
 */
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Get season emoji
 */
export function getSeasonEmoji(season: 'spring' | 'summer' | 'fall' | 'winter'): string {
    const emojis = {
        spring: '🌸',
        summer: '☀️',
        fall: '🍂',
        winter: '❄️'
    };
    return emojis[season];
}
