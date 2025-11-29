import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { generateMealPlan } from '../utils/planner';
import { Calendar, Trash2, ShoppingCart } from 'lucide-react';

export const MealPlanner: React.FC<{ onSelectPlan: (planId: string) => void }> = ({ onSelectPlan }) => {
    const { recipes, mealPlans, addMealPlan, deleteMealPlan } = useData();
    const [days, setDays] = useState(7);

    const handleGenerate = () => {
        const plan = generateMealPlan(recipes, days);
        addMealPlan(plan);
    };

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Calendar /> New Meal Plan
                </h2>
                <div className="flex gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-sm text-gray-400">Number of Days/Meals</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={days}
                            onChange={e => setDays(parseInt(e.target.value) || 1)}
                            className="input w-32"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={recipes.length === 0}
                        className="btn-primary"
                    >
                        Generate Plan
                    </button>
                </div>
                {recipes.length === 0 && (
                    <p className="text-red-400 text-sm mt-2">Add recipes first to generate a plan.</p>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">History</h3>
                {mealPlans.length === 0 ? (
                    <p className="text-gray-500">No meal plans generated yet.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {mealPlans.map(plan => (
                            <div key={plan.id} className="card p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg">Plan for {plan.days} Meals</h4>
                                        <p className="text-xs text-gray-400">
                                            {new Date(plan.createdAt).toLocaleDateString()} {new Date(plan.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <button onClick={() => deleteMealPlan(plan.id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-auto max-h-40 space-y-1">
                                    {plan.recipes.map((r, idx) => (
                                        <div key={idx} className="text-sm border-b border-gray-700 py-1 last:border-0">
                                            <span className="font-mono text-gray-500 mr-2">#{idx + 1}</span>
                                            {r.name}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => onSelectPlan(plan.id)}
                                    className="btn-secondary w-full flex justify-center items-center gap-2"
                                >
                                    <ShoppingCart size={16} /> View Shopping List
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
