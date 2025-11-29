import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Recipe, MealPlan, AppData, IngredientEntity } from '../types';
import { INGREDIENT_DATABASE } from '../data/ingredientDatabase';

interface DataContextType {
    recipes: Recipe[];
    mealPlans: MealPlan[];
    ingredients: IngredientEntity[];
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (recipe: Recipe) => void;
    deleteRecipe: (id: string) => void;
    addMealPlan: (mealPlan: MealPlan) => void;
    updateMealPlan: (mealPlan: MealPlan) => void;
    deleteMealPlan: (id: string) => void;
    addIngredient: (ingredient: IngredientEntity) => void;
    updateIngredient: (ingredient: IngredientEntity) => void;
    deleteIngredient: (id: string) => void;
    exportData: () => void;
    importData: (file: File) => Promise<void>;
    togglePlanFavorite: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'grocermator-data';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [recipes, setRecipes] = useState<Recipe[]>(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: AppData = JSON.parse(stored);
                return parsed.recipes || [];
            } catch (e) {
                console.error("Failed to parse local storage data", e);
            }
        }
        return [];
    });

    const [mealPlans, setMealPlans] = useState<MealPlan[]>(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: AppData = JSON.parse(stored);
                return parsed.mealPlans || [];
            } catch (e) {
                console.error("Failed to parse local storage data", e);
            }
        }
        return [];
    });

    const [ingredients, setIngredients] = useState<IngredientEntity[]>(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: AppData = JSON.parse(stored);
                if (parsed.ingredients && parsed.ingredients.length > 0) {
                    return parsed.ingredients;
                }
            } catch (e) {
                console.error("Failed to parse local storage data", e);
            }
        }
        // Initialize with default database if empty
        return INGREDIENT_DATABASE.map(ing => ({
            id: crypto.randomUUID(),
            name: ing.name,
            category: ing.category,
            shelfLife: ing.shelfLife,
            packageSize: ing.packageSize || 1,
            unit: ing.commonUnit
        }));
    });

    // Save to local storage whenever data changes
    useEffect(() => {
        const data: AppData = { recipes, mealPlans, ingredients };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [recipes, mealPlans, ingredients]);

    const addRecipe = (recipe: Recipe) => {
        setRecipes(prev => [...prev, recipe]);
    };

    const updateRecipe = (updated: Recipe) => {
        setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
    };

    const deleteRecipe = (id: string) => {
        setRecipes(prev => prev.filter(r => r.id !== id));
    };

    const addMealPlan = (plan: MealPlan) => {
        setMealPlans(prev => [plan, ...prev]);
    };

    const updateMealPlan = (updated: MealPlan) => {
        setMealPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const deleteMealPlan = (id: string) => {
        setMealPlans(prev => prev.filter(p => p.id !== id));
    };

    const togglePlanFavorite = (id: string) => {
        setMealPlans(prev => prev.map(p =>
            p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
        ));
    };

    const addIngredient = (ingredient: IngredientEntity) => {
        setIngredients(prev => [...prev, ingredient]);
    };

    const updateIngredient = (updated: IngredientEntity) => {
        setIngredients(prev => prev.map(i => i.id === updated.id ? updated : i));
    };

    const deleteIngredient = (id: string) => {
        setIngredients(prev => prev.filter(i => i.id !== id));
    };

    const exportData = () => {
        const data: AppData = { recipes, mealPlans, ingredients };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grocermator-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const parsed: AppData = JSON.parse(text);
                    if (Array.isArray(parsed.recipes) && Array.isArray(parsed.mealPlans)) {
                        setRecipes(parsed.recipes);
                        setMealPlans(parsed.mealPlans);
                        if (parsed.ingredients) {
                            setIngredients(parsed.ingredients);
                        }
                        resolve();
                    } else {
                        reject(new Error("Invalid data format"));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    return (
        <DataContext.Provider value={{
            recipes, mealPlans, ingredients,
            addRecipe, updateRecipe, deleteRecipe,
            addMealPlan, updateMealPlan, deleteMealPlan,
            addIngredient, updateIngredient, deleteIngredient,
            exportData, importData, togglePlanFavorite
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
