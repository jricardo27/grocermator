import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { generateMealPlan } from '../utils/planner';
import { scaleRecipe } from '../utils/recipeScaling';
import { Calendar, Trash2, ShoppingCart, Leaf, Repeat, CalendarDays, Users, BookOpen, X, Edit } from 'lucide-react';
import type { Recipe } from '../types';

export const MealPlanner: React.FC<{ onSelectPlan: (planId: string) => void, onEditRecipe?: (recipe: Recipe) => void }> = ({ onSelectPlan, onEditRecipe }) => {
    const { recipes, mealPlans, addMealPlan, deleteMealPlan, updateMealPlan } = useData();
    const [days, setDays] = useState(7);
    const [optimizeWaste, setOptimizeWaste] = useState(false);
    const [allowRepeats, setAllowRepeats] = useState(false);
    const [seasonalOnly, setSeasonalOnly] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [cookingModeRecipe, setCookingModeRecipe] = useState<Recipe | null>(null);
    const [cookingServings, setCookingServings] = useState<number>(1);

    // Scale the recipe for cooking mode
    const scaledCookingRecipe = cookingModeRecipe && cookingServings !== cookingModeRecipe.servings
        ? scaleRecipe(cookingModeRecipe, cookingServings)
        : cookingModeRecipe;

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

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCookingServings(r.servings);
                                                        setCookingModeRecipe(r);
                                                    }}
                                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                                    title="View Instructions"
                                                >
                                                    <BookOpen size={16} />
                                                </button>

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

            {/* Cooking Mode - Full Screen Instructions */}
            {cookingModeRecipe && scaledCookingRecipe && (
                <div className="fixed inset-0 bg-gray-950 z-[200] overflow-y-auto">
                    <div className="min-h-screen p-6 md:p-12">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-2">{scaledCookingRecipe.name}</h1>
                                <div className="flex items-center gap-3">
                                    <label className="text-xl text-gray-400">Servings:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={cookingServings}
                                        onChange={(e) => setCookingServings(parseInt(e.target.value) || 1)}
                                        className="w-20 text-2xl font-bold bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-center focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (onEditRecipe) {
                                            onEditRecipe(cookingModeRecipe);
                                        }
                                        setCookingModeRecipe(null);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                                    title="Edit Recipe"
                                >
                                    <Edit size={24} />
                                    <span className="text-lg">Edit</span>
                                </button>
                                <button
                                    onClick={() => setCookingModeRecipe(null)}
                                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <X size={32} />
                                </button>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-6 text-blue-400">Ingredients</h2>
                            <div className="space-y-3">
                                {scaledCookingRecipe.ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex items-baseline gap-4 text-xl">
                                        <span className="font-mono text-gray-500 w-8">•</span>
                                        <span className="font-bold text-blue-300 w-20 text-right">
                                            {ing.quantity}
                                        </span>
                                        <span className="text-gray-400 w-24">{ing.unit}</span>
                                        <span className="flex-1">{ing.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div>
                            <h2 className="text-3xl font-bold mb-6 text-green-400">Instructions</h2>
                            <div className="space-y-6">
                                {(scaledCookingRecipe.instructions || '').split('\n').filter(line => line.trim()).map((step, idx) => {
                                    // Remove leading numbers like "1.", "2.", etc. from the step text
                                    const cleanStep = step.trim().replace(/^\d+\.\s*/, '');
                                    return (
                                        <div key={idx} className="flex gap-6">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-xl font-bold">
                                                {idx + 1}
                                            </div>
                                            <p className="flex-1 text-2xl leading-relaxed pt-2">
                                                {cleanStep}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
