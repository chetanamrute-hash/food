"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const app = window.FoodieGo;
  const menuGrid = document.querySelector(".menu-foods");
  const filterBar = document.querySelector("#category-filters");
  if (!menuGrid || !filterBar) {
    const params = new URLSearchParams(location.search);
    if (params.has("q")) document.querySelectorAll(".search-form input[name='q']").forEach((input) => { input.value = params.get("q"); });
    return;
  }

  let foods = app.getFoods();
  let activeCategory = "All";
  let query = new URLSearchParams(location.search).get("q") || "";
  const params = new URLSearchParams(location.search);
  const initialRestaurant = params.get("restaurant") || "";
  const searchInput = document.querySelector("#menu-search-input");
  searchInput.value = query || initialRestaurant;
  if (initialRestaurant) query = initialRestaurant;
  const requestedCategory = params.get("category");

  function renderFilters() {
    const categories = ["All", ...new Set(foods.map((food) => food.category))];
    filterBar.innerHTML = categories.map((category) => `<button class="filter-chip${activeCategory === category ? " active" : ""}" type="button" data-category="${app.escape(category)}">${app.escape(category)}</button>`).join("");
  }

  function renderMenu() {
    const diet = document.querySelector("#diet-filter").value;
    const sort = document.querySelector("#sort-filter").value;
    const normalizedQuery = query.toLowerCase();
    let visible = foods.filter((food) => {
      const categoryMatches = activeCategory === "All" || food.category === activeCategory;
      const dietMatches = diet === "all" || (diet === "veg" ? food.vegetarian : !food.vegetarian);
      const searchMatches = !normalizedQuery || `${food.name} ${food.description} ${food.category} ${food.restaurant}`.toLowerCase().includes(normalizedQuery);
      return categoryMatches && dietMatches && searchMatches;
    });
    if (sort === "price-low") visible = visible.sort((a, b) => a.price - b.price);
    if (sort === "price-high") visible = visible.sort((a, b) => b.price - a.price);
    if (sort === "popular") visible = visible.sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
    menuGrid.innerHTML = visible.length ? visible.map(app.foodCard).join("") : '<p class="empty-results">No dishes found. Try changing your search or filters.</p>';
    document.querySelector(".menu-status").textContent = `${visible.length} delicious ${visible.length === 1 ? "option" : "options"} to choose from.`;
    filterBar.querySelectorAll("[data-category]").forEach((button) => button.classList.toggle("active", button.dataset.category === activeCategory));
  }

  filterBar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderMenu();
  });
  searchInput.addEventListener("input", () => { query = searchInput.value.trim(); renderMenu(); });
  document.querySelector(".menu-search").addEventListener("submit", (event) => {
    event.preventDefault();
    query = searchInput.value.trim();
    renderMenu();
    history.replaceState({}, "", query ? `menu.html?q=${encodeURIComponent(query)}` : "menu.html");
  });
  document.querySelector("#diet-filter").addEventListener("change", renderMenu);
  document.querySelector("#sort-filter").addEventListener("change", renderMenu);
  window.addEventListener("storage", (event) => {
    if (event.key === app.keys.foods) {
      foods = app.getFoods();
      renderFilters();
      renderMenu();
    }
  });
  if (requestedCategory) {
    const match = foods.find((food) => food.category.toLowerCase() === requestedCategory.toLowerCase());
    if (match) activeCategory = match.category;
  }
  renderFilters();
  renderMenu();
});
