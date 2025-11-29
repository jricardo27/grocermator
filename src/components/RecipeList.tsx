import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Recipe, Ingredient } from '../types';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

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
            ingredients: []
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
                                    <h3 className="text-xl font-semibold">{recipe.name}</h3>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit(recipe)} className="p-1 hover:text-blue-500">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteRecipe(recipe.id)} className="p-1 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    {recipe.ingredients.map((ing, idx) => (
                                        <li key={idx}>
                                            {ing.quantity} {ing.unit} {ing.name}
                                        </li>
                                    ))}
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

            <div className="space-y-2">
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

            <div className="flex justify-end gap-2 mt-4">
                <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
                <button onClick={onSave} className="btn-primary text-sm flex items-center gap-1">
                    <Save size={14} /> Save
                </button>
            </div>
        </div>
    );
};
