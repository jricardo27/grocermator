# Grocermator Implementation Plan

## Goal Description

Build a personal grocery planning application that allows users to manage recipes, generate random meal plans to minimize waste, and calculate shopping lists. The app will be client-side only, hosted on GitHub Pages, and use LocalStorage for persistence with JSON import/export capabilities.

## User Review Required
>
> [!IMPORTANT]
> The application will be purely client-side. Data will be stored in the browser's LocalStorage. Clearing browser data will wipe the app's data unless exported first.

---

## Phase 1: Core Features ✅ COMPLETED

### Tech Stack

- ✅ **Framework**: React + Vite (TypeScript)
- ✅ **Styling**: Tailwind CSS
- ✅ **State Management**: React Context + Hooks
- ✅ **Persistence**: LocalStorage + File API for Import/Export

### Architecture

- ✅ Main `App` component wrapping a `DataProvider` that manages the state of Recipes and Meal Plans

### Completed Components

#### ✅ `src/types.ts`

- ✅ `Ingredient`: { name: string, quantity: number, unit: string }
- ✅ `Recipe`: { id: string, name: string, ingredients: Ingredient[] }
- ✅ `MealPlan`: { id: string, recipes: Recipe[], days: number, createdAt: string }

#### ✅ `src/context/DataContext.tsx`

- ✅ Manages `recipes` and `mealPlans` state
- ✅ Lazy initialization from `localStorage`
- ✅ Auto-save to `localStorage` on changes
- ✅ `exportData` and `importData` functions

#### ✅ `src/utils/planner.ts`

- ✅ `generateMealPlan(recipes, days)`: Random recipe selection
- ✅ `calculateShoppingListV2(mealPlan)`: Ingredient aggregation by name+unit

#### ✅ `src/components/RecipeList.tsx`

- ✅ List view of recipes
- ✅ Add/Edit/Delete functionality
- ✅ Inline editing with dynamic ingredient management
- ✅ Support for fractional quantities

#### ✅ `src/components/MealPlanner.tsx`

- ✅ Controls for generating a plan (number of days/meals)
- ✅ Display of generated plan history
- ✅ Quick access to shopping lists

#### ✅ `src/components/ShoppingList.tsx`

- ✅ Aggregated ingredients view
- ✅ Interactive checkboxes for marking items

#### ✅ `src/App.tsx` & `src/index.css`

- ✅ Main layout with sidebar navigation
- ✅ Premium dark theme with glassmorphism effects
- ✅ Import/Export UI controls

### Verification Results ✅

- ✅ **Data Persistence**: Verified - data persists across page reloads
- ✅ **Import/Export**: Verified - export/import cycle restores data correctly
- ✅ **Aggregation Logic**: Verified - fractional quantities sum correctly (0.5 + 0.5 = 1)

---

## Phase 2: Enhanced Features (Planned)

### 2.1 Unit Standardization & UX Improvements

#### [MODIFY] `src/types.ts`

- Add standardized unit types/enums
- Add unit conversion mappings

#### [NEW] `src/utils/units.ts`

- Unit conversion functions
- Standardized unit list for dropdowns
- Unit validation

#### [MODIFY] `src/components/RecipeList.tsx`

- Replace unit text input with dropdown/autocomplete
- Add unit suggestions based on ingredient type
- Validate unit compatibility

---

### 2.2 Waste Minimization System

#### [MODIFY] `src/types.ts`

Add new fields:

```typescript
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  shelfLife?: number; // days until spoilage
  packageSize?: number; // standard grocery package size
}

interface Recipe {
  // ... existing fields
  servings: number; // default: 2
}
```

#### [NEW] `src/data/ingredientDatabase.ts`

- Predefined ingredient data with shelf life
- Common package sizes from grocers
- Categorization (produce, dairy, pantry, etc.)

#### [MODIFY] `src/utils/planner.ts`

- `generateOptimizedMealPlan()`: New function that considers:
  - Shelf life of ingredients
  - Package sizes to minimize leftover waste
  - Prioritize recipes using perishable items early in the week
  - Group recipes with shared ingredients
- Add option to toggle between random vs. optimized planning

#### [NEW] `src/components/WasteAnalysis.tsx`

- Display estimated waste/spoilage for current plan
- Show which ingredients need to be used by which day
- Suggest recipe reordering to minimize waste

---

### 2.3 Recipe Enhancements

#### [MODIFY] `src/types.ts`

```typescript
interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  servings: number; // default: 2
  instructions?: string; // cooking steps
  imageUrl?: string; // link to photo
  seasonal?: SeasonalInfo;
}

interface SeasonalInfo {
  type: 'season' | 'months';
  seasons?: ('spring' | 'summer' | 'fall' | 'winter')[];
  includeMonths?: number[]; // 1-12
  excludeMonths?: number[]; // 1-12
}
```

