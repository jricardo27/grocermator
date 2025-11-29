import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { type IngredientEntity, STANDARD_UNITS } from '../types';
import { Plus, Search, Edit2, Trash2, Save, Package } from 'lucide-react';

export const IngredientManager: React.FC = () => {
    const { ingredients, addIngredient, updateIngredient, deleteIngredient } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<IngredientEntity | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const filteredIngredients = ingredients.filter(ing =>
        ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ing.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startEdit = (ing: IngredientEntity) => {
        setIsEditing(ing.id);
        setEditForm({ ...ing });
        setIsCreating(false);
    };

    const startCreate = () => {
        const newIng: IngredientEntity = {
            id: crypto.randomUUID(),
            name: '',
            category: 'pantry',
            shelfLife: 30,
            packageSize: 1,
            unit: 'pc'
        };
        setEditForm(newIng);
        setIsCreating(true);
        setIsEditing(null);
    };

    const save = () => {
        if (!editForm) return;
        if (isCreating) {
            addIngredient(editForm);
        } else {
            updateIngredient(editForm);
        }
        cancel();
    };

    const cancel = () => {
        setIsEditing(null);
        setIsCreating(false);
        setEditForm(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Package /> Ingredients
                </h2>
                <button onClick={startCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Ingredient
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    className="input w-full pl-10"
                    placeholder="Search ingredients..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Create/Edit Modal */}
            {(isCreating || isEditing) && editForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="card p-6 w-full max-w-md bg-gray-900 border border-gray-700 shadow-2xl animate-in fade-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-4">{isCreating ? 'New Ingredient' : 'Edit Ingredient'}</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Name</label>
                                <input
                                    className="input w-full"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="e.g. Carrots"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Category</label>
                                <select
                                    className="input w-full"
                                    value={editForm.category}
                                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                >
                                    <option value="produce">Produce</option>
                                    <option value="dairy">Dairy</option>
                                    <option value="meat">Meat</option>
                                    <option value="pantry">Pantry</option>
                                    <option value="frozen">Frozen</option>
                                    <option value="bakery">Bakery</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Shelf Life (Days)</label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    value={editForm.shelfLife}
                                    onChange={e => setEditForm({ ...editForm, shelfLife: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 block mb-1">Package Size</label>
                                    <input
                                        type="number"
                                        className="input w-full"
                                        value={editForm.packageSize}
                                        onChange={e => setEditForm({ ...editForm, packageSize: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 block mb-1">Unit</label>
                                    <select
                                        className="input w-full"
                                        value={editForm.unit}
                                        onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                                    >
                                        {STANDARD_UNITS.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={cancel} className="btn-secondary">Cancel</button>
                            <button onClick={save} className="btn-primary flex items-center gap-2">
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredIngredients.map(ing => (
                    <div key={ing.id} className="card p-3 flex justify-between items-center group">
                        <div>
                            <div className="font-semibold">{ing.name}</div>
                            <div className="text-xs text-gray-400">
                                {ing.category} • {ing.packageSize} {ing.unit}/pkg • {ing.shelfLife}d shelf life
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(ing)} className="p-1 hover:text-blue-400">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteIngredient(ing.id)} className="p-1 hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
