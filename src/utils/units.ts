import { STANDARD_UNITS, type StandardUnit } from '../types';

/**
 * Get all standard units categorized for dropdowns
 */
export function getUnitCategories() {
    return {
        Volume: ['tsp', 'tbsp', 'cup', 'ml', 'l', 'fl oz'],
        Weight: ['g', 'kg', 'oz', 'lb'],
        Count: ['pc', 'whole', 'clove', 'slice'],
        Other: ['bunch', 'can', 'package', 'box', 'bag']
    };
}

/**
 * Validate if a string matches a standard unit
 */
export function isValidUnit(unit: string): unit is StandardUnit {
    return STANDARD_UNITS.includes(unit as StandardUnit);
}

/**
 * Get suggested units based on ingredient name (simple heuristic)
 */
export function getSuggestedUnits(ingredientName: string): string[] {
    const lower = ingredientName.toLowerCase();

    if (['milk', 'water', 'oil', 'sauce', 'cream'].some(l => lower.includes(l))) {
        return ['ml', 'cup', 'tbsp', 'l'];
    }

    if (['flour', 'sugar', 'rice', 'pasta', 'meat', 'chicken', 'beef'].some(l => lower.includes(l))) {
        return ['g', 'kg', 'cup', 'lb'];
    }

    if (['onion', 'apple', 'banana', 'egg', 'carrot'].some(l => lower.includes(l))) {
        return ['whole', 'pc'];
    }

    return [];
}
