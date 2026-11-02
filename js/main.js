"use strict";

// The starter menu is copied to LocalStorage once so admin changes persist in this browser.
const FOODIE_GO_DEFAULT_FOODS = [
  { id: "garden-margherita", name: "Garden Margherita", description: "San Marzano tomato, mozzarella and fresh basil.", category: "Pizza", price: 349, rating: 4.8, popularity: 96, vegetarian: true, restaurant: "Little Oven", image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80" },
  { id: "pepperoni-honey", name: "Pepperoni & Honey", description: "Crisp pepperoni, mozzarella and chilli honey.", category: "Pizza", price: 429, rating: 4.9, popularity: 99, vegetarian: false, restaurant: "Little Oven", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80" },
  { id: "double-smash", name: "The Double Smash", description: "Two seared patties, cheddar and house sauce.", category: "Burgers", price: 329, rating: 4.9, popularity: 98, vegetarian: false, restaurant: "Good Things Diner", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
  { id: "crispy-mushroom-bun", name: "Crispy Mushroom Bun", description: "Golden mushroom, crunchy slaw and herb mayo.", category: "Burgers", price: 279, rating: 4.7, popularity: 84, vegetarian: true, restaurant: "Good Things Diner", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80" },
  { id: "sunday-chicken-biryani", name: "Sunday Chicken Biryani", description: "Fragrant dum rice, slow-cooked chicken and raita.", category: "Biryani", price: 389, rating: 4.9, popularity: 97, vegetarian: false, restaurant: "Dum & Done", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80" },
  { id: "garden-dum-biryani", name: "Garden Dum Biryani", description: "Seasonal vegetables, saffron rice and cool raita.", category: "Biryani", price: 299, rating: 4.7, popularity: 82, vegetarian: true, restaurant: "Dum & Done", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80" },
  { id: "chilli-garlic-noodles", name: "Chilli Garlic Noodles", description: "Wok-tossed noodles, crisp vegetables and sesame.", category: "Chinese", price: 269, rating: 4.6, popularity: 79, vegetarian: true, restaurant: "Wok This Way", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
  { id: "chicken-momos", name: "Ginger Chicken Momos", description: "Hand-folded dumplings and a ginger chilli dip.", category: "Chinese", price: 249, rating: 4.8, popularity: 87, vegetarian: false, restaurant: "Wok This Way", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80" },
  { id: "ghee-podi-dosa", name: "Ghee Podi Dosa", description: "Golden dosa, potato masala and coconut chutney.", category: "South Indian", price: 219, rating: 4.8, popularity: 91, vegetarian: true, restaurant: "Filter & Fold", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80" },
  { id: "soft-idli", name: "Soft Idli & Sambar", description: "Cloud-soft idlis, slow-simmered sambar, chutney.", category: "South Indian", price: 159, rating: 4.7, popularity: 76, vegetarian: true, restaurant: "Filter & Fold", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80" },
  { id: "little-cloud-tiramisu", name: "Little Cloud Tiramisu", description: "Espresso-soaked sponge, mascarpone and cocoa.", category: "Desserts", price: 229, rating: 4.9, popularity: 95, vegetarian: true, restaurant: "Sugar, Slowly", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80" },
  { id: "warm-fudge-brownie", name: "Warm Fudge Brownie", description: "Deep chocolate, toasted walnuts and sea salt.", category: "Desserts", price: 189, rating: 4.8, popularity: 89, vegetarian: true, restaurant: "Sugar, Slowly", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80" },
  { id: "mango-mint-cooler", name: "Mango Mint Cooler", description: "Alphonso mango, garden mint and sparkling water.", category: "Drinks", price: 129, rating: 4.6, popularity: 74, vegetarian: true, restaurant: "Good Things Diner", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80" },
  { id: "slow-brew-coffee", name: "Slow Brew Cold Coffee", description: "Cold brew, fresh milk and a touch of sweet.", category: "Drinks", price: 169, rating: 4.7, popularity: 80, vegetarian: true, restaurant: "Sugar, Slowly", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80" }
];

const FOODIE_GO_KEYS = { foods: "foodiego-foods-v1", cart: "foodiego-cart-v1", orders: "foodiego-orders-v1" };

function foodieGoRead(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.error(`FoodieGo could not read ${key} from LocalStorage.`, error);
    return fallback;
  }
}

function foodieGoWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`FoodieGo could not save ${key} to LocalStorage.`, error);
    foodieGoToast("Could not save your changes in this browser.", true);
    return false;
  }
}

function foodieGoFoods() {
  const saved = foodieGoRead(FOODIE_GO_KEYS.foods, null);
  return Array.isArray(saved) ? saved : FOODIE_GO_DEFAULT_FOODS;
}

function foodieGoCart() {
  const saved = foodieGoRead(FOODIE_GO_KEYS.cart, []);
  return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity > 0) : [];
}

function foodieGoOrders() {
  const saved = foodieGoRead(FOODIE_GO_KEYS.orders, []);
  return Array.isArray(saved) ? saved : [];
}

function foodieGoMoney(amount) { return `₹${Number(amount).toLocaleString("en-IN")}`; }

function foodieGoEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function foodieGoToast(message, isError = false) {
  const region = document.querySelector(".toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function foodieGoAddToCart(id) {
  const cart = foodieGoCart();
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  if (foodieGoWrite(FOODIE_GO_KEYS.cart, cart)) {
    foodieGoUpdateCartCount();
    foodieGoToast("Added to your cart!");
  }
}

function foodieGoUpdateCartCount() {
  const count = foodieGoCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((element) => { element.textContent = String(count); });
}

function foodieGoFoodCard(food) {
  return `<article class="food-card"><div class="food-image"><img src="${foodieGoEscape(food.image)}" alt="${foodieGoEscape(food.name)}" loading="lazy"><span class="food-tag ${food.vegetarian ? "" : "non-veg"}">${food.vegetarian ? "VEG" : "NON-VEG"}</span></div><div class="food-body"><div class="food-title-row"><h3>${foodieGoEscape(food.name)}</h3><span class="food-rating">★ ${Number(food.rating || 4.7).toFixed(1)}</span></div><p class="food-description">${foodieGoEscape(food.description)}</p><div class="food-card-footer"><span class="food-price">${foodieGoMoney(food.price)}</span><button class="add-button" type="button" data-add="${foodieGoEscape(food.id)}">+ Add</button></div></div></article>`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(FOODIE_GO_KEYS.foods) === null) foodieGoWrite(FOODIE_GO_KEYS.foods, FOODIE_GO_DEFAULT_FOODS);
  if (localStorage.getItem(FOODIE_GO_KEYS.orders) === null) foodieGoWrite(FOODIE_GO_KEYS.orders, []);
  foodieGoUpdateCartCount();

  const toggle = document.querySelector(".mobile-menu-toggle");
  toggle?.addEventListener("click", () => {
    const nav = document.querySelector(".main-nav");
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  document.querySelectorAll(".search-form:not(.menu-search)").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : "";
      window.location.href = `menu.html${query ? `?q=${encodeURIComponent(query)}` : ""}`;
    });
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (button) foodieGoAddToCart(button.dataset.add);
  });

  const homeGrid = document.querySelector(".featured-foods");
  if (homeGrid) {
    const bestSellers = [...foodieGoFoods()].sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0)).slice(0, 4);
    homeGrid.innerHTML = bestSellers.length ? bestSellers.map(foodieGoFoodCard).join("") : '<p class="empty-results">The menu is getting a refresh. Check back soon.</p>';
  }
});

window.FoodieGo = {
  keys: FOODIE_GO_KEYS, defaultFoods: FOODIE_GO_DEFAULT_FOODS,
  read: foodieGoRead, write: foodieGoWrite, getFoods: foodieGoFoods,
  getCart: foodieGoCart, getOrders: foodieGoOrders, money: foodieGoMoney,
  escape: foodieGoEscape, toast: foodieGoToast, addToCart: foodieGoAddToCart,
  updateCartCount: foodieGoUpdateCartCount, foodCard: foodieGoFoodCard
};
