export interface IngredientData {
    name: string;
    category: 'produce' | 'dairy' | 'meat' | 'pantry' | 'frozen' | 'other';
    shelfLife: number; // days
    commonUnit: string;
    packageSize?: number; // typical package size in the common unit
}

// Database of common ingredients with shelf life information
export const INGREDIENT_DATABASE: IngredientData[] = [
    // Produce - Short shelf life
    { name: 'lettuce', category: 'produce', shelfLife: 7, commonUnit: 'whole' },
    { name: 'salad leaves', category: 'produce', shelfLife: 7, commonUnit: 'bag' },
    { name: 'spinach', category: 'produce', shelfLife: 7, commonUnit: 'bunch' },
    { name: 'arugula', category: 'produce', shelfLife: 5, commonUnit: 'bunch' },
    { name: 'tomato', category: 'produce', shelfLife: 7, commonUnit: 'whole' },
    { name: 'cucumber', category: 'produce', shelfLife: 7, commonUnit: 'whole' },
    { name: 'bell pepper', category: 'produce', shelfLife: 10, commonUnit: 'whole' },
    { name: 'mushrooms', category: 'produce', shelfLife: 7, commonUnit: 'g', packageSize: 250 },
    { name: 'avocado', category: 'produce', shelfLife: 5, commonUnit: 'whole' },
    { name: 'banana', category: 'produce', shelfLife: 5, commonUnit: 'whole' },
    { name: 'berries', category: 'produce', shelfLife: 5, commonUnit: 'g', packageSize: 250 },
    { name: 'strawberries', category: 'produce', shelfLife: 5, commonUnit: 'g', packageSize: 250 },
    { name: 'blueberries', category: 'produce', shelfLife: 7, commonUnit: 'g', packageSize: 125 },
    { name: 'grapes', category: 'produce', shelfLife: 7, commonUnit: 'g', packageSize: 500 },
    { name: 'herbs', category: 'produce', shelfLife: 7, commonUnit: 'bunch' },
    { name: 'basil', category: 'produce', shelfLife: 7, commonUnit: 'bunch' },
    { name: 'parsley', category: 'produce', shelfLife: 7, commonUnit: 'bunch' },
    { name: 'cilantro', category: 'produce', shelfLife: 7, commonUnit: 'bunch' },

    // Produce - Medium shelf life
    { name: 'carrot', category: 'produce', shelfLife: 14, commonUnit: 'whole' },
    { name: 'celery', category: 'produce', shelfLife: 14, commonUnit: 'bunch' },
    { name: 'broccoli', category: 'produce', shelfLife: 10, commonUnit: 'whole' },
    { name: 'cauliflower', category: 'produce', shelfLife: 10, commonUnit: 'whole' },
    { name: 'cabbage', category: 'produce', shelfLife: 21, commonUnit: 'whole' },
    { name: 'apple', category: 'produce', shelfLife: 21, commonUnit: 'whole' },
    { name: 'orange', category: 'produce', shelfLife: 14, commonUnit: 'whole' },
    { name: 'lemon', category: 'produce', shelfLife: 21, commonUnit: 'whole' },
    { name: 'lime', category: 'produce', shelfLife: 21, commonUnit: 'whole' },

    // Produce - Long shelf life
    { name: 'onion', category: 'produce', shelfLife: 30, commonUnit: 'whole' },
    { name: 'garlic', category: 'produce', shelfLife: 30, commonUnit: 'clove' },
    { name: 'potato', category: 'produce', shelfLife: 30, commonUnit: 'whole' },
    { name: 'sweet potato', category: 'produce', shelfLife: 21, commonUnit: 'whole' },
    { name: 'ginger', category: 'produce', shelfLife: 21, commonUnit: 'g', packageSize: 100 },

    // Dairy
    { name: 'milk', category: 'dairy', shelfLife: 7, commonUnit: 'ml', packageSize: 1000 },
    { name: 'cream', category: 'dairy', shelfLife: 7, commonUnit: 'ml', packageSize: 300 },
    { name: 'yogurt', category: 'dairy', shelfLife: 14, commonUnit: 'g', packageSize: 500 },
    { name: 'cheese', category: 'dairy', shelfLife: 21, commonUnit: 'g', packageSize: 200 },
    { name: 'parmesan', category: 'dairy', shelfLife: 30, commonUnit: 'g', packageSize: 100 },
    { name: 'mozzarella', category: 'dairy', shelfLife: 14, commonUnit: 'g', packageSize: 250 },
    { name: 'cheddar', category: 'dairy', shelfLife: 21, commonUnit: 'g', packageSize: 200 },
    { name: 'butter', category: 'dairy', shelfLife: 30, commonUnit: 'g', packageSize: 250 },
    { name: 'eggs', category: 'dairy', shelfLife: 21, commonUnit: 'whole', packageSize: 12 },

    // Meat & Seafood
    { name: 'chicken', category: 'meat', shelfLife: 2, commonUnit: 'g', packageSize: 500 },
    { name: 'beef', category: 'meat', shelfLife: 3, commonUnit: 'g', packageSize: 500 },
    { name: 'pork', category: 'meat', shelfLife: 3, commonUnit: 'g', packageSize: 500 },
    { name: 'fish', category: 'meat', shelfLife: 2, commonUnit: 'g', packageSize: 400 },
    { name: 'salmon', category: 'meat', shelfLife: 2, commonUnit: 'g', packageSize: 400 },
    { name: 'shrimp', category: 'meat', shelfLife: 2, commonUnit: 'g', packageSize: 300 },
    { name: 'bacon', category: 'meat', shelfLife: 7, commonUnit: 'g', packageSize: 200 },
    { name: 'sausage', category: 'meat', shelfLife: 7, commonUnit: 'g', packageSize: 400 },

    // Pantry - Very long shelf life
    { name: 'rice', category: 'pantry', shelfLife: 365, commonUnit: 'g', packageSize: 1000 },
    { name: 'pasta', category: 'pantry', shelfLife: 365, commonUnit: 'g', packageSize: 500 },
    { name: 'flour', category: 'pantry', shelfLife: 180, commonUnit: 'g', packageSize: 1000 },
    { name: 'sugar', category: 'pantry', shelfLife: 365, commonUnit: 'g', packageSize: 1000 },
    { name: 'salt', category: 'pantry', shelfLife: 365, commonUnit: 'g', packageSize: 500 },
    { name: 'olive oil', category: 'pantry', shelfLife: 180, commonUnit: 'ml', packageSize: 500 },
    { name: 'vegetable oil', category: 'pantry', shelfLife: 180, commonUnit: 'ml', packageSize: 1000 },
    { name: 'soy sauce', category: 'pantry', shelfLife: 365, commonUnit: 'ml', packageSize: 250 },
    { name: 'vinegar', category: 'pantry', shelfLife: 365, commonUnit: 'ml', packageSize: 500 },
    { name: 'canned tomatoes', category: 'pantry', shelfLife: 365, commonUnit: 'can', packageSize: 400 },
    { name: 'beans', category: 'pantry', shelfLife: 365, commonUnit: 'can', packageSize: 400 },
    { name: 'lentils', category: 'pantry', shelfLife: 365, commonUnit: 'g', packageSize: 500 },
    { name: 'chickpeas', category: 'pantry', shelfLife: 365, commonUnit: 'can', packageSize: 400 },
    { name: 'bread', category: 'pantry', shelfLife: 5, commonUnit: 'slice', packageSize: 20 },
    { name: 'tortilla', category: 'pantry', shelfLife: 14, commonUnit: 'pc', packageSize: 8 },

    // Frozen
    { name: 'frozen vegetables', category: 'frozen', shelfLife: 90, commonUnit: 'g', packageSize: 500 },
    { name: 'frozen peas', category: 'frozen', shelfLife: 90, commonUnit: 'g', packageSize: 500 },
    { name: 'frozen corn', category: 'frozen', shelfLife: 90, commonUnit: 'g', packageSize: 500 },
    { name: 'ice cream', category: 'frozen', shelfLife: 60, commonUnit: 'ml', packageSize: 500 },
];

// Helper function to get ingredient data by name
export function getIngredientData(name: string): IngredientData | undefined {
    return INGREDIENT_DATABASE.find(
        item => item.name.toLowerCase() === name.toLowerCase()
    );
}

// Helper function to get shelf life for an ingredient
export function getShelfLife(name: string): number {
    const data = getIngredientData(name);
    return data?.shelfLife ?? 7; // default to 7 days if not found
}

// Helper function to get category for an ingredient
export function getCategory(name: string): string {
    const data = getIngredientData(name);
    return data?.category ?? 'other';
}

// Get all ingredient names for autocomplete
export function getAllIngredientNames(): string[] {
    return INGREDIENT_DATABASE.map(item => item.name).sort();
}
