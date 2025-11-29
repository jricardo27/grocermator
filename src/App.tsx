import React, { useState, useRef } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { RecipeList } from './components/RecipeList';
import { MealPlanner } from './components/MealPlanner';
import { ShoppingList } from './components/ShoppingList';
import { ChefHat, Calendar, Download, Upload } from 'lucide-react';

const AppContent: React.FC = () => {
  const { exportData, importData } = useData();
  const [view, setView] = useState<'recipes' | 'planner' | 'shopping-list'>('recipes');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importData(file);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data: ' + err);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans selection:bg-blue-500 selection:text-white">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ChefHat size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Grocermator
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={exportData} className="p-2 text-gray-400 hover:text-white transition-colors" title="Export Data">
              <Download size={20} />
            </button>
            <button onClick={handleImportClick} className="p-2 text-gray-400 hover:text-white transition-colors" title="Import Data">
              <Upload size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".json"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 flex-shrink-0 space-y-2">
            <button
              onClick={() => setView('recipes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'recipes'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <ChefHat size={20} />
              <span className="font-medium">Recipes</span>
            </button>
            <button
              onClick={() => setView('planner')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === 'planner' || view === 'shopping-list'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Calendar size={20} />
              <span className="font-medium">Meal Planner</span>
            </button>
          </nav>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {view === 'recipes' && <RecipeList />}
            {view === 'planner' && (
              <MealPlanner onSelectPlan={(id) => {
                setSelectedPlanId(id);
                setView('shopping-list');
              }} />
            )}
            {view === 'shopping-list' && selectedPlanId && (
              <ShoppingList
                planId={selectedPlanId}
                onBack={() => setView('planner')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
