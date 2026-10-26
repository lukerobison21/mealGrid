# MealGrid

MealGrid is a meal-planning prototype with a digital pantry. It explores how a weekly plan, ingredient availability, and estimated food costs can work together in a single interface. The visual style takes cues from sci-fi HUDs.

## Current status

This is a front-end prototype built with plain HTML, CSS, and JavaScript. The working flows are:

- **Weekly dashboard:** view the planned meals, estimated weekly cost against a sample $65 budget, pantry coverage, and ingredients that are short.
- **Digital pantry:** add or update an ingredient and its quantity, unit, and category; filter items by category or low stock.
- **Recipe library:** browse every saved recipe, search by name, ingredient, or tag, and filter by tag or by what is in this week's plan.
- **Add and edit recipes:** create or edit a recipe's name, servings, prep and cook time, optional calories, tags, ingredients (name, quantity, unit, and estimated cost per unit, with rows you can add and remove), and steps. The form validates input and shows a live cost estimate. Recipes can be deleted after a confirmation; deleting one also removes it from the plan.
- **Recipe detail and planning:** open any recipe (`recipe.html?id=<recipe-id>`) to compare its ingredients with pantry stock, read its steps, see similar recipes by shared tags, choose an open day and servings, and add it to the weekly plan.
- **Plan editing:** change a planned meal's day or servings, or remove it. The dashboard recalculates cost, pantry coverage, and shopping needs.
- **Local persistence:** recipes, pantry, and plan data are saved in browser `localStorage` on the current browser and device.

The app starts with sample pantry contents, a sample weekly plan, and four sample recipes defined in `app.js`. The sample recipes are copied into the library on first load, and browsers with data saved by an earlier version get them added automatically, so existing plans keep working. Prices, calories, and the weekly budget are demo values. There is no account, backend, or cross-device synchronization.

## Pages

| File | Purpose | Current behavior |
| --- | --- | --- |
| `index.html` | Weekly dashboard | Live plan, budget estimate, pantry coverage, and shopping needs |
| `pantry.html` | Digital pantry | Add/update inventory and filter the list |
| `recipes.html` | Recipe library | Search, filter, view, edit, and delete saved recipes |
| `recipe-edit.html` | Add/edit recipe form | `recipe-edit.html` adds a recipe; `?id=<recipe-id>` edits one |
| `recipe.html` | Recipe detail | `?id=<recipe-id>` shows a recipe's pantry match, steps, and scheduling (defaults to the first recipe) |
| `onboarding.html` | Goal setup concept | Static screen with sample goals and nutrition targets |
| `import.html` | Recipe import concept | Static import preview; it does not parse or save a URL |
| `group.html` | Group planning concept | Static family scaling example; it does not update the plan |
| `meal-app-wireframes.html` | Responsive design exploration | Switch between mobile/web layouts, screens, and color themes |

The onboarding, import, and group-planning pages are visual prototypes. Their controls and sample figures are not connected to the working pantry and meal-plan state. The wireframe page is a separate concept demo, not the production app flow.

## Run locally

No package installation or build step is required. From the project root, start a static server:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in a browser. You can also open `index.html` directly, though using a local server is the more reliable option for browser storage behavior.

## Recipe data model

Each recipe is stored like this (see `sampleRecipes` in `app.js`):

```js
{
  id: 'sesame-stir-fry',          // generated from the name; stays the same when the recipe is renamed
  name: 'Garlic Sesame Stir Fry',
  servings: 1,                    // how many servings the ingredient list makes
  prepMinutes: 10,
  cookMinutes: 15,
  calories: 612,                  // per serving; null when unknown
  tags: ['dinner', 'quick'],
  ingredients: [{ name: 'Broccoli', quantity: 1, unit: 'cup', unitCost: 0.5 }],
  steps: ['Slice the chicken thigh into bite-sized strips.']
}
```

Ingredient quantities describe the whole batch. Costs, calories, pantry coverage, and shopping needs on the dashboard are scaled per serving, so a recipe that makes 4 servings and is planned for 2 uses half of its ingredients. Pantry matching compares ingredient name (case-insensitive) and unit, so recipe ingredients should use the same units as the pantry.

## Project files

- `app.js` — sample data, recipe/pantry/plan state, local storage and migration, calculations, recipe validation, and page interactions
- `styles.css` — shared styling for the primary prototype pages
- `files/` — additional page and stylesheet copies/design artifacts
- `meal-app-wireframes.html` — standalone interactive wireframe and theme exploration

## Direction for future work

The current screens point toward these possible next steps; they are concepts, not implemented features:

1. Make onboarding interactive and save dietary preferences, goals, and household size.
2. Build recipe import for supported website links, social links, and images, using the recipe form as the editable review step before saving.
3. Connect group size and serving adjustments to ingredient quantities, pantry usage, and the weekly plan.
4. Improve shopping lists with item check-off, consolidated quantities, and store-ready organization.
5. Replace sample nutrition and price figures with configurable or sourced data, and consider user accounts and cloud sync if persistent multi-device use is needed.

## Prototype limitations

- Data is stored only in this browser's local storage; clearing site data resets the demo.
- Nutrition and prices are values entered by hand (or sample data), and the weekly budget is fixed.
- Pantry matching needs identical ingredient names and units; there is no unit conversion (for example, oz to lb).
- Pantry quantities are not automatically consumed when meals are planned or completed.
- Import, goal calculations, household profiles, and group planning are mockups.
- The `files/` directory contains additional project artifacts; the root-level pages are the runnable prototype described above.
