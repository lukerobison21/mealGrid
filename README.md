# MealGrid

MealGrid is a Tron Legacy-inspired meal-planning prototype for tracking a digital pantry, estimating meal costs, and building a weekly plan.

## Run locally

This is a static HTML, CSS, and JavaScript prototype. From the project directory, start a local server:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Prototype flow

- Add or update ingredient quantities in the digital pantry.
- Review recipe ingredient availability against pantry stock.
- Add or remove meals from the dashboard's weekly plan.
- See estimated weekly cost, pantry coverage, and the shopping list update.

Demo pantry and plan data are stored in the browser's local storage. Recipe prices and the weekly budget are sample values in `app.js`; this prototype does not use a backend or sync data between browsers.

## Pages

- `index.html` — weekly dashboard, budget, pantry coverage, and shopping list
- `pantry.html` — pantry inventory and add/update form
- `recipe.html` — recipe ingredients, pantry match, and add-to-plan action
- `onboarding.html`, `import.html`, and `group.html` — visual flow prototypes
- `meal-app-wireframes.html` — interactive wireframe and theme concepts
