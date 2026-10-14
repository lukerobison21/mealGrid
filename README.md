# MealGrid

MealGrid is a meal-planning prototype with a digital pantry. It explores how a weekly plan, ingredient availability, and estimated food costs can work together in a single interface. The visual style takes cues from sci-fi HUDs.

## Current status

This is a front-end prototype built with plain HTML, CSS, and JavaScript. The working flows are:

- **Weekly dashboard:** view the planned meals, estimated weekly cost against a sample $65 budget, pantry coverage, and ingredients that are short.
- **Digital pantry:** add or update an ingredient and its quantity, unit, and category; filter items by category or low stock.
- **Recipe detail and planning:** compare the sample recipe's ingredients with pantry stock, choose an open day and servings, and add it to the weekly plan.
- **Plan editing:** change a planned meal's day or servings, or remove it. The dashboard recalculates cost, pantry coverage, and shopping needs.
- **Local persistence:** pantry and plan data are saved in browser `localStorage` on the current browser and device.

The app starts with sample pantry contents, a sample weekly plan, and four hard-coded recipes in `app.js`. Prices, calories, and the weekly budget are demo values. There is no account, backend, or cross-device synchronization.

## Pages

| File | Purpose | Current behavior |
| --- | --- | --- |
| `index.html` | Weekly dashboard | Live plan, budget estimate, pantry coverage, and shopping needs |
| `pantry.html` | Digital pantry | Add/update inventory and filter the list |
| `recipe.html` | Garlic Sesame Stir Fry details | Show ingredient availability and schedule the recipe |
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

## Project files

- `app.js` — sample recipes, pantry and plan state, local storage, calculations, and page interactions
- `styles.css` — shared styling for the primary prototype pages
- `files/` — additional page and stylesheet copies/design artifacts
- `meal-app-wireframes.html` — standalone interactive wireframe and theme exploration

## Direction for future work

The current screens point toward these possible next steps; they are concepts, not implemented features:

1. Make onboarding interactive and save dietary preferences, goals, and household size.
2. Build recipe import for supported website links, social links, and images, with an editable review step before saving.
3. Add a recipe library and let people create and edit recipes instead of using a fixed sample set.
4. Connect group size and serving adjustments to ingredient quantities, pantry usage, and the weekly plan.
5. Improve shopping lists with item check-off, consolidated quantities, and store-ready organization.
6. Replace sample nutrition and price figures with configurable or sourced data, and consider user accounts and cloud sync if persistent multi-device use is needed.

## Prototype limitations

- Data is stored only in this browser's local storage; clearing site data resets the demo.
- Recipe catalog, nutrition, prices, and budget are fixed sample data.
- Pantry quantities are not automatically consumed when meals are planned or completed.
- Import, goal calculations, household profiles, and group planning are mockups.
- The `files/` directory contains additional project artifacts; the root-level pages are the runnable prototype described above.
