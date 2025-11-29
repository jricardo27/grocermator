import React, { useState } from 'react';
import { type Recipe, type IngredientEntity, type AppData } from '../types';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ImportPreviewProps {
    importData: AppData;
    existingRecipes: Recipe[];
    existingIngredients: IngredientEntity[];
    onConfirm: (data: AppData) => void;
    onCancel: () => void;
}

interface RecipeConflict {
    importedRecipe: Recipe;
    existingRecipe?: Recipe;
    action: 'add' | 'skip' | 'replace';
}

interface IngredientMapping {
    importedIngredient: IngredientEntity;
    existingMatch?: IngredientEntity;
    action: 'create' | 'map' | 'skip';
    mapToId?: string;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({
    importData,
    existingRecipes,
    existingIngredients,
    onConfirm,
    onCancel
}) => {
    // Detect recipe conflicts
    const detectRecipeConflicts = (): RecipeConflict[] => {
        return importData.recipes.map(importedRecipe => {
            const existing = existingRecipes.find(r =>
                r.name.toLowerCase() === importedRecipe.name.toLowerCase()
            );
            return {
                importedRecipe,
                existingRecipe: existing,
                action: existing ? 'skip' : 'add'
            };
        });
    };

    // Detect ingredient matches
    const detectIngredientMatches = (): IngredientMapping[] => {
        return importData.ingredients.map(importedIng => {
            const exactMatch = existingIngredients.find(e =>
                e.name.toLowerCase() === importedIng.name.toLowerCase()
            );
            return {
                importedIngredient: importedIng,
                existingMatch: exactMatch,
                action: exactMatch ? 'map' : 'create',
                mapToId: exactMatch?.id
            };
        });
    };

    const [recipeConflicts, setRecipeConflicts] = useState<RecipeConflict[]>(detectRecipeConflicts());
    const [ingredientMappings, setIngredientMappings] = useState<IngredientMapping[]>(detectIngredientMatches());

    const updateRecipeAction = (index: number, action: 'add' | 'skip' | 'replace') => {
        setRecipeConflicts(prev => prev.map((c, i) => i === index ? { ...c, action } : c));
    };

    const updateIngredientMapping = (index: number, action: 'create' | 'map' | 'skip', mapToId?: string) => {
        setIngredientMappings(prev => prev.map((m, i) =>
            i === index ? { ...m, action, mapToId } : m
        ));
    };

    const handleConfirm = () => {
        // Build the final data to import
        const finalData: AppData = {
            recipes: [],
            ingredients: [],
            mealPlans: importData.mealPlans || [],
            pantry: importData.pantry || []
        };

        // Process recipes
        recipeConflicts.forEach(conflict => {
            if (conflict.action === 'add' || conflict.action === 'replace') {
                // Update recipe ingredients to use mapped ingredient IDs
                const updatedRecipe = {
                    ...conflict.importedRecipe,
                    ingredients: conflict.importedRecipe.ingredients.map(ing => {
                        const mapping = ingredientMappings.find(m =>
                            m.importedIngredient.name.toLowerCase() === ing.name.toLowerCase()
                        );
                        if (mapping?.action === 'map' && mapping.mapToId) {
                            const targetIng = existingIngredients.find(e => e.id === mapping.mapToId);
                            return targetIng ? { ...ing, name: targetIng.name } : ing;
                        }
                        return ing;
                    })
                };
                finalData.recipes.push(updatedRecipe);
            }
        });

        // Process ingredients
        ingredientMappings.forEach(mapping => {
            if (mapping.action === 'create') {
                finalData.ingredients.push(mapping.importedIngredient);
            }
        });

        onConfirm(finalData);
    };

    const conflictCount = recipeConflicts.filter(c => c.existingRecipe).length;
    const newIngredientsCount = ingredientMappings.filter(m => m.action === 'create').length;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4 overflow-y-auto">
            <div className="card p-6 w-full max-w-4xl bg-gray-900 border border-gray-700 shadow-2xl my-8">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold">Import Preview</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card p-4 bg-gray-800">
                        <div className="text-sm text-gray-400">Recipes</div>
                        <div className="text-2xl font-bold">{importData.recipes.length}</div>
                        {conflictCount > 0 && (
                            <div className="text-xs text-yellow-400 mt-1">
                                {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                    <div className="card p-4 bg-gray-800">
                        <div className="text-sm text-gray-400">Ingredients</div>
                        <div className="text-2xl font-bold">{importData.ingredients.length}</div>
                        <div className="text-xs text-green-400 mt-1">
                            {newIngredientsCount} new
                        </div>
                    </div>
                    <div className="card p-4 bg-gray-800">
                        <div className="text-sm text-gray-400">Meal Plans</div>
                        <div className="text-2xl font-bold">{importData.mealPlans?.length || 0}</div>
                    </div>
                </div>

                {/* Recipe Conflicts */}
                {conflictCount > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <AlertCircle className="text-yellow-400" size={20} />
                            Recipe Conflicts
                        </h3>
                        <div className="space-y-2">
                            {recipeConflicts.filter(c => c.existingRecipe).map((conflict, idx) => (
                                <div key={idx} className="card p-4 bg-gray-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold">{conflict.importedRecipe.name}</div>
                                            <div className="text-xs text-gray-400">Already exists in your recipes</div>
                                        </div>
                                        <select
                                            className="input text-sm"
                                            value={conflict.action}
                                            onChange={e => updateRecipeAction(idx, e.target.value as any)}
                                        >
                                            <option value="skip">Skip (keep existing)</option>
                                            <option value="add">Add as duplicate</option>
                                            <option value="replace">Replace existing</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Ingredients */}
                {newIngredientsCount > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <CheckCircle className="text-green-400" size={20} />
                            New Ingredients ({newIngredientsCount})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {ingredientMappings.filter(m => m.action === 'create').map((mapping, idx) => (
                                <div key={idx} className="card p-3 bg-gray-800 flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold">{mapping.importedIngredient.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">
                                            ({mapping.importedIngredient.category})
                                        </span>
                                    </div>
                                    <select
                                        className="input text-sm"
                                        value={mapping.mapToId || 'create'}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (value === 'create') {
                                                updateIngredientMapping(idx, 'create');
                                            } else {
                                                updateIngredientMapping(idx, 'map', value);
                                            }
                                        }}
                                    >
                                        <option value="create">Create new</option>
                                        <optgroup label="Map to existing">
                                            {existingIngredients.map(ing => (
                                                <option key={ing.id} value={ing.id}>
                                                    {ing.name} ({ing.category})
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button onClick={onCancel} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="btn-primary">
                        Import {recipeConflicts.filter(c => c.action !== 'skip').length} Recipe(s)
                    </button>
                </div>
            </div>
        </div>
    );
};
