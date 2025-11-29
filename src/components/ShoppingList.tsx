import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { calculateShoppingListV2 } from '../utils/planner';
import { ArrowLeft, CheckSquare, Package } from 'lucide-react';


export const ShoppingList: React.FC<{ planId: string, onBack: () => void }> = ({ planId, onBack }) => {
    const { mealPlans, ingredients: ingredientEntities, pantry } = useData();

    const plan = useMemo(() => mealPlans.find(p => p.id === planId), [mealPlans, planId]);

    const items = useMemo(() => {
        if (!plan) return [];
        return calculateShoppingListV2(plan);
    }, [plan]);

    const enrichedItems = useMemo(() => {
        return items.map(item => {
            // Find matching entity by ID if available, or name
            const entity = ingredientEntities.find(e =>
                e.id === item.ingredientId ||
                e.name.toLowerCase() === item.name.toLowerCase()
            );

            // Find matching pantry item
            const pantryItem = pantry.find(p => p.ingredientId === entity?.id);
            let adjustedQuantity = item.quantity;
            let inPantry = 0;

            if (pantryItem && pantryItem.unit === item.unit) {
                inPantry = pantryItem.quantity;
                adjustedQuantity = Math.max(0, item.quantity - pantryItem.quantity);
            }

            if (entity && entity.packageSize > 0) {
                // Calculate packs needed based on adjusted quantity
                const packsNeeded = adjustedQuantity > 0 ? Math.ceil(adjustedQuantity / entity.packageSize) : 0;
                return { ...item, entity, packsNeeded, adjustedQuantity, inPantry };
            }
            return { ...item, entity: null, packsNeeded: null, adjustedQuantity, inPantry };
        }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    }, [items, ingredientEntities, pantry]);

    if (!plan) return <div>Plan not found</div>;

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
                <ArrowLeft size={20} /> Back to Plans
            </button>

            <div className="card p-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <CheckSquare /> Shopping List
                </h2>

                <div className="space-y-2">
                    {enrichedItems.length === 0 ? (
                        <p className="text-gray-500">No ingredients needed.</p>
                    ) : (
                        enrichedItems.map((item, idx) => (
                            <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${item.adjustedQuantity === 0 ? 'bg-green-900/20 border-green-900/50' : 'bg-gray-800/50 border-gray-700'}`}>
                                <div className="flex items-center gap-3 flex-1">
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700" />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-blue-400 w-16 text-right">{parseFloat(item.adjustedQuantity.toFixed(2))}</span>
                                            <span className="text-gray-400 w-16">{item.unit}</span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        {item.inPantry > 0 && (
                                            <span className="text-xs text-green-400 ml-8 sm:ml-2">
                                                ✓ Have {parseFloat(item.inPantry.toFixed(2))} {item.unit}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {item.packsNeeded && item.packsNeeded > 0 && item.entity && (
                                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-900/50 ml-8 sm:ml-0">
                                        <Package size={14} />
                                        <span>
                                            Buy <strong>{item.packsNeeded}</strong> pack{item.packsNeeded > 1 ? 's' : ''}
                                            <span className="text-green-500/70 text-xs ml-1">
                                                ({item.entity.packageSize} {item.entity.unit}/pkg)
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
