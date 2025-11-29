import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Recipe, Ingredient, IngredientEntity } from '../types';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { getSeasonalBadge } from '../utils/seasonal';
import { getUnitCategories, isValidUnit } from '../utils/units';

export const RecipeList: React.FC<{ initialEditRecipe?: Recipe }> = ({ initialEditRecipe }) => {
    const { recipes, addRecipe, updateRecipe, deleteRecipe } = useData();
    const [isEditing, setIsEditing] = useState<string | null>(initialEditRecipe?.id || null);
    const [editForm, setEditForm] = useState<Recipe | null>(initialEditRecipe || null);

    const startEdit = (recipe: Recipe) => {
        setIsEditing(recipe.id);
        setEditForm({ ...recipe });
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setEditForm(null);
    };

    const saveEdit = () => {
        if (editForm) {
            updateRecipe(editForm);
            setIsEditing(null);
            setEditForm(null);
        }
    };

    const startNew = () => {
        const newRecipe: Recipe = {
            id: crypto.randomUUID(),
            name: 'New Recipe',
            ingredients: [],
            servings: 2
        };
        addRecipe(newRecipe);
        startEdit(newRecipe);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Recipes</h2>
                <button onClick={startNew} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Recipe
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recipes.map(recipe => (
                    <div key={recipe.id} className="card p-4 relative group">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-semibold">{recipe.name}</h3>
                                {recipe.seasonal && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">
                                        {getSeasonalBadge(recipe.seasonal)}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(recipe)} className="p-1 hover:text-blue-500">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => deleteRecipe(recipe.id)} className="p-1 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {recipe.imageUrl && (
                            <div className="mb-3 h-32 rounded-lg overflow-hidden bg-gray-900">
                                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex gap-4 text-sm text-gray-400 mb-2">
                            <span>{recipe.servings} servings</span>
                            {recipe.instructions && (
                                <span className="flex items-center gap-1">
                                    <BookOpen size={14} /> Instructions
                                </span>
                            )}
                        </div>

                        <ul className="text-sm text-gray-400 space-y-1">
                            {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                                <li key={idx}>
                                    {ing.quantity} {ing.unit} {ing.name}
                                </li>
                            ))}
                            {recipe.ingredients.length > 5 && (
                                <li className="text-xs italic">+{recipe.ingredients.length - 5} more...</li>
                            )}
                            {recipe.ingredients.length === 0 && <li>No ingredients</li>}
                        </ul>
                    </div>
                ))}
                {recipes.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No recipes yet. Add one to get started!
                    </div>
                )}
            </div>

            {/* Recipe Edit Modal */}
            {isEditing && editForm && (
                <RecipeForm
                    recipe={editForm}
                    onChange={setEditForm}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                />
            )}
        </div>
    );
};

