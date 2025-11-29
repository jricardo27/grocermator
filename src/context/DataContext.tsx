import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Recipe, MealPlan, AppData } from '../types';

interface DataContextType {
    recipes: Recipe[];
    mealPlans: MealPlan[];
    addRecipe: (recipe: Recipe) => void;
    updateRecipe: (recipe: Recipe) => void;
    deleteRecipe: (id: string) => void;
    addMealPlan: (mealPlan: MealPlan) => void;
    deleteMealPlan: (id: string) => void;
    exportData: () => void;
    importData: (file: File) => Promise<void>;
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

    // Save to local storage whenever data changes
    useEffect(() => {
        const data: AppData = { recipes, mealPlans };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [recipes, mealPlans]);

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

    const deleteMealPlan = (id: string) => {
        setMealPlans(prev => prev.filter(p => p.id !== id));
    };

    const exportData = () => {
        const data: AppData = { recipes, mealPlans };
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
            recipes, mealPlans,
            addRecipe, updateRecipe, deleteRecipe,
            addMealPlan, deleteMealPlan,
            exportData, importData
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
