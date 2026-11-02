"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const app = window.FoodieGo;
  const login = document.querySelector("#admin-login");
  const dashboard = document.querySelector("#admin-dashboard");
  const demoPassword = "foodiego123";

  function setSignedIn(signedIn) { login.hidden = signedIn; dashboard.hidden = !signedIn; }

  function renderFoods() {
    const foods = app.getFoods();
    document.querySelector("#admin-food-count").textContent = `(${foods.length})`;
    document.querySelector("#admin-food-list").innerHTML = foods.length ? foods.map((food) => `<article class="admin-food-row"><img src="${app.escape(food.image)}" alt=""><div><strong>${app.escape(food.name)}</strong><small>${app.escape(food.category)} · ${app.escape(food.restaurant)}</small></div><span>${app.money(food.price)}</span><button class="delete-food" type="button" data-delete-food="${app.escape(food.id)}">Delete</button></article>`).join("") : '<p class="empty-cart">No food items yet. Add the first one.</p>';
  }

  function renderOrders() {
    const orders = app.getOrders();
    const container = document.querySelector("#admin-orders");
    if (!orders.length) {
      container.innerHTML = '<p class="empty-cart">No customer orders yet. Orders placed from checkout will show here.</p>';
      return;
    }
    container.innerHTML = orders.map((order) => `<article class="admin-order"><div><strong>${app.escape(order.customer.name)} · ${app.escape(order.id)}</strong><small>${app.escape(order.customer.phone)} · ${new Date(order.createdAt).toLocaleString()}</small></div><div class="admin-order-items">${order.items.map((item) => `${item.quantity} × ${app.escape(item.name)}`).join(", ")}</div><strong>${app.money(order.total)}</strong><label class="sr-only" for="status-${app.escape(order.id)}">Order status</label><select id="status-${app.escape(order.id)}" data-order-status="${app.escape(order.id)}" aria-label="Status for ${app.escape(order.id)}"><option${order.status === "Received" ? " selected" : ""}>Received</option><option${order.status === "Preparing" ? " selected" : ""}>Preparing</option><option${order.status === "On the way" ? " selected" : ""}>On the way</option><option${order.status === "Delivered" ? " selected" : ""}>Delivered</option><option${order.status === "Cancelled" ? " selected" : ""}>Cancelled</option></select></article>`).join("");
  }

  document.querySelector("#admin-login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.currentTarget.elements.password.value !== demoPassword) {
      app.toast("That demo password isn’t right. Try foodiego123.", true);
      return;
    }
    sessionStorage.setItem("foodiego-admin-demo-session", "signed-in");
    setSignedIn(true);
    renderFoods();
    renderOrders();
    app.toast("Welcome to the demo dashboard.");
  });

  document.querySelector("#food-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const image = values.get("image").trim();
    if (!/^https:\/\//i.test(image)) {
      app.toast("Please use a secure image URL starting with https://.", true);
      return;
    }
    const food = {
      id: `custom-${Date.now()}`, name: values.get("name").trim(), description: values.get("description").trim(),
      category: values.get("category"), price: Number(values.get("price")), rating: 4.7,
      popularity: Number(values.get("popularity")), vegetarian: values.has("vegetarian"),
      restaurant: values.get("restaurant").trim(), image
    };
    const foods = app.getFoods();
    foods.push(food);
    if (!app.write(app.keys.foods, foods)) return;
    form.reset();
    form.elements.popularity.value = "50";
    renderFoods();
    app.toast("Your new dish is on the menu!");
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-food]");
    if (!button) return;
    const foods = app.getFoods().filter((food) => food.id !== button.dataset.deleteFood);
    const cart = app.getCart().filter((item) => foods.some((food) => food.id === item.id));
    if (!app.write(app.keys.foods, foods)) return;
    app.write(app.keys.cart, cart);
    renderFoods();
    app.updateCartCount();
    app.toast("Food item removed from the menu.");
  });

  document.addEventListener("change", (event) => {
    const select = event.target.closest("[data-order-status]");
    if (!select) return;
    const orders = app.getOrders();
    const order = orders.find((item) => item.id === select.dataset.orderStatus);
    if (!order) {
      app.toast("That order could not be found.", true);
      renderOrders();
      return;
    }
    order.status = select.value;
    if (app.write(app.keys.orders, orders)) app.toast("Order status updated.");
  });

  document.querySelector("#admin-logout").addEventListener("click", () => {
    sessionStorage.removeItem("foodiego-admin-demo-session");
    setSignedIn(false);
    app.toast("You’ve been logged out.");
  });
  document.querySelector("#clear-orders").addEventListener("click", () => {
    if (!app.getOrders().length) {
      app.toast("There are no demo orders to clear.");
      return;
    }
    if (!window.confirm("Clear all saved demo orders from this browser?")) return;
    if (app.write(app.keys.orders, [])) {
      renderOrders();
      app.toast("Demo orders cleared.");
    }
  });

  if (sessionStorage.getItem("foodiego-admin-demo-session") === "signed-in") {
    setSignedIn(true);
    renderFoods();
    renderOrders();
  }
});
