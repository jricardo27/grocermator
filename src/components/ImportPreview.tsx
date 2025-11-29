import React, { useState, useRef, useEffect } from 'react';
import { type Recipe, type IngredientEntity, type AppData } from '../types';
import { AlertCircle, CheckCircle, X, ChevronDown, Check, Search } from 'lucide-react';

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

// Custom Select Component
interface Option {
    value: string;
    label: string;
    description?: string;
}

const CustomSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    disabled?: boolean;
    className?: string;
}> = ({ value, onChange, options, disabled, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`input w-full flex justify-between items-center text-left ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={disabled}
            >
                <span className="truncate">{selectedOption?.label || value}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                    {options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-700 flex flex-col ${option.value === value ? 'bg-gray-700/50 text-blue-400' : ''}`}
                        >
                            <span className="font-medium">{option.label}</span>
                            {option.description && (
                                <span className="text-xs text-gray-400">{option.description}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Autocomplete Combobox Component
const Combobox: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; group?: string }[];
    disabled?: boolean;
    className?: string;
}> = ({ value, onChange, options, disabled, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const selectedOption = options.find(o => o.value === value);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        (option.group && option.group.toLowerCase().includes(search.toLowerCase()))
    );

    // Group options
    const groupedOptions = filteredOptions.reduce((acc, option) => {
        const group = option.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(option);
        return acc;
    }, {} as Record<string, typeof options>);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`input w-full flex justify-between items-center text-left ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={disabled}
            >
                <span className="truncate">{selectedOption?.label || 'Select...'}</span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto flex flex-col">
                    <div className="p-2 sticky top-0 bg-gray-800 border-b border-gray-700">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="input w-full pl-8 py-1 text-sm"
                                placeholder="Search..."
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                            <div key={group}>
                                {group !== 'Other' && (
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-900/50 uppercase tracking-wider">
                                        {group}
                                    </div>
                                )}
                                {groupOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-left px-3 py-2 hover:bg-gray-700 flex items-center justify-between ${option.value === value ? 'bg-gray-700/50 text-blue-400' : ''}`}
                                    >
                                        <span>{option.label}</span>
                                        {option.value === value && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="px-3 py-4 text-center text-gray-500 text-sm">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

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
        // Start with explicit ingredients
        const allIngredients = [...importData.ingredients];
        const existingNames = new Set(allIngredients.map(i => i.name.toLowerCase()));

        // Add implicit ingredients from recipes
        importData.recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => {
                if (!existingNames.has(ing.name.toLowerCase())) {
                    const newIng: IngredientEntity = {
                        id: crypto.randomUUID(),
                        name: ing.name,
                        category: 'pantry', // Default
                        shelfLife: 30, // Default
                        packageSize: 1, // Default
                        unit: ing.unit || 'pc'
                    };
                    allIngredients.push(newIng);
                    existingNames.add(ing.name.toLowerCase());
                }
            });
        });

        return allIngredients.map(importedIng => {
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

    // Track which ingredients are used by which recipes
    const getRecipesUsingIngredient = (ingredientName: string): Recipe[] => {
        return recipeConflicts
            .filter(c => c.action !== 'skip')
            .map(c => c.importedRecipe)
            .filter(recipe =>
                recipe.ingredients.some(ing =>
                    ing.name.toLowerCase() === ingredientName.toLowerCase()
                )
            );
    };

    // Check if an ingredient can be skipped (only if no recipes use it)
    const canSkipIngredient = (ingredientName: string): boolean => {
        return getRecipesUsingIngredient(ingredientName).length === 0;
    };

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
                        <div className="text-2xl font-bold">{recipeConflicts.filter(c => c.action !== 'skip').length}/{importData.recipes.length}</div>
                        {conflictCount > 0 && (
                            <div className="text-xs text-yellow-400 mt-1">
                                {conflictCount} conflict{conflictCount > 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                    <div className="card p-4 bg-gray-800">
                        <div className="text-sm text-gray-400">Ingredients</div>
                        <div className="text-2xl font-bold">{ingredientMappings.filter(m => m.action !== 'skip').length}/{importData.ingredients.length}</div>
                        <div className="text-xs text-green-400 mt-1">
                            {newIngredientsCount} new
                        </div>
                    </div>
                    <div className="card p-4 bg-gray-800">
                        <div className="text-sm text-gray-400">Meal Plans</div>
                        <div className="text-2xl font-bold">{importData.mealPlans?.length || 0}</div>
                    </div>
                </div>

                {/* All Recipes */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        {conflictCount > 0 && <AlertCircle className="text-yellow-400" size={20} />}
                        Recipes ({importData.recipes.length})
                    </h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {recipeConflicts.map((conflict, idx) => (
                            <div key={idx} className={`card p-4 ${conflict.existingRecipe ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-gray-800'}`}>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="font-semibold flex items-center gap-2">
                                            {conflict.importedRecipe.name}
                                            {conflict.existingRecipe && (
                                                <span className="text-xs px-2 py-0.5 bg-yellow-600 rounded">Conflict</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {conflict.importedRecipe.ingredients.length} ingredients • {conflict.importedRecipe.servings} servings
                                        </div>
                                        {conflict.existingRecipe && (
                                            <div className="text-xs text-yellow-400 mt-1">
                                                ⚠️ A recipe with this name already exists
                                            </div>
                                        )}
                                    </div>
                                    <CustomSelect
                                        className="min-w-[200px]"
                                        value={conflict.action}
                                        onChange={val => updateRecipeAction(idx, val as any)}
                                        options={conflict.existingRecipe ? [
                                            { value: 'skip', label: 'Skip', description: 'Keep existing recipe' },
                                            { value: 'add', label: 'Add as duplicate', description: 'Import anyway' },
                                            { value: 'replace', label: 'Replace existing', description: 'Overwrite existing' }
                                        ] : [
                                            { value: 'add', label: 'Import' },
                                            { value: 'skip', label: 'Skip' }
                                        ]}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={20} />
                        Ingredients ({importData.ingredients.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {ingredientMappings.map((mapping, idx) => {
                            const recipesUsing = getRecipesUsingIngredient(mapping.importedIngredient.name);
                            const canSkip = canSkipIngredient(mapping.importedIngredient.name);

                            // Build options for combobox
                            const options = [
                                { value: 'create', label: 'Create new', group: 'Actions' },
                                ...(canSkip ? [{ value: 'skip', label: 'Skip', group: 'Actions' }] : []),
                                ...existingIngredients.map(ing => ({
                                    value: ing.id,
                                    label: `${ing.name} (${ing.category})`,
                                    group: 'Map to existing'
                                }))
                            ];

                            const currentValue = mapping.action === 'skip' ? 'skip' : (mapping.mapToId || 'create');

                            return (
                                <div key={idx} className="card p-3 bg-gray-800">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div>
                                                <span className="font-semibold">{mapping.importedIngredient.name}</span>
                                                <span className="text-xs text-gray-400 ml-2">
                                                    ({mapping.importedIngredient.category})
                                                </span>
                                            </div>
                                            {recipesUsing.length > 0 && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Used by: {recipesUsing.map(r => r.name).join(', ')}
                                                </div>
                                            )}
                                            {!canSkip && mapping.action === 'skip' && (
                                                <div className="text-xs text-red-400 mt-1">
                                                    ⚠️ Cannot skip: used by imported recipes
                                                </div>
                                            )}
                                        </div>
                                        <Combobox
                                            className="min-w-[220px]"
                                            value={currentValue}
                                            onChange={value => {
                                                if (value === 'create') {
                                                    updateIngredientMapping(idx, 'create');
                                                } else if (value === 'skip') {
                                                    if (canSkip) {
                                                        updateIngredientMapping(idx, 'skip');
                                                    }
                                                } else {
                                                    updateIngredientMapping(idx, 'map', value);
                                                }
                                            }}
                                            options={options}
                                            disabled={!canSkip && mapping.action === 'skip'}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

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
