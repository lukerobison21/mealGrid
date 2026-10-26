(() => {
  const STORAGE_KEY = 'mealgrid-demo-v1';
  const WEEK_BUDGET = 65;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Each recipe lists ingredient quantities for the whole batch (`servings`
  // portions). Calories and costs shown in the UI are per serving.
  const sampleRecipes = [
    {
      id: 'overnight-oats',
      name: 'Overnight Oats + Berries',
      servings: 1,
      prepMinutes: 5,
      cookMinutes: 0,
      calories: 410,
      tags: ['breakfast', 'vegetarian', 'make-ahead'],
      ingredients: [
        { name: 'Rolled Oats', quantity: 1, unit: 'cup', unitCost: 0.25 },
        { name: 'Berries', quantity: 0.5, unit: 'cup', unitCost: 1.6 }
      ],
      steps: [
        'Stir the oats with an equal amount of milk or water in a jar.',
        'Cover and refrigerate overnight.',
        'Top with berries before serving.'
      ]
    },
    {
      id: 'chicken-bowl',
      name: 'Chicken Bowl',
      servings: 1,
      prepMinutes: 10,
      cookMinutes: 25,
      calories: 612,
      tags: ['high-protein', 'meal-prep'],
      ingredients: [
        { name: 'Chicken Breast', quantity: 6, unit: 'oz', unitCost: 0.4 },
        { name: 'Brown Rice', quantity: 0.5, unit: 'cup', unitCost: 0.5 },
        { name: 'Broccoli', quantity: 0.5, unit: 'cup', unitCost: 0.5 }
      ],
      steps: [
        'Cook the brown rice according to the package.',
        'Season and pan-sear the chicken until cooked through, then slice.',
        'Steam the broccoli and assemble everything in a bowl.'
      ]
    },
    {
      id: 'sesame-stir-fry',
      name: 'Garlic Sesame Stir Fry',
      servings: 1,
      prepMinutes: 10,
      cookMinutes: 15,
      calories: 612,
      tags: ['dinner', 'high-protein', 'quick'],
      ingredients: [
        { name: 'Broccoli', quantity: 1, unit: 'cup', unitCost: 0.5 },
        { name: 'Sesame Oil', quantity: 1, unit: 'tbsp', unitCost: 0.3 },
        { name: 'Chicken Thigh', quantity: 6, unit: 'oz', unitCost: 0.5 },
        { name: 'Soy Sauce', quantity: 2, unit: 'tbsp', unitCost: 0.1 }
      ],
      steps: [
        'Slice the chicken thigh into bite-sized strips.',
        'Heat the sesame oil in a wok and sear the chicken until browned.',
        'Add the broccoli and soy sauce and stir fry until tender-crisp.'
      ]
    },
    {
      id: 'yogurt-bowl',
      name: 'Greek Yogurt Bowl',
      servings: 1,
      prepMinutes: 5,
      cookMinutes: 0,
      calories: 320,
      tags: ['breakfast', 'vegetarian', 'quick'],
      ingredients: [
        { name: 'Greek Yogurt', quantity: 1, unit: 'cup', unitCost: 0.9 },
        { name: 'Berries', quantity: 0.5, unit: 'cup', unitCost: 1.6 }
      ],
      steps: [
        'Spoon the yogurt into a bowl.',
        'Top with berries and serve.'
      ]
    }
  ];

  const initialState = {
    recipes: sampleRecipes,
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
  let needsMigrationSave = false;

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
      if (parsed.recipes === undefined) {
        // Data saved before the recipe library existed: seed the sample recipes
        // so existing plan entries keep pointing at the same recipe ids.
        parsed.recipes = structuredClone(sampleRecipes);
        needsMigrationSave = true;
      } else if (!Array.isArray(parsed.recipes)) {
        throw new Error('Saved MealGrid recipes have an unexpected format.');
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
    return state.recipes.find((recipe) => recipe.id === id);
  }

  function findPantryItem(name, unit) {
    return state.pantry.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.unit === unit);
  }

  function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
  }

  /** Number of servings the recipe's ingredient list makes. */
  function recipeYield(recipe) {
    return isPositiveInteger(recipe.servings) ? recipe.servings : 1;
  }

  /** Quantity of one ingredient needed for a single serving. */
  function perServingQuantity(recipe, ingredient) {
    return ingredient.quantity / recipeYield(recipe);
  }

  /** Estimated cost of the whole batch. */
  function recipeCost(recipe) {
    return recipe.ingredients.reduce((total, ingredient) => total + ingredient.quantity * ingredient.unitCost, 0);
  }

  function costPerServing(recipe) {
    return recipeCost(recipe) / recipeYield(recipe);
  }

  /** Servings planned for a plan entry (defaults to 1 for older saved data). */
  function servingsFor(entry) {
    return isPositiveInteger(entry.servings) ? entry.servings : 1;
  }

  function costForPlanEntry(recipe, entry) {
    return costPerServing(recipe) * servingsFor(entry);
  }

  function pluralize(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  /** "612 kcal" for the given servings, or an empty string when calories are unknown. */
  function caloriesLabel(recipe, servings = 1) {
    return Number.isFinite(recipe.calories) ? `${Math.round(recipe.calories * servings)} kcal` : '';
  }

  function plannedRequirements() {
    const totals = new Map();
    for (const entry of state.plan) {
      const recipe = recipeById(entry.recipeId);
      if (!recipe) continue;
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.name.toLowerCase()}|${ingredient.unit}`;
        const needed = perServingQuantity(recipe, ingredient) * servingsFor(entry);
        const existing = totals.get(key);
        if (existing) {
          existing.quantity += needed;
        } else {
          totals.set(key, { ...ingredient, quantity: needed });
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
      return total + (recipe ? costForPlanEntry(recipe, entry) : 0);
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
      const servings = servingsFor(entry);
      const missingCount = recipe.ingredients.filter((ingredient) => {
        const item = findPantryItem(ingredient.name, ingredient.unit);
        return !item || item.quantity < perServingQuantity(recipe, ingredient) * servings;
      }).length;
      const row = document.createElement('div');
      row.className = 'list-row';
      const description = document.createElement('span');
      const recipeLink = document.createElement('a');
      recipeLink.href = recipeUrl(recipe);
      recipeLink.textContent = recipe.name;
      description.append(
        `${entry.day} — `,
        recipeLink,
        [pluralize(servings, 'serving'), caloriesLabel(recipe, servings)].filter(Boolean).map((part) => ` · ${part}`).join('')
      );
      const details = document.createElement('span');
      details.className = missingCount ? 'tag-needed' : 'dim';
      details.textContent = missingCount
        ? `Missing ${missingCount} ${missingCount === 1 ? 'item' : 'items'} · $${costForPlanEntry(recipe, entry).toFixed(2)}`
        : `$${costForPlanEntry(recipe, entry).toFixed(2)}`;
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
      const edit = document.createElement('details');
      edit.className = 'plan-edit';
      const editSummary = document.createElement('summary');
      editSummary.textContent = 'Edit';
      const editForm = document.createElement('form');
      editForm.className = 'plan-edit-form';
      const dayLabel = document.createElement('label');
      dayLabel.className = 'field';
      const dayLabelText = document.createElement('span');
      dayLabelText.className = 'label';
      dayLabelText.textContent = 'Day';
      const daySelect = document.createElement('select');
      daySelect.name = 'day';
      daySelect.required = true;
      populatePlanDays(daySelect, entry);
      dayLabel.append(dayLabelText, daySelect);

      const servingsLabel = document.createElement('label');
      servingsLabel.className = 'field';
      const servingsLabelText = document.createElement('span');
      servingsLabelText.className = 'label';
      servingsLabelText.textContent = 'Servings';
      const servingsInput = document.createElement('input');
      servingsInput.name = 'servings';
      servingsInput.type = 'number';
      servingsInput.min = '1';
      servingsInput.max = '12';
      servingsInput.step = '1';
      servingsInput.value = String(servings);
      servingsInput.required = true;
      servingsLabel.append(servingsLabelText, servingsInput);

      const saveChanges = document.createElement('button');
      saveChanges.className = 'btn btn-primary';
      saveChanges.type = 'submit';
      saveChanges.textContent = 'Save';
      editForm.append(dayLabel, servingsLabel, saveChanges);
      edit.append(editSummary, editForm);
      editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(editForm);
        const nextDay = String(formData.get('day'));
        const nextServings = Number(formData.get('servings'));
        const dayIsTaken = state.plan.some((candidate) => candidate !== entry && candidate.day === nextDay);
        if (!DAYS.includes(nextDay) || dayIsTaken) {
          showNotice('Choose a day that does not already have a planned meal.', true);
          return;
        }
        if (!Number.isInteger(nextServings) || nextServings < 1 || nextServings > 12) {
          showNotice('Choose between 1 and 12 servings.', true);
          return;
        }
        entry.day = nextDay;
        entry.servings = nextServings;
        const saved = saveState();
        renderAll();
        if (saved) showNotice(`${recipe.name} updated for ${nextDay}.`);
      });
      row.append(description, details, edit, remove);
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

  /** The recipe shown on recipe.html: `?id=` if given, otherwise the first recipe. */
  function recipeFromUrl() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id === null) return state.recipes[0] ?? null;
    return recipeById(id) ?? null;
  }

  function similarRecipes(recipe, limit = 2) {
    return state.recipes
      .filter((candidate) => candidate.id !== recipe.id)
      .map((candidate) => ({
        recipe: candidate,
        sharedTags: candidate.tags.filter((tag) => recipe.tags.includes(tag)).length
      }))
      .sort((left, right) => right.sharedTags - left.sharedTags || left.recipe.name.localeCompare(right.recipe.name))
      .slice(0, limit)
      .map((match) => match.recipe);
  }

  function renderRecipe() {
    const view = document.querySelector('#recipe-view');
    if (!view) return;
    const recipe = recipeFromUrl();
    view.hidden = !recipe;
    document.querySelector('#recipe-missing').hidden = Boolean(recipe);
    document.querySelector('#recipe-edit-link').hidden = !recipe;
    document.querySelector('#recipe-delete').hidden = !recipe;
    if (!recipe) {
      document.title = 'MealGrid — Recipe Not Found';
      document.querySelector('#recipe-meta').textContent = '';
      return;
    }

    document.title = `MealGrid — ${recipe.name}`;
    document.querySelector('#recipe-name').textContent = recipe.name;
    document.querySelector('#recipe-edit-link').href = editRecipeUrl(recipe);
    document.querySelector('#recipe-meta').textContent = [
      `Makes ${pluralize(recipeYield(recipe), 'serving')}`,
      `Prep ${recipe.prepMinutes || 0} min`,
      `Cook ${recipe.cookMinutes || 0} min`
    ].join(' · ');

    const tags = document.querySelector('#recipe-tags');
    tags.replaceChildren(...recipe.tags.map((tag) => {
      const chip = document.createElement('span');
      chip.className = 'chip chip-sm';
      chip.textContent = tag;
      return chip;
    }));

    // The pantry comparison is for the whole batch, as written in the recipe.
    document.querySelector('#recipe-ingredients-label').textContent =
      `Ingredients · Full Batch (${pluralize(recipeYield(recipe), 'serving')}) · Pantry Match`;
    const container = document.querySelector('#recipe-ingredients');
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

    document.querySelector('#recipe-steps').replaceChildren(...recipe.steps.map((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      return item;
    }));

    document.querySelector('#recipe-calories').textContent =
      Number.isFinite(recipe.calories) ? String(recipe.calories) : '—';
    document.querySelector('#recipe-cost').textContent = `$${costPerServing(recipe).toFixed(2)}`;

    const similar = document.querySelector('#similar-recipes');
    const matches = similarRecipes(recipe);
    similar.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'dim';
      empty.textContent = 'No other recipes in your library yet.';
      similar.append(empty);
    }
    for (const match of matches) {
      const row = document.createElement('div');
      row.className = 'list-row';
      const link = document.createElement('a');
      link.href = recipeUrl(match);
      link.textContent = match.name;
      const stats = document.createElement('span');
      stats.className = 'dim';
      stats.textContent = [`$${costPerServing(match).toFixed(2)}`, caloriesLabel(match)].filter(Boolean).join(' · ');
      row.append(link, stats);
      similar.append(row);
    }

    const scheduledEntries = state.plan.filter((entry) => entry.recipeId === recipe.id);
    document.querySelector('#recipe-plan-status').textContent = scheduledEntries.length
      ? `Scheduled ${scheduledEntries.map((entry) => `${entry.day} (${pluralize(servingsFor(entry), 'serving')})`).join(', ')}.`
      : 'Not yet in this week’s plan.';
    renderScheduleOptions();
    renderScheduleEstimate();
  }

  /* ---------- Recipe library: shared helpers ---------- */

  const UNITS = ['oz', 'lb', 'cup', 'tbsp', 'tsp', 'each'];
  const RECIPE_LIMITS = {
    nameLength: 60,
    maxServings: 24,
    maxMinutes: 1440,
    maxCalories: 5000,
    maxQuantity: 10000,
    maxUnitCost: 1000,
    maxIngredients: 30,
    maxSteps: 30,
    maxTags: 8,
    tagLength: 20
  };
  const FLASH_KEY = 'mealgrid-flash';

  function recipeUrl(recipe) {
    return `recipe.html?id=${encodeURIComponent(recipe.id)}`;
  }

  function editRecipeUrl(recipe) {
    return `recipe-edit.html?id=${encodeURIComponent(recipe.id)}`;
  }

  function totalMinutes(recipe) {
    return (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  }

  function plannedDaysFor(recipe) {
    return state.plan.filter((entry) => entry.recipeId === recipe.id).map((entry) => entry.day);
  }

  /** Queue a notice to show after the next page load (e.g. after a redirect). */
  function flashNotice(message) {
    try {
      sessionStorage.setItem(FLASH_KEY, message);
    } catch (error) {
      console.warn('Could not queue MealGrid notice.', error);
    }
  }

  function showFlashNotice() {
    try {
      const message = sessionStorage.getItem(FLASH_KEY);
      if (!message) return;
      sessionStorage.removeItem(FLASH_KEY);
      showNotice(message);
    } catch (error) {
      console.warn('Could not read MealGrid notice.', error);
    }
  }

  /**
   * Ask for confirmation, then delete a recipe and any plan entries using it.
   * Returns true when the recipe was deleted.
   */
  function deleteRecipe(recipe) {
    const plannedDays = plannedDaysFor(recipe);
    const planWarning = plannedDays.length
      ? `\n\nIt is planned for ${plannedDays.join(', ')}; ${plannedDays.length === 1 ? 'that meal' : 'those meals'} will be removed from this week’s plan.`
      : '';
    if (!window.confirm(`Delete “${recipe.name}”? This cannot be undone.${planWarning}`)) return false;
    state.recipes = state.recipes.filter((candidate) => candidate.id !== recipe.id);
    state.plan = state.plan.filter((entry) => entry.recipeId !== recipe.id);
    return saveState();
  }

  /* ---------- Recipe library page ---------- */

  const libraryFilters = { query: '', tag: 'all' };

  function recipeMatchesFilters(recipe) {
    if (libraryFilters.tag === 'planned' && !plannedDaysFor(recipe).length) return false;
    if (!['all', 'planned'].includes(libraryFilters.tag) && !recipe.tags.includes(libraryFilters.tag)) return false;
    const query = libraryFilters.query.trim().toLowerCase();
    if (!query) return true;
    const haystack = [recipe.name, ...recipe.tags, ...recipe.ingredients.map((ingredient) => ingredient.name)];
    return haystack.some((text) => text.toLowerCase().includes(query));
  }

  function renderLibraryFilters() {
    const nav = document.querySelector('#library-filters');
    const allTags = [...new Set(state.recipes.flatMap((recipe) => recipe.tags))].sort();
    if (!['all', 'planned', ...allTags].includes(libraryFilters.tag)) libraryFilters.tag = 'all';
    const filters = [
      { value: 'all', label: 'All Recipes' },
      { value: 'planned', label: 'In This Week’s Plan' },
      ...allTags.map((tag) => ({ value: tag, label: `#${tag}` }))
    ];
    nav.replaceChildren();
    for (const filter of filters) {
      const button = document.createElement('button');
      const isActive = filter.value === libraryFilters.tag;
      button.className = `filter-link${isActive ? ' is-active' : ''}`;
      button.type = 'button';
      button.textContent = filter.label;
      button.setAttribute('aria-pressed', String(isActive));
      button.addEventListener('click', () => {
        libraryFilters.tag = filter.value;
        renderLibrary();
      });
      nav.append(button);
    }
  }

  function createRecipeCard(recipe) {
    const card = document.createElement('article');
    card.className = 'panel panel-corners recipe-card';

    const title = document.createElement('h2');
    title.className = 'recipe-card-title display';
    const titleLink = document.createElement('a');
    titleLink.href = recipeUrl(recipe);
    titleLink.textContent = recipe.name;
    title.append(titleLink);

    const stats = document.createElement('p');
    stats.className = 'dim';
    stats.textContent = [
      `$${costPerServing(recipe).toFixed(2)} / serving`,
      caloriesLabel(recipe),
      totalMinutes(recipe) ? `${totalMinutes(recipe)} min` : ''
    ].filter(Boolean).join(' · ');

    const details = document.createElement('p');
    details.className = 'dim';
    details.textContent = `Makes ${recipeYield(recipe)} · ${pluralize(recipe.ingredients.length, 'ingredient')}`;

    const tags = document.createElement('div');
    tags.className = 'row wrap recipe-tags';
    for (const tag of recipe.tags) {
      const chip = document.createElement('span');
      chip.className = 'chip chip-sm';
      chip.textContent = tag;
      tags.append(chip);
    }

    const plannedDays = plannedDaysFor(recipe);
    const planned = document.createElement('p');
    planned.className = plannedDays.length ? 'tag-ok' : 'tag-needed';
    planned.textContent = plannedDays.length ? `Planned · ${plannedDays.join(', ')}` : 'Not planned';

    const actions = document.createElement('div');
    actions.className = 'row wrap recipe-card-actions';
    const view = document.createElement('a');
    view.className = 'btn btn-ghost btn-sm';
    view.href = recipeUrl(recipe);
    view.textContent = 'View';
    const edit = document.createElement('a');
    edit.className = 'btn btn-ghost btn-sm';
    edit.href = editRecipeUrl(recipe);
    edit.textContent = 'Edit';
    const remove = document.createElement('button');
    remove.className = 'btn btn-danger btn-sm';
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${recipe.name}`);
    remove.addEventListener('click', () => {
      if (!deleteRecipe(recipe)) return;
      renderLibrary();
      showNotice(`${recipe.name} deleted.`);
    });
    actions.append(view, edit, remove);

    card.append(title, stats, details, tags, planned, actions);
    return card;
  }

  function renderLibrary() {
    const grid = document.querySelector('#recipe-grid');
    if (!grid) return;
    const plannedCount = state.recipes.filter((recipe) => plannedDaysFor(recipe).length).length;
    document.querySelector('#library-summary').textContent =
      `${pluralize(state.recipes.length, 'recipe')} · ${plannedCount} in this week’s plan`;
    renderLibraryFilters();

    const visibleRecipes = state.recipes
      .filter(recipeMatchesFilters)
      .sort((left, right) => left.name.localeCompare(right.name));
    grid.replaceChildren(...visibleRecipes.map(createRecipeCard));
    const empty = document.querySelector('#library-empty');
    empty.hidden = visibleRecipes.length > 0;
    empty.textContent = state.recipes.length
      ? 'No recipes match this search or filter.'
      : 'Your library is empty. Add a recipe to get started.';
  }

  function bindLibrary() {
    const search = document.querySelector('#library-search');
    if (!search) return;
    search.addEventListener('input', () => {
      libraryFilters.query = search.value;
      renderLibrary();
    });
  }

  /* ---------- Recipe editor: validation ---------- */

  function parseOptionalNumber(raw) {
    const text = String(raw ?? '').trim();
    return text === '' ? null : Number(text);
  }

  function isIntegerInRange(value, min, max) {
    return Number.isInteger(value) && value >= min && value <= max;
  }

  function parseTags(raw) {
    const tags = String(raw ?? '')
      .split(',')
      .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean);
    return [...new Set(tags)];
  }

  /**
   * Validate raw form values. Returns `{ recipe, errors }`; `recipe` holds the
   * cleaned values and `errors` is a list of `{ field, message }` where
   * `field` is an input name or `ingredient-<index>-<input name>`.
   */
  function validateRecipeDraft(draft, existingId = null) {
    const errors = [];
    const addError = (field, message) => errors.push({ field, message });
    const limits = RECIPE_LIMITS;

    const name = String(draft.name ?? '').trim();
    if (!name) {
      addError('name', 'Enter a recipe name.');
    } else if (name.length > limits.nameLength) {
      addError('name', `Keep the recipe name to ${limits.nameLength} characters or fewer.`);
    } else if (state.recipes.some((recipe) => recipe.id !== existingId && recipe.name.toLowerCase() === name.toLowerCase())) {
      addError('name', 'A recipe with this name already exists.');
    }

    const servings = parseOptionalNumber(draft.servings);
    if (!isIntegerInRange(servings, 1, limits.maxServings)) {
      addError('servings', `Servings must be a whole number from 1 to ${limits.maxServings}.`);
    }

    const prepMinutes = parseOptionalNumber(draft.prepMinutes) ?? 0;
    if (!isIntegerInRange(prepMinutes, 0, limits.maxMinutes)) {
      addError('prepMinutes', `Prep time must be a whole number of minutes from 0 to ${limits.maxMinutes}.`);
    }
    const cookMinutes = parseOptionalNumber(draft.cookMinutes) ?? 0;
    if (!isIntegerInRange(cookMinutes, 0, limits.maxMinutes)) {
      addError('cookMinutes', `Cook time must be a whole number of minutes from 0 to ${limits.maxMinutes}.`);
    }

    const calories = parseOptionalNumber(draft.calories);
    if (calories !== null && !isIntegerInRange(calories, 0, limits.maxCalories)) {
      addError('calories', `Calories must be a whole number from 0 to ${limits.maxCalories}, or left blank.`);
    }

    const tags = parseTags(draft.tags);
    if (tags.length > limits.maxTags) {
      addError('tags', `Use ${limits.maxTags} tags or fewer.`);
    } else if (tags.some((tag) => tag.length > limits.tagLength)) {
      addError('tags', `Keep each tag to ${limits.tagLength} characters or fewer.`);
    }

    const ingredients = [];
    draft.ingredients.forEach((row, index) => {
      const rowName = String(row.name ?? '').trim();
      const rowIsBlank = !rowName && String(row.quantity ?? '').trim() === '' && String(row.unitCost ?? '').trim() === '';
      if (rowIsBlank) return;
      const label = rowName || `Ingredient ${index + 1}`;
      const quantity = parseOptionalNumber(row.quantity);
      const unitCost = parseOptionalNumber(row.unitCost) ?? 0;
      if (!rowName) addError(`ingredient-${index}-ingredient-name`, `Ingredient ${index + 1} needs a name.`);
      if (!Number.isFinite(quantity) || quantity <= 0 || quantity > limits.maxQuantity) {
        addError(`ingredient-${index}-ingredient-quantity`, `${label}: enter a quantity greater than 0.`);
      }
      if (!UNITS.includes(row.unit)) {
        addError(`ingredient-${index}-ingredient-unit`, `${label}: choose a unit.`);
      }
      if (!Number.isFinite(unitCost) || unitCost < 0 || unitCost > limits.maxUnitCost) {
        addError(`ingredient-${index}-ingredient-cost`, `${label}: cost per unit must be between $0 and $${limits.maxUnitCost}.`);
      }
      ingredients.push({ name: rowName, quantity, unit: row.unit, unitCost });
    });
    if (!ingredients.length) {
      addError('ingredient-0-ingredient-name', 'Add at least one ingredient.');
    } else if (ingredients.length > limits.maxIngredients) {
      addError('ingredients', `Use ${limits.maxIngredients} ingredients or fewer.`);
    }

    const steps = String(draft.steps ?? '').split('\n').map((step) => step.trim()).filter(Boolean);
    if (!steps.length) {
      addError('steps', 'Add at least one step.');
    } else if (steps.length > limits.maxSteps) {
      addError('steps', `Use ${limits.maxSteps} steps or fewer.`);
    }

    return {
      errors,
      recipe: { name, servings, prepMinutes, cookMinutes, calories, tags, ingredients, steps }
    };
  }

  function slugify(text) {
    const slug = text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return slug || 'recipe';
  }

  /** Build a readable, unique id such as `turkey-chili` or `turkey-chili-2`. */
  function uniqueRecipeId(name) {
    const base = slugify(name);
    let id = base;
    for (let suffix = 2; recipeById(id); suffix += 1) id = `${base}-${suffix}`;
    return id;
  }

  /* ---------- Recipe editor: form ---------- */

  function addIngredientRow(ingredient = null) {
    const rows = document.querySelector('#ingredient-rows');
    const template = document.querySelector('#ingredient-row-template');
    const row = template.content.firstElementChild.cloneNode(true);
    if (ingredient) {
      row.querySelector('[name="ingredient-name"]').value = ingredient.name;
      row.querySelector('[name="ingredient-quantity"]').value = String(ingredient.quantity);
      row.querySelector('[name="ingredient-unit"]').value = ingredient.unit;
      row.querySelector('[name="ingredient-cost"]').value = String(ingredient.unitCost);
    }
    row.querySelector('[data-remove-ingredient]').addEventListener('click', () => {
      row.remove();
      if (!rows.children.length) addIngredientRow();
      updateIngredientRows();
    });
    rows.append(row);
    updateIngredientRows();
    return row;
  }

  /** Keep remove-button labels and the add button in sync with the row count. */
  function updateIngredientRows() {
    const rows = [...document.querySelectorAll('#ingredient-rows .ingredient-row')];
    rows.forEach((row, index) => {
      row.querySelector('[data-remove-ingredient]').setAttribute('aria-label', `Remove ingredient ${index + 1}`);
    });
    const addButton = document.querySelector('#add-ingredient');
    addButton.disabled = rows.length >= RECIPE_LIMITS.maxIngredients;
    renderRecipeFormEstimate();
  }

  function readRecipeForm(form) {
    const formData = new FormData(form);
    const rows = [...form.querySelectorAll('#ingredient-rows .ingredient-row')];
    return {
      name: formData.get('name'),
      servings: formData.get('servings'),
      prepMinutes: formData.get('prepMinutes'),
      cookMinutes: formData.get('cookMinutes'),
      calories: formData.get('calories'),
      tags: formData.get('tags'),
      steps: formData.get('steps'),
      ingredients: rows.map((row) => ({
        name: row.querySelector('[name="ingredient-name"]').value,
        quantity: row.querySelector('[name="ingredient-quantity"]').value,
        unit: row.querySelector('[name="ingredient-unit"]').value,
        unitCost: row.querySelector('[name="ingredient-cost"]').value
      }))
    };
  }

  function fillRecipeForm(form, recipe) {
    form.elements.name.value = recipe.name;
    form.elements.servings.value = String(recipeYield(recipe));
    form.elements.prepMinutes.value = recipe.prepMinutes ? String(recipe.prepMinutes) : '';
    form.elements.cookMinutes.value = recipe.cookMinutes ? String(recipe.cookMinutes) : '';
    form.elements.calories.value = Number.isFinite(recipe.calories) ? String(recipe.calories) : '';
    form.elements.tags.value = recipe.tags.join(', ');
    form.elements.steps.value = recipe.steps.join('\n');
    recipe.ingredients.forEach((ingredient) => addIngredientRow(ingredient));
  }

  function inputForField(form, field) {
    const match = /^ingredient-(\d+)-(.+)$/.exec(field);
    if (!match) return form.elements[field] instanceof Element ? form.elements[field] : null;
    const row = form.querySelectorAll('#ingredient-rows .ingredient-row')[Number(match[1])];
    return row ? row.querySelector(`[name="${match[2]}"]`) : null;
  }

  function showRecipeFormErrors(form, errors) {
    const summary = document.querySelector('#recipe-form-errors');
    form.querySelectorAll('[aria-invalid="true"]').forEach((input) => input.removeAttribute('aria-invalid'));
    summary.hidden = errors.length === 0;
    const list = summary.querySelector('ul');
    list.replaceChildren();
    for (const error of errors) {
      const item = document.createElement('li');
      item.textContent = error.message;
      list.append(item);
      inputForField(form, error.field)?.setAttribute('aria-invalid', 'true');
    }
    if (errors.length) {
      summary.focus();
      summary.scrollIntoView({ block: 'start' });
    }
  }

  function renderRecipeFormEstimate() {
    const estimate = document.querySelector('#recipe-form-estimate');
    const form = document.querySelector('#recipe-form');
    if (!estimate || !form) return;
    const draft = readRecipeForm(form);
    const total = draft.ingredients.reduce((sum, row) => {
      const quantity = Number(row.quantity);
      const unitCost = Number(row.unitCost);
      return Number.isFinite(quantity) && Number.isFinite(unitCost) ? sum + quantity * unitCost : sum;
    }, 0);
    const servings = Number(draft.servings);
    const perServing = isIntegerInRange(servings, 1, RECIPE_LIMITS.maxServings) ? total / servings : total;
    estimate.textContent = `Est. $${total.toFixed(2)} total · $${perServing.toFixed(2)} / serving`;
  }

  function bindRecipeEditor() {
    const form = document.querySelector('#recipe-form');
    if (!form) return;
    const recipeId = new URLSearchParams(window.location.search).get('id');
    const existing = recipeId ? recipeById(recipeId) : null;

    if (recipeId && !existing) {
      form.hidden = true;
      document.querySelector('#recipe-form-missing').hidden = false;
      document.querySelector('#recipe-form-title').textContent = 'Recipe Not Found';
      return;
    }

    if (existing) {
      document.title = `MealGrid — Edit ${existing.name}`;
      document.querySelector('#recipe-form-title').textContent = `Edit ${existing.name}`;
      document.querySelector('#recipe-form-cancel').href = recipeUrl(existing);
      fillRecipeForm(form, existing);
      const deleteButton = document.querySelector('#recipe-form-delete');
      deleteButton.hidden = false;
      deleteButton.addEventListener('click', () => {
        if (!deleteRecipe(existing)) return;
        flashNotice(`${existing.name} deleted.`);
        window.location.href = 'recipes.html';
      });
    } else {
      document.title = 'MealGrid — New Recipe';
      addIngredientRow();
    }

    document.querySelector('#add-ingredient').addEventListener('click', () => {
      addIngredientRow().querySelector('input').focus();
    });
    form.addEventListener('input', renderRecipeFormEstimate);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const { recipe, errors } = validateRecipeDraft(readRecipeForm(form), existing?.id ?? null);
      showRecipeFormErrors(form, errors);
      if (errors.length) return;
      let saved;
      if (existing) {
        Object.assign(existing, recipe);
        saved = existing;
      } else {
        saved = { id: uniqueRecipeId(recipe.name), ...recipe };
        state.recipes.push(saved);
      }
      if (!saveState()) return;
      flashNotice(`${saved.name} saved to your library.`);
      window.location.href = recipeUrl(saved);
    });
  }

  function renderAll() {
    renderDashboard();
    renderPantry();
    renderRecipe();
    renderLibrary();
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

  function populatePlanDays(select, currentEntry = null) {
    const scheduledByDay = new Map(
      state.plan.filter((entry) => entry !== currentEntry)
        .map((entry) => [entry.day, recipeById(entry.recipeId)?.name || 'Meal'])
    );
    select.replaceChildren();

    if (!currentEntry) {
      const prompt = document.createElement('option');
      prompt.value = '';
      prompt.textContent = 'Choose a day';
      prompt.disabled = true;
      prompt.selected = true;
      select.append(prompt);
    }

    let availableDays = 0;
    for (const day of DAYS) {
      const isScheduled = scheduledByDay.has(day);
      const option = document.createElement('option');
      option.value = day;
      option.disabled = isScheduled;
      option.textContent = isScheduled ? `${day} — ${scheduledByDay.get(day)} (planned)` : day;
      select.append(option);
      if (!isScheduled) availableDays += 1;
    }

    select.value = currentEntry ? currentEntry.day : '';
    return availableDays;
  }

  function renderScheduleOptions() {
    const select = document.querySelector('#schedule-day');
    const submit = document.querySelector('#add-recipe-to-plan');
    if (!select || !submit) return;
    const availableDays = populatePlanDays(select);
    submit.disabled = availableDays === 0;
    submit.textContent = availableDays ? 'Add to Plan' : 'Week Is Full';
  }

  function renderScheduleEstimate() {
    const estimate = document.querySelector('#schedule-estimate');
    const servingsInput = document.querySelector('#schedule-servings');
    if (!estimate || !servingsInput) return;
    const servings = Number(servingsInput.value);
    const recipe = recipeFromUrl();
    if (!recipe) return;
    if (!Number.isInteger(servings) || servings < 1 || servings > 12) {
      estimate.textContent = 'Choose between 1 and 12 servings.';
      return;
    }
    estimate.textContent = [pluralize(servings, 'serving'), `$${(costPerServing(recipe) * servings).toFixed(2)} estimated`, caloriesLabel(recipe, servings)]
      .filter(Boolean).join(' · ');
  }

  function bindRecipeForm() {
    const form = document.querySelector('#schedule-form');
    if (!form) return;
    const recipe = recipeFromUrl();
    if (!recipe) return;
    const servingsInput = document.querySelector('#schedule-servings');
    servingsInput.addEventListener('input', renderScheduleEstimate);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const day = String(formData.get('day'));
      const servings = Number(formData.get('servings'));
      if (!DAYS.includes(day) || state.plan.some((entry) => entry.day === day)) {
        showNotice('Choose an open day for this meal.', true);
        renderScheduleOptions();
        return;
      }
      if (!Number.isInteger(servings) || servings < 1 || servings > 12) {
        showNotice('Choose between 1 and 12 servings.', true);
        return;
      }
      state.plan.push({ day, recipeId: recipe.id, servings });
      const saved = saveState();
      form.reset();
      renderAll();
      if (saved) {
        showNotice(`${recipe.name} added to ${day}’s plan for ${pluralize(servings, 'serving')}.`);
      }
    });

    document.querySelector('#recipe-delete').addEventListener('click', () => {
      if (!deleteRecipe(recipe)) return;
      flashNotice(`${recipe.name} deleted.`);
      window.location.href = 'recipes.html';
    });
  }

  state = loadState();
  if (needsMigrationSave) saveState();
  bindPantryForm();
  bindRecipeForm();
  bindLibrary();
  bindRecipeEditor();
  renderAll();
  showFlashNotice();
})();
