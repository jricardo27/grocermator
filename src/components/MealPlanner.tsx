import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { generateMealPlan } from '../utils/planner';
import { scaleRecipe } from '../utils/recipeScaling';
import { Calendar, Trash2, ShoppingCart, Leaf, Repeat, CalendarDays, Users } from 'lucide-react';

export const MealPlanner: React.FC<{ onSelectPlan: (planId: string) => void }> = ({ onSelectPlan }) => {
    const { recipes, mealPlans, addMealPlan, deleteMealPlan, updateMealPlan } = useData();
    const [days, setDays] = useState(7);
    const [optimizeWaste, setOptimizeWaste] = useState(false);
    const [allowRepeats, setAllowRepeats] = useState(false);
    const [seasonalOnly, setSeasonalOnly] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const handleGenerate = () => {
        const plan = generateMealPlan(recipes, {
            days,
            startDate: new Date(startDate),
            optimizeWaste,
            allowRepeats,
            seasonalOnly,
            recentRecipes: mealPlans.slice(0, 3).flatMap(p => p.recipes.map(r => r.id))
        });
        addMealPlan(plan);
    };

    const handleUpdateServings = (planId: string, recipeIndex: number, newServings: number) => {
        const plan = mealPlans.find(p => p.id === planId);
        if (!plan) return;

        const newRecipes = [...plan.recipes];
        const recipe = newRecipes[recipeIndex];
        newRecipes[recipeIndex] = scaleRecipe(recipe, newServings);

        updateMealPlan({
            ...plan,
            recipes: newRecipes
        });
    };

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Calendar /> New Meal Plan
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Number of Days/Meals</label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={days}
                                onChange={e => setDays(parseInt(e.target.value) || 1)}
                                className="input w-full"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-sm text-gray-300 mb-2">Optimization Settings</h3>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${optimizeWaste ? 'bg-green-600 border-green-600' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                {optimizeWaste && <Leaf size={14} className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={optimizeWaste}
                                onChange={e => setOptimizeWaste(e.target.checked)}
                                className="hidden"
                            />
                            <span className={optimizeWaste ? 'text-green-400 font-medium' : 'text-gray-400'}>
                                Minimize Waste (Prioritize Perishables)
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allowRepeats ? 'bg-blue-600 border-blue-600' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                {allowRepeats && <Repeat size={14} className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={allowRepeats}
                                onChange={e => setAllowRepeats(e.target.checked)}
                                className="hidden"
                            />
                            <span className={allowRepeats ? 'text-blue-400 font-medium' : 'text-gray-400'}>
                                Allow Repeated Recipes
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${seasonalOnly ? 'bg-orange-600 border-orange-600' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                {seasonalOnly && <CalendarDays size={14} className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={seasonalOnly}
                                onChange={e => setSeasonalOnly(e.target.checked)}
                                className="hidden"
                            />
                            <span className={seasonalOnly ? 'text-orange-400 font-medium' : 'text-gray-400'}>
                                Seasonal Recipes Only
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={recipes.length === 0}
                    className="btn-primary w-full md:w-auto"
                >
                    Generate Optimized Plan
                </button>

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
                                            Starts: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Created: {new Date(plan.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button onClick={() => deleteMealPlan(plan.id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-auto max-h-40 space-y-2">
                                    {plan.recipes.map((r, idx) => (
                                        <div key={idx} className="text-sm border-b border-gray-700 py-2 last:border-0 flex justify-between items-center group">
                                            <span className="flex-1 truncate">
                                                <span className="font-mono text-gray-500 mr-2">#{idx + 1}</span>
                                                {r.name}
                                            </span>

                                            <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                                <Users size={12} />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    className="w-8 bg-transparent text-center focus:outline-none focus:text-white"
                                                    value={r.servings}
                                                    onChange={(e) => handleUpdateServings(plan.id, idx, parseInt(e.target.value) || 1)}
                                                />
                                                <span>servings</span>
                                            </div>
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
