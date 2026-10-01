(() => {
  const STORAGE_KEY = 'mealgrid-demo-v1';
  const WEEK_BUDGET = 65;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const recipes = [
    {
      id: 'overnight-oats',
      name: 'Overnight Oats + Berries',
      calories: 410,
      ingredients: [
        { name: 'Rolled Oats', quantity: 1, unit: 'cup', unitCost: 0.25 },
        { name: 'Berries', quantity: 0.5, unit: 'cup', unitCost: 1.6 }
      ]
    },
    {
      id: 'chicken-bowl',
      name: 'Chicken Bowl',
      calories: 612,
      ingredients: [
        { name: 'Chicken Breast', quantity: 6, unit: 'oz', unitCost: 0.4 },
        { name: 'Brown Rice', quantity: 0.5, unit: 'cup', unitCost: 0.5 },
        { name: 'Broccoli', quantity: 0.5, unit: 'cup', unitCost: 0.5 }
      ]
    },
    {
      id: 'sesame-stir-fry',
      name: 'Garlic Sesame Stir Fry',
      calories: 612,
      ingredients: [
        { name: 'Broccoli', quantity: 1, unit: 'cup', unitCost: 0.5 },
        { name: 'Sesame Oil', quantity: 1, unit: 'tbsp', unitCost: 0.3 },
        { name: 'Chicken Thigh', quantity: 6, unit: 'oz', unitCost: 0.5 },
        { name: 'Soy Sauce', quantity: 2, unit: 'tbsp', unitCost: 0.1 }
      ]
    },
    {
      id: 'yogurt-bowl',
      name: 'Greek Yogurt Bowl',
      calories: 320,
      ingredients: [
        { name: 'Greek Yogurt', quantity: 1, unit: 'cup', unitCost: 0.9 },
        { name: 'Berries', quantity: 0.5, unit: 'cup', unitCost: 1.6 }
      ]
    }
  ];

  const initialState = {
    pantry: [
      { name: 'Chicken Breast', quantity: 24, unit: 'oz', category: 'Protein' },
      { name: 'Brown Rice', quantity: 2, unit: 'cup', category: 'Pantry Staples' },
      { name: 'Broccoli', quantity: 2, unit: 'cup', category: 'Produce' },
      { name: 'Sesame Oil', quantity: 3, unit: 'tbsp', category: 'Pantry Staples' },
      { name: 'Greek Yogurt', quantity: 2, unit: 'cup', category: 'Dairy' },
      { name: 'Rolled Oats', quantity: 2, unit: 'cup', category: 'Pantry Staples' },
      { name: 'Berries', quantity: 1, unit: 'cup', category: 'Produce' }
    ],
    plan: [
      { day: 'Mon', recipeId: 'overnight-oats' },
      { day: 'Tue', recipeId: 'chicken-bowl' },
      { day: 'Thu', recipeId: 'yogurt-bowl' }
    ]
  };

  const notice = document.querySelector('#app-notice');
  let state;

  function showNotice(message, isError = false) {
    if (!notice) return;
    notice.textContent = message;
    notice.classList.toggle('is-error', isError);
    notice.hidden = false;
    if (!isError) {
      window.setTimeout(() => { notice.hidden = true; }, 3200);
    }
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) return structuredClone(initialState);
      const parsed = JSON.parse(stored);
      if (!parsed || !Array.isArray(parsed.pantry) || !Array.isArray(parsed.plan)) {
        throw new Error('Saved MealGrid data has an unexpected format.');
      }
      return parsed;
    } catch (error) {
      console.error('Could not load MealGrid data.', error);
      showNotice('Could not read saved data. This prototype needs browser storage enabled; your current changes may not persist.', true);
      return structuredClone(initialState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Could not save MealGrid data.', error);
      showNotice('Could not save changes to browser storage. Check storage settings and try again.', true);
      return false;
    }
  }

  function recipeById(id) {
    return recipes.find((recipe) => recipe.id === id);
  }

  function findPantryItem(name, unit) {
    return state.pantry.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.unit === unit);
  }

  function recipeCost(recipe) {
    return recipe.ingredients.reduce((total, ingredient) => total + ingredient.quantity * ingredient.unitCost, 0);
  }

  function plannedRequirements() {
    const totals = new Map();
    for (const entry of state.plan) {
      const recipe = recipeById(entry.recipeId);
      if (!recipe) continue;
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name.toLowerCase()}|${ingredient.unit}`;
        const existing = totals.get(key);
        if (existing) {
          existing.quantity += ingredient.quantity;
        } else {
          totals.set(key, { ...ingredient });
        }
      }
    }
    return [...totals.values()];
  }

  function shortages() {
    return plannedRequirements().flatMap((ingredient) => {
      const item = findPantryItem(ingredient.name, ingredient.unit);
      const available = item ? item.quantity : 0;
      if (available >= ingredient.quantity) return [];
      return [{ ...ingredient, missing: ingredient.quantity - available }];
    });
  }

  function formatQuantity(quantity) {
    return Number(quantity.toFixed(2)).toString();
  }

  function renderDashboard() {
    const planContainer = document.querySelector('#weekly-plan');
    if (!planContainer) return;
    const requirements = plannedRequirements();
    const shortItems = shortages();
    const covered = requirements.length - shortItems.length;
    const coverage = requirements.length ? Math.round((covered / requirements.length) * 100) : 0;
    const weeklyCost = state.plan.reduce((total, entry) => {
      const recipe = recipeById(entry.recipeId);
      return total + (recipe ? recipeCost(recipe) : 0);
    }, 0);

    document.querySelector('#weekly-cost').textContent = `$${weeklyCost.toFixed(2)}`;
    document.querySelector('#budget-caption').textContent =
      `Budget $${WEEK_BUDGET.toFixed(2)} · $${Math.max(0, WEEK_BUDGET - weeklyCost).toFixed(2)} remaining`;
    document.querySelector('#budget-bar').style.width =
      `${Math.min(100, (weeklyCost / WEEK_BUDGET) * 100)}%`;
    document.querySelector('#coverage-ring').style.setProperty('--coverage', `${coverage}%`);
    document.querySelector('#pantry-coverage').textContent =
      `${covered} of ${requirements.length} planned ingredients on hand`;

    planContainer.replaceChildren();
    document.querySelector('#empty-plan').hidden = state.plan.length > 0;
    const sortedPlan = [...state.plan].sort((left, right) => DAYS.indexOf(left.day) - DAYS.indexOf(right.day));
    for (const entry of sortedPlan) {
      const recipe = recipeById(entry.recipeId);
      if (!recipe) continue;
      const missingCount = recipe.ingredients.filter((ingredient) => {
        const item = findPantryItem(ingredient.name, ingredient.unit);
        return !item || item.quantity < ingredient.quantity;
      }).length;
      const row = document.createElement('div');
      row.className = 'list-row';
      const description = document.createElement('span');
      description.textContent = `${entry.day} — ${recipe.name} · ${recipe.calories} kcal`;
      const details = document.createElement('span');
      details.className = missingCount ? 'tag-needed' : 'dim';
      details.textContent = missingCount
        ? `Missing ${missingCount} ${missingCount === 1 ? 'item' : 'items'} · $${recipeCost(recipe).toFixed(2)}`
        : `$${recipeCost(recipe).toFixed(2)}`;
      const remove = document.createElement('button');
      remove.className = 'btn btn-ghost btn-remove';
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${recipe.name} from ${entry.day}`);
      remove.addEventListener('click', () => {
        state.plan = state.plan.filter((candidate) => candidate !== entry);
        saveState();
        renderAll();
      });
      row.append(description, details, remove);
      planContainer.append(row);
    }

    const shoppingList = document.querySelector('#shopping-list');
    shoppingList.replaceChildren();
    document.querySelector('#empty-shopping-list').hidden = shortItems.length > 0;
    for (const ingredient of shortItems) {
      const row = document.createElement('div');
      row.className = 'list-row';
      const name = document.createElement('span');
      name.textContent = ingredient.name;
      const quantity = document.createElement('span');
      quantity.className = 'dim';
      quantity.textContent = `${formatQuantity(ingredient.missing)} ${ingredient.unit} needed`;
      row.append(name, quantity);
      shoppingList.append(row);
    }
  }

  let activePantryFilter = 'all';

  function renderPantry() {
    const container = document.querySelector('#pantry-items');
    if (!container) return;
    const lowStockCount = state.pantry.filter((item) => item.quantity <= 1).length;
    document.querySelector('#pantry-summary').textContent =
      `${state.pantry.length} items · ${lowStockCount} low stock (1 unit or less)`;
    container.replaceChildren();
    const visibleItems = state.pantry.filter((item) => {
      if (activePantryFilter === 'low') return item.quantity <= 1;
      return activePantryFilter === 'all' || item.category === activePantryFilter;
    });
    if (!visibleItems.length) {
      const empty = document.createElement('p');
      empty.className = 'dim';
      empty.textContent = 'No pantry items match this filter.';
      container.append(empty);
      return;
    }
    for (const item of visibleItems) {
      const card = document.createElement('div');
      card.className = `panel pantry-card${item.quantity <= 1 ? ' is-low' : ''}`;
      const name = document.createElement('div');
      name.className = 'label';
      name.textContent = item.name;
      const quantity = document.createElement('p');
      quantity.className = item.quantity <= 1 ? 'tag-needed' : 'dim';
      quantity.style.marginTop = '6px';
      quantity.textContent = `${formatQuantity(item.quantity)} ${item.unit} on hand${item.quantity <= 1 ? ' · Low stock' : ''}`;
      const category = document.createElement('p');
      category.className = 'dim category';
      category.textContent = item.category;
      card.append(name, quantity, category);
      container.append(card);
    }
  }

  function renderRecipe() {
    const container = document.querySelector('#recipe-ingredients');
    if (!container) return;
    const recipe = recipeById('sesame-stir-fry');
    container.replaceChildren();
    for (const ingredient of recipe.ingredients) {
      const item = findPantryItem(ingredient.name, ingredient.unit);
      const available = item ? item.quantity : 0;
      const row = document.createElement('div');
      row.className = 'list-row';
      const name = document.createElement('span');
      name.textContent = `${ingredient.name}, ${formatQuantity(ingredient.quantity)} ${ingredient.unit}`;
      const status = document.createElement('span');
      status.className = available >= ingredient.quantity ? 'tag-ok' : 'tag-needed';
      status.textContent = available >= ingredient.quantity
        ? `In Pantry · ${formatQuantity(available)} ${ingredient.unit}`
        : `Need ${formatQuantity(ingredient.quantity - available)} ${ingredient.unit}`;
      row.append(name, status);
      container.append(row);
    }
    document.querySelector('#recipe-cost').textContent = `$${recipeCost(recipe).toFixed(2)}`;
    const plannedCount = state.plan.filter((entry) => entry.recipeId === recipe.id).length;
    document.querySelector('#recipe-plan-status').textContent = plannedCount
      ? `Scheduled ${plannedCount} ${plannedCount === 1 ? 'time' : 'times'} this week.`
      : 'Not yet in this week’s plan.';
  }

  function renderAll() {
    renderDashboard();
    renderPantry();
    renderRecipe();
  }

  function bindPantryForm() {
    const form = document.querySelector('#pantry-form');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get('name')).trim();
      const quantity = Number(formData.get('quantity'));
      if (!name || !Number.isFinite(quantity) || quantity < 0) {
        showNotice('Enter an ingredient name and a valid non-negative quantity.', true);
        return;
      }
      const unit = String(formData.get('unit'));
      const category = String(formData.get('category'));
      const existing = state.pantry.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.name = name;
        existing.quantity = quantity;
        existing.unit = unit;
        existing.category = category;
      } else {
        state.pantry.push({ name, quantity, unit, category });
      }
      const saved = saveState();
      form.reset();
      renderAll();
      if (saved) {
        showNotice(`${name} saved to your pantry.`);
      }
    });

    document.querySelectorAll('[data-pantry-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        activePantryFilter = button.dataset.pantryFilter;
        document.querySelectorAll('[data-pantry-filter]').forEach((filter) => {
          filter.classList.toggle('is-active', filter === button);
          filter.setAttribute('aria-pressed', String(filter === button));
        });
        renderPantry();
      });
    });
  }

  function bindRecipeButton() {
    const button = document.querySelector('#add-recipe-to-plan');
    if (!button) return;
    button.addEventListener('click', () => {
      const usedDays = new Set(state.plan.map((entry) => entry.day));
      const day = DAYS.find((candidate) => !usedDays.has(candidate));
      if (!day) {
        showNotice('Your weekly plan is full. Remove a meal from the dashboard to make room.', true);
        return;
      }
      state.plan.push({ day, recipeId: 'sesame-stir-fry' });
      const saved = saveState();
      renderAll();
      if (saved) {
        showNotice(`Garlic Sesame Stir Fry added to ${day}’s plan.`);
      }
    });
  }

  state = loadState();
  bindPantryForm();
  bindRecipeButton();
  renderAll();
})();
