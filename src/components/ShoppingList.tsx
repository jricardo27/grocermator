import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { calculateShoppingListV2 } from '../utils/planner';
import { ArrowLeft, CheckSquare } from 'lucide-react';

export const ShoppingList: React.FC<{ planId: string, onBack: () => void }> = ({ planId, onBack }) => {
    const { mealPlans } = useData();

    const plan = useMemo(() => mealPlans.find(p => p.id === planId), [mealPlans, planId]);

    const items = useMemo(() => {
        if (!plan) return [];
        return calculateShoppingListV2(plan);
    }, [plan]);

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
                    {items.length === 0 ? (
                        <p className="text-gray-500">No ingredients needed.</p>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700" />
                                <span className="font-bold text-blue-400 w-16 text-right">{item.quantity}</span>
                                <span className="text-gray-400 w-16">{item.unit}</span>
                                <span className="flex-1 font-medium">{item.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
