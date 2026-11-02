"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const app = window.FoodieGo;
  const form = document.querySelector("#checkout-form");
  const layout = document.querySelector(".checkout-layout");
  const confirmation = document.querySelector(".confirmation-panel");
  const itemsContainer = document.querySelector(".checkout-items");

  function orderTotal() {
    const foods = app.getFoods();
    const lines = app.getCart().map((entry) => {
      const food = foods.find((item) => item.id === entry.id);
      return food ? { ...food, quantity: entry.quantity } : null;
    }).filter(Boolean);
    return { lines, subtotal: lines.reduce((sum, item) => sum + item.price * item.quantity, 0) };
  }

  function renderSummary() {
    const { lines, subtotal } = orderTotal();
    if (!lines.length) {
      window.location.replace("cart.html");
      return;
    }
    itemsContainer.innerHTML = lines.map((item) => `<div class="checkout-item"><img src="${app.escape(item.image)}" alt=""><span><strong>${app.escape(item.name)}</strong><small>Qty ${item.quantity}</small></span><b>${app.money(item.price * item.quantity)}</b></div>`).join("");
    const delivery = subtotal >= 499 ? 0 : 39;
    document.querySelector(".summary-lines").innerHTML = `<div class="summary-row"><span>Subtotal</span><strong>${app.money(subtotal)}</strong></div><div class="summary-row"><span>Delivery</span><strong>${delivery ? app.money(delivery) : "On us"}</strong></div><div class="summary-row total"><span>Total</span><strong>${app.money(subtotal + delivery)}</strong></div>`;
  }

  function showConfirmation(order) {
    layout.hidden = true;
    document.querySelector(".page-intro").hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector(".confirmation-name").textContent = order.customer.name.split(" ")[0];
    confirmation.querySelector(".confirmation-number").textContent = order.id;
    confirmation.querySelector(".confirmation-order-details").textContent = `${order.items.length} ${order.items.length === 1 ? "dish" : "dishes"} · ${app.money(order.total)} · ${order.status}`;
  }

  const orderId = new URLSearchParams(location.search).get("order");
  let confirmedOrder = false;
  if (orderId) {
    const savedOrder = app.getOrders().find((order) => order.id === orderId);
    if (savedOrder) {
      showConfirmation(savedOrder);
      confirmedOrder = true;
    }
    else app.toast("We couldn’t find that saved order.", true);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const phone = form.elements.phone.value.trim();
    if (phone.replace(/\D/g, "").length < 10) {
      form.elements.phone.setCustomValidity("Please enter a phone number with at least 10 digits.");
      form.elements.phone.reportValidity();
      form.elements.phone.setCustomValidity("");
      return;
    }
    const { lines, subtotal } = orderTotal();
    if (!lines.length) {
      app.toast("Your cart is empty. Choose a dish before checking out.", true);
      window.location.href = "menu.html";
      return;
    }
    const delivery = subtotal >= 499 ? 0 : 39;
    const order = {
      id: `FG-${Date.now().toString().slice(-8)}`,
      customer: { name: form.elements.name.value.trim(), phone, email: form.elements.email.value.trim(), address: form.elements.address.value.trim() },
      items: lines.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      subtotal, delivery, total: subtotal + delivery, status: "Received", createdAt: new Date().toISOString()
    };
    const orders = app.getOrders();
    orders.unshift(order);
    if (!app.write(app.keys.orders, orders)) return;
    if (!app.write(app.keys.cart, [])) {
      orders.shift();
      app.write(app.keys.orders, orders);
      return;
    }
    app.updateCartCount();
    form.reset();
    history.replaceState({}, "", `checkout.html?order=${encodeURIComponent(order.id)}`);
    showConfirmation(order);
    app.toast("Your order is on its way to the kitchen!");
  });

  if (!confirmedOrder) renderSummary();
});
