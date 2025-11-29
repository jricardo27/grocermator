import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Recipe, Ingredient } from '../types';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { getSeasonalBadge } from '../utils/seasonal';

export const RecipeList: React.FC = () => {
    const { recipes, addRecipe, updateRecipe, deleteRecipe } = useData();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Recipe | null>(null);

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
                        {isEditing === recipe.id && editForm ? (
                            <RecipeForm
                                recipe={editForm}
                                onChange={setEditForm}
                                onSave={saveEdit}
                                onCancel={cancelEdit}
                            />
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-semibold">{recipe.name}</h3>
                                        {recipe.seasonal && (
                                            <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">
                                                {getSeasonalBadge(recipe.seasonal)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            </>
                        )}
                    </div>
                ))}
                {recipes.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No recipes yet. Add one to get started!
                    </div>
                )}
            </div>
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
    const [showAdvanced, setShowAdvanced] = useState(false);

    const addIngredient = () => {
        onChange({
            ...recipe,
            ingredients: [...recipe.ingredients, { name: '', quantity: 1, unit: 'pc' }]
        });
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
        const newIngredients = [...recipe.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        onChange({ ...recipe, ingredients: newIngredients });
    };

    const removeIngredient = (index: number) => {
        const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
        onChange({ ...recipe, ingredients: newIngredients });
    };

    return (
        <div className="space-y-3">
            <input
                className="input w-full font-bold text-lg"
                value={recipe.name}
                onChange={e => onChange({ ...recipe, name: e.target.value })}
                placeholder="Recipe Name"
            />

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-xs text-gray-400 block mb-1">Servings</label>
                    <input
                        type="number"
                        min="1"
                        className="input w-full"
                        value={recipe.servings || 2}
                        onChange={e => onChange({ ...recipe, servings: parseInt(e.target.value) || 1 })}
                    />
                </div>
                <div className="flex-[3]">
                    <label className="text-xs text-gray-400 block mb-1">Image URL</label>
                    <div className="flex gap-2">
                        <input
                            className="input w-full"
                            value={recipe.imageUrl || ''}
                            onChange={e => onChange({ ...recipe, imageUrl: e.target.value })}
                            placeholder="https://..."
                        />
                        {recipe.imageUrl && (
                            <div className="w-10 h-10 rounded overflow-hidden bg-gray-900 border border-gray-700 flex-shrink-0">
                                <img src={recipe.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-gray-400">Ingredients</label>
                {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input
                            type="number"
                            step="any"
                            className="input w-20"
                            value={ing.quantity}
                            onChange={e => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Qty"
                        />
                        <input
                            className="input w-20"
                            value={ing.unit}
                            onChange={e => updateIngredient(idx, 'unit', e.target.value)}
                            placeholder="Unit"
                        />
                        <input
                            className="input flex-1"
                            value={ing.name}
                            onChange={e => updateIngredient(idx, 'name', e.target.value)}
                            placeholder="Ingredient"
                        />
                        <button onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-300">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={addIngredient} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={14} /> Add Ingredient
            </button>

            <div className="border-t border-gray-700 pt-2">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-gray-400 flex items-center gap-1 hover:text-white"
                >
                    {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showAdvanced ? 'Hide Details' : 'Show Instructions & Seasonal Info'}
                </button>

                {showAdvanced && (
                    <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Instructions</label>
                            <textarea
                                className="input w-full h-24 text-sm"
                                value={recipe.instructions || ''}
                                onChange={e => onChange({ ...recipe, instructions: e.target.value })}
                                placeholder="Step 1..."
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Seasonal Availability</label>
                            <div className="flex gap-2">
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
                                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${isSelected
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

            <div className="flex justify-end gap-2 mt-4">
                <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
                <button onClick={onSave} className="btn-primary text-sm flex items-center gap-1">
                    <Save size={14} /> Save
                </button>
            </div>
        </div>
    );
};
