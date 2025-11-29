import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { PantryItem } from '../types';
import { Search, Plus, X, Save, Package, ChevronDown } from 'lucide-react';
import { unitCategories } from '../utils/units';

export const PantryManager: React.FC = () => {
    const { pantry, ingredients, addPantryItem, updatePantryItem, removePantryItem, addIngredient } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<PantryItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
    const [showNewIngredientModal, setShowNewIngredientModal] = useState(false);
    const [newIngredientName, setNewIngredientName] = useState('');

    const filteredPantry = pantry.filter(item => {
        const ingredient = ingredients.find(ing => ing.id === item.ingredientId);
        return ingredient?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const filteredIngredients = ingredients.filter(ing =>
        ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
    );

    const startNew = () => {
        setEditForm({
            ingredientId: '',
            quantity: 1,
            unit: 'pc',
            addedDate: new Date().toISOString()
        });
        setIngredientSearch('');
        setIsCreating(true);
        setIsEditing(null);
    };

    const startEdit = (item: PantryItem) => {
        const ingredient = ingredients.find(ing => ing.id === item.ingredientId);
        setEditForm({ ...item });
        setIngredientSearch(ingredient?.name || '');
        setIsEditing(item.ingredientId);
        setIsCreating(false);
    };

    const cancel = () => {
        setEditForm(null);
        setIsEditing(null);
        setIsCreating(false);
        setIngredientSearch('');
        setShowIngredientDropdown(false);
    };

    const save = () => {
        if (!editForm || !editForm.ingredientId) return;

        if (isCreating) {
            addPantryItem(editForm);
        } else if (isEditing) {
            updatePantryItem(isEditing, editForm);
        }
        cancel();
    };

    const handleDelete = (ingredientId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        // Use setTimeout to ensure the dialog stays open
        setTimeout(() => {
            if (window.confirm('Remove this item from pantry?')) {
                removePantryItem(ingredientId);
            }
        }, 0);
    };

    const selectIngredient = (ingredientId: string) => {
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        if (ingredient && editForm) {
            setEditForm({
                ...editForm,
                ingredientId: ingredient.id,
                unit: ingredient.unit
            });
            setIngredientSearch(ingredient.name);
            setShowIngredientDropdown(false);
        }
    };

    const handleCreateNewIngredient = () => {
        const newIngredient = {
            id: crypto.randomUUID(),
            name: newIngredientName,
            category: 'other',
            shelfLife: 7,
            packageSize: 1,
            unit: 'pc'
        };
        addIngredient(newIngredient);

        if (editForm) {
            setEditForm({
                ...editForm,
                ingredientId: newIngredient.id,
                unit: newIngredient.unit
            });
            setIngredientSearch(newIngredient.name);
        }

        setShowNewIngredientModal(false);
        setShowIngredientDropdown(false);
        setNewIngredientName('');
    };

    const getIngredientName = (ingredientId: string) => {
        return ingredients.find(ing => ing.id === ingredientId)?.name || 'Unknown';
    };

    const getIngredientCategory = (ingredientId: string) => {
        return ingredients.find(ing => ing.id === ingredientId)?.category || '';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Pantry</h2>
                <button onClick={startNew} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Item
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    className="input w-full pl-10"
                    placeholder="Search pantry..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Create/Edit Modal */}
            {(isCreating || isEditing) && editForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="card p-6 w-full max-w-md bg-gray-900 border border-gray-700 shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-4">{isCreating ? 'Add to Pantry' : 'Edit Pantry Item'}</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Ingredient</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="Search ingredient..."
                                        value={ingredientSearch}
                                        onChange={e => {
                                            setIngredientSearch(e.target.value);
                                            setShowIngredientDropdown(true);
                                        }}
                                        onFocus={() => setShowIngredientDropdown(true)}
                                        onBlur={() => {
                                            // Delay to allow click on dropdown
                                            setTimeout(() => setShowIngredientDropdown(false), 200);
                                        }}
                                        disabled={!isCreating}
                                    />

                                    {/* Autocomplete Dropdown */}
                                    {showIngredientDropdown && isCreating && ingredientSearch && (
                                        <div className="absolute top-full left-0 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                                            {filteredIngredients.map(ing => (
                                                <button
                                                    key={ing.id}
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm flex justify-between"
                                                    onClick={() => selectIngredient(ing.id)}
                                                >
                                                    <span>{ing.name}</span>
                                                    <span className="text-gray-500 text-xs">{ing.category}</span>
                                                </button>
                                            ))}
                                            {filteredIngredients.length === 0 && (
                                                <button
                                                    className="w-full text-left px-3 py-2 hover:bg-gray-700 text-sm text-blue-400 flex items-center gap-2"
                                                    onClick={() => {
                                                        setNewIngredientName(ingredientSearch);
                                                        setShowNewIngredientModal(true);
                                                    }}
                                                >
                                                    <Plus size={14} /> Create "{ingredientSearch}"
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="input w-full"
                                        value={editForm.quantity}
                                        onChange={e => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Unit</label>
                                    <div className="relative">
                                        <select
                                            className="input w-full appearance-none pr-8"
                                            value={editForm.unit}
                                            onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                                        >
                                            {Object.entries(unitCategories).map(([category, units]) => (
                                                <optgroup key={category} label={category}>
                                                    {units.map(u => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={cancel} className="btn-secondary">Cancel</button>
                            <button onClick={save} className="btn-primary flex items-center gap-2" disabled={!editForm.ingredientId}>
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Ingredient Modal */}
            {showNewIngredientModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
                    <div className="card p-6 w-full max-w-sm bg-gray-900 border border-gray-700 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Create New Ingredient</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Name</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={newIngredientName}
                                    onChange={e => setNewIngredientName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => {
                                setShowNewIngredientModal(false);
                                setNewIngredientName('');
                            }} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNewIngredient}
                                className="btn-primary flex items-center gap-2"
                                disabled={!newIngredientName.trim()}
                            >
                                <Plus size={18} /> Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pantry Items Grid */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredPantry.map(item => {
                    return (
                        <div key={item.ingredientId} className="card p-4 relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{getIngredientName(item.ingredientId)}</h3>
                                    <span className="text-xs text-gray-400">{getIngredientCategory(item.ingredientId)}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(item)} className="p-1 hover:text-blue-500">
                                        <Package size={16} />
                                    </button>
                                    <button onClick={(e) => handleDelete(item.ingredientId, e)} className="p-1 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-blue-400">{item.quantity}</span>
                                <span className="text-gray-400">{item.unit}</span>
                            </div>
                        </div>
                    );
                })}
                {filteredPantry.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        {searchTerm ? 'No matching items' : 'Your pantry is empty. Add items to get started!'}
                    </div>
                )}
            </div>
        </div>
    );
};
