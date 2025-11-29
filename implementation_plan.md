# Grocermator Implementation Plan

## Goal Description
Build a personal grocery planning application that allows users to manage recipes, generate random meal plans to minimize waste, and calculate shopping lists. The app will be client-side only, hosted on GitHub Pages, and use LocalStorage for persistence with JSON import/export capabilities.

## User Review Required
> [!IMPORTANT]
> The application will be purely client-side. Data will be stored in the browser's LocalStorage. Clearing browser data will wipe the app's data unless exported first.

## Proposed Changes

### Tech Stack
- **Framework**: React + Vite (TypeScript)
- **Styling**: Vanilla CSS (CSS Variables for theming)
- **State Management**: React Context + Hooks
- **Persistence**: LocalStorage + File API for Import/Export

### Architecture
The app will consist of a main `App` component wrapping a `DataProvider` that manages the state of Recipes and the current Meal Plan.

### Components

#### [NEW] `src/types.ts`
Define core data types:
- `Ingredient`: { name: string, quantity: number, unit: string }
- `Recipe`: { id: string, name: string, ingredients: Ingredient[] }
- `MealPlan`: { id: string, date: Date, recipes: Recipe[] }

#### [NEW] `src/context/DataContext.tsx`
- Manages `recipes` and `mealPlan` state.
- Handles `useEffect` to load/save to `localStorage`.
- Provides `exportData` and `importData` functions.

#### [NEW] `src/utils/planner.ts`
- `generateMealPlan(recipes, days, preferences)`: Logic to randomly select recipes.
- `calculateShoppingList(mealPlan)`: Logic to aggregate ingredients and minimize waste (e.g., summing up "0.5 tomato" + "0.5 tomato" = "1 tomato").

#### [NEW] `src/components/RecipeList.tsx`
- List view of recipes.
- Add/Edit/Delete functionality.

#### [NEW] `src/components/MealPlanner.tsx`
- Controls for generating a plan (number of days/meals).
- Display of generated plan.

#### [NEW] `src/components/ShoppingList.tsx`
- Read-only view of aggregated ingredients.

#### [NEW] `src/App.tsx` & `src/index.css`
- Main layout with navigation/tabs.
- Global styles for the "Premium" aesthetic (Glassmorphism, dark mode friendly).

## Verification Plan

### Automated Tests
- N/A for this rapid prototype, will focus on manual verification.

### Manual Verification
- **Data Persistence**: Reload page to ensure data stays.
- **Import/Export**: Export data, clear local storage, import data, verify restoration.
- **Logic Check**: Create two recipes with "0.5 onion" each. Generate a plan including both. Verify shopping list shows "1 onion".