interface RecipeFormProps {
    recipe: Recipe;
    onChange: (r: Recipe) => void;
    onSave: () => void;
    onCancel: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, onChange, onSave, onCancel }) => {
    const { ingredients, addIngredient } = useData();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const unitCategories = getUnitCategories();

    // Autocomplete state
    const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewIngredientModal, setShowNewIngredientModal] = useState(false);
    const [newIngredientName, setNewIngredientName] = useState('');

    const filteredIngredients = searchTerm
        ? ingredients.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    const addRecipeIngredient = () => {
        onChange({
            ...recipe,
            ingredients: [...recipe.ingredients, { name: '', quantity: 1, unit: 'pc' }]
        });
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
        const newIngredients = [...recipe.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };

        if (field === 'name') {
            setSearchTerm(value as string);
            setActiveSearchIndex(index);
        }

        onChange({ ...recipe, ingredients: newIngredients });
    };

    const selectIngredient = (index: number, entity: IngredientEntity) => {
        const newIngredients = [...recipe.ingredients];
        newIngredients[index] = {
            ...newIngredients[index],
            name: entity.name,
            unit: entity.unit,
            ingredientId: entity.id
        };
        onChange({ ...recipe, ingredients: newIngredients });
        setActiveSearchIndex(null);
        setSearchTerm('');
    };

    const removeIngredient = (index: number) => {
        const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
        onChange({ ...recipe, ingredients: newIngredients });
    };

    const handleCreateNewIngredient = () => {
        const newEntity: IngredientEntity = {
            id: crypto.randomUUID(),
            name: newIngredientName,
            category: 'pantry',
            shelfLife: 30,
            packageSize: 1,
            unit: 'pc'
        };
        addIngredient(newEntity);

        // If we were searching for an ingredient, auto-select the new one
        if (activeSearchIndex !== null) {
            selectIngredient(activeSearchIndex, newEntity);
        }

        setShowNewIngredientModal(false);
        setNewIngredientName('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[100] overflow-y-auto p-4">
            <div className="card w-full max-w-4xl my-8 p-6 bg-gray-900 border border-gray-700 shadow-2xl animate-in fade-in zoom-in-95">
                <h2 className="text-2xl font-bold mb-6">Edit Recipe</h2>

                <div className="space-y-6">
                    <input
                        className="input w-full font-bold text-xl"
                        value={recipe.name}
                        onChange={e => onChange({ ...recipe, name: e.target.value })}
                        placeholder="Recipe Name"
                        autoFocus
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Servings</label>
                            <input
                                type="number"
                                min="1"
                                className="input w-full"
                                value={recipe.servings || 2}
                                onChange={e => onChange({ ...recipe, servings: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    className="input flex-1"
                                    value={recipe.imageUrl || ''}
                                    onChange={e => onChange({ ...recipe, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                                {recipe.imageUrl && (
                                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-900 border border-gray-700 flex-shrink-0">
                                        <img src={recipe.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm text-gray-400 font-semibold">Ingredients</label>
                        {recipe.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex gap-3 items-center relative">
                                <input
                                    type="number"
                                    step="any"
                                    className="input w-24"
                                    value={ing.quantity}
                                    onChange={e => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                    placeholder="Qty"
                                />

                                <div className="relative w-32">
                                    <select
                                        className="input w-full appearance-none pr-6"
                                        value={ing.unit}
                                        onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                                    >
                                        {Object.entries(unitCategories).map(([category, units]) => (
                                            <optgroup key={category} label={category}>
                                                {units.map(u => (
                                                    <option key={u} value={u}>{u}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                        {!isValidUnit(ing.unit) && <option value={ing.unit}>{ing.unit}</option>}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>

                                <div className="flex-1 relative">
                                    <input
                                        className="input w-full"
                                        value={ing.name}
                                        onChange={e => updateIngredient(idx, 'name', e.target.value)}
                                        onFocus={() => {
                                            setActiveSearchIndex(idx);
                                            setSearchTerm(ing.name);
                                        }}
                                        onBlur={() => {
                                            // Delay hiding to allow click
                                            setTimeout(() => setActiveSearchIndex(null), 200);
                                        }}
                                        placeholder="Ingredient name"
                                    />

                                    {/* Autocomplete Dropdown */}
                                    {activeSearchIndex === idx && searchTerm && (
                                        <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                                            {filteredIngredients.map(entity => (
                                                <button
                                                    key={entity.id}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm flex justify-between"
                                                    onClick={() => selectIngredient(idx, entity)}
                                                >
                                                    <span>{entity.name}</span>
                                                    <span className="text-gray-500 text-xs">{entity.category}</span>
                                                </button>
                                            ))}
                                            {filteredIngredients.length === 0 && (
                                                <button
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-blue-400 flex items-center gap-2"
                                                    onClick={() => {
                                                        setNewIngredientName(searchTerm);
                                                        setShowNewIngredientModal(true);
                                                    }}
                                                >
                                                    <Plus size={14} /> Create "{searchTerm}"
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-300 p-2">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}

                        <button onClick={addRecipeIngredient} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2 mt-2">
                            <Plus size={16} /> Add Ingredient
                        </button>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-sm text-gray-400 flex items-center gap-2 hover:text-white"
                        >
                            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {showAdvanced ? 'Hide Details' : 'Show Instructions & Seasonal Info'}
                        </button>

                        {showAdvanced && (
                            <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Instructions</label>
                                    <textarea
                                        className="input w-full h-32 text-sm"
                                        value={recipe.instructions || ''}
                                        onChange={e => onChange({ ...recipe, instructions: e.target.value })}
                                        placeholder="Step 1: ..."
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Seasonal Availability</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {(['spring', 'summer', 'fall', 'winter'] as const).map(season => {
                                            const isSelected = recipe.seasonal?.type === 'season' && recipe.seasonal.seasons?.includes(season);
                                            return (
                                                <button
                                                    key={season}
                                                    onClick={() => {
                                                        const currentSeasons = recipe.seasonal?.type === 'season' ? (recipe.seasonal.seasons || []) : [];
                                                        const newSeasons = isSelected
                                                            ? currentSeasons.filter(s => s !== season)
                                                            : [...currentSeasons, season];

                                                        onChange({
                                                            ...recipe,
                                                            seasonal: newSeasons.length > 0 ? { type: 'season', seasons: newSeasons } : undefined
                                                        });
                                                    }}
                                                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${isSelected
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'border-gray-600 text-gray-400 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {season}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button onClick={onCancel} className="btn-secondary px-6">Cancel</button>
                        <button onClick={onSave} className="btn-primary px-6 flex items-center gap-2">
                            <Save size={18} /> Save Recipe
                        </button>
                    </div>
                </div>
            </div>

            {/* New Ingredient Modal */}
            {showNewIngredientModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
                    <div className="card p-6 w-full max-w-md bg-gray-900 border border-gray-700 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Add New Ingredient</h3>
                        <p className="text-gray-400 mb-4">
                            "{newIngredientName}" doesn't exist yet. Add it to your database?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowNewIngredientModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNewIngredient}
                                className="btn-primary"
                            >
                                Create & Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