#### [MODIFY] `src/components/RecipeList.tsx`

- Add instructions textarea
- Add image URL input field with preview
- Add seasonal selector (season names or month checkboxes)
- Show seasonal badge on recipe cards

#### [NEW] `src/components/RecipeDetail.tsx`

- Full recipe view with image, instructions, and ingredients
- Serving size adjuster (recalculate quantities)
- Print-friendly layout

---

### 2.4 Recipe Scaling

#### [NEW] `src/utils/recipeScaling.ts`

- `scaleRecipe(recipe, fromServings, toServings)`: Recalculate ingredient quantities
- Handle fractional results intelligently

#### [MODIFY] `src/components/RecipeList.tsx`

- Add serving size control to recipe cards
- Real-time quantity updates when servings change

#### [MODIFY] `src/components/MealPlanner.tsx`

- Add "Adjust Servings" option for individual recipes in plan
- Update shopping list when servings are adjusted

#### [MODIFY] `src/components/ShoppingList.tsx`

- Show which recipes contributed to each ingredient
- Allow per-recipe serving adjustments from shopping list view

---

### 2.5 Improved Meal Plan Generation

#### [MODIFY] `src/types.ts`

```typescript
interface MealPlan {
  id: string;
  recipes: Recipe[];
  days: number;
  createdAt: string;
  startDate?: string; // ISO date for when plan starts
  isFavorite?: boolean;
}
```

#### [MODIFY] `src/utils/planner.ts`

- `generateMealPlan()` improvements:
  - **No repeats**: If `recipes.length >= days`, ensure no recipe appears twice
  - **Avoid recent recipes**: Track last meal plan and avoid repeating those recipes
  - **Seasonal filtering**: Only include recipes that are in season
- Add `getRecentRecipes()`: Get recipes from the last N plans
- Add `filterSeasonalRecipes()`: Filter recipes by current date/season

#### [MODIFY] `src/components/MealPlanner.tsx`

- Add date picker for plan start date
- Add "Favorite" toggle button on plan cards
- Show seasonal indicator on recipe names
- Add "Optimize for waste reduction" checkbox

---

### 2.6 Favorites & Export Enhancements

#### [MODIFY] `src/context/DataContext.tsx`

- Add `togglePlanFavorite(planId)` function
- Add `exportFavorites()` function (exports only favorite plans)

#### [MODIFY] `src/App.tsx`

- Add "Export Favorites" button in header dropdown
- Add filter toggle to show only favorite plans

#### [NEW] `src/components/FavoritePlans.tsx`

- Dedicated view for favorite meal plans
- Quick re-generate option (create new plan with same recipes)

---

## Implementation Priority

### High Priority (Minimize Waste Focus)

1. Ingredient shelf life database
2. Optimized meal plan generation (perishables first)
3. No-repeat logic when enough recipes available
4. Avoid repeating from previous plan

### Medium Priority (UX Improvements)

5. Unit standardization with dropdown
6. Recipe scaling (servings adjustment)
7. Plan start date
8. Seasonal recipe filtering

### Lower Priority (Nice to Have)

9. Recipe instructions field
10. Image URL support
11. Favorite plans
12. Export favorites only

---

## Technical Considerations

### Data Migration

When adding new fields to existing types, need to:

- Provide default values for existing data
- Update import validation to handle old format
- Maintain backward compatibility

### Shelf Life Database

Options:

1. Hardcoded JSON file in `src/data/`
2. User-editable with defaults
3. Hybrid: defaults + user overrides

**Recommendation**: Start with hardcoded defaults, add user override capability later.

### Unit Conversion

Complex feature - start simple:

- Phase 1: Standardized dropdown (no conversion)
- Phase 2: Basic conversions within same system (tsp → tbsp → cup)
- Phase 3: Metric ↔ Imperial conversion

---

## Verification Plan (Phase 2)

### Waste Minimization

- [ ] Create plan with mix of perishable and shelf-stable ingredients
- [ ] Verify perishable items scheduled early in week
- [ ] Check waste analysis shows accurate spoilage warnings

### Recipe Scaling

- [ ] Create recipe for 2 servings
- [ ] Adjust to 4 servings, verify quantities doubled
- [ ] Generate plan with adjusted recipe, verify shopping list reflects changes

### No-Repeat Logic

- [ ] Create 10 recipes, generate 7-day plan
- [ ] Verify no recipe appears twice
- [ ] Generate second plan, verify no overlap with first plan

### Seasonal Filtering

- [ ] Mark recipe as "summer only"
- [ ] Generate plan in winter, verify recipe excluded
- [ ] Generate plan in summer, verify recipe included

### Favorites

- [ ] Mark plan as favorite
- [ ] Export favorites, verify only favorite plans exported
- [ ] Import favorites, verify they restore correctly
