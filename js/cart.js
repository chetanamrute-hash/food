"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const app = window.FoodieGo;
  const itemsContainer = document.querySelector(".cart-items");
  if (!itemsContainer) return;

  function getLines() {
    const foods = app.getFoods();
    const cart = app.getCart();
    const valid = cart.filter((item) => foods.some((food) => food.id === item.id));
    if (valid.length !== cart.length) app.write(app.keys.cart, valid);
    return valid.map((item) => ({ ...foods.find((food) => food.id === item.id), quantity: item.quantity }));
  }

  function render() {
    const lines = getLines();
    const count = lines.reduce((sum, item) => sum + item.quantity, 0);
    itemsContainer.innerHTML = lines.map((item) => `<article class="cart-item"><img class="cart-item-image" src="${app.escape(item.image)}" alt="${app.escape(item.name)}"><div><h3>${app.escape(item.name)}</h3><p>${app.money(item.price)} each</p><div class="quantity-control"><button type="button" data-change="-1" data-id="${app.escape(item.id)}" aria-label="Decrease ${app.escape(item.name)}">−</button><span>${item.quantity}</span><button type="button" data-change="1" data-id="${app.escape(item.id)}" aria-label="Increase ${app.escape(item.name)}">+</button></div></div><div class="cart-item-total">${app.money(item.price * item.quantity)}<button type="button" class="remove-item" data-remove="${app.escape(item.id)}">Remove</button></div></article>`).join("");
    const empty = lines.length === 0;
    itemsContainer.hidden = empty;
    document.querySelector(".cart-empty").hidden = !empty;
    document.querySelector(".cart-panel-heading").hidden = empty;
    const subtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 39;
    document.querySelector(".summary-lines").innerHTML = `<div class="summary-row"><span>Subtotal (${count} ${count === 1 ? "item" : "items"})</span><strong>${app.money(subtotal)}</strong></div><div class="summary-row"><span>Delivery</span><strong>${delivery ? app.money(delivery) : "On us"}</strong></div><div class="summary-row total"><span>Total</span><strong>${app.money(subtotal + delivery)}</strong></div>`;
    document.querySelector(".delivery-hint").textContent = empty ? "Add some good things to your cart." : delivery ? `Add ${app.money(499 - subtotal)} more for free delivery.` : "Your delivery is on us — enjoy!";
    document.querySelector(".checkout-link").classList.toggle("is-hidden", empty);
    app.updateCartCount();
  }

  itemsContainer.addEventListener("click", (event) => {
    const change = event.target.closest("[data-change]");
    if (change) {
      const cart = app.getCart();
      const item = cart.find((entry) => entry.id === change.dataset.id);
      if (!item) return;
      item.quantity += Number(change.dataset.change);
      app.write(app.keys.cart, cart.filter((entry) => entry.quantity > 0));
      render();
      return;
    }
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      app.write(app.keys.cart, app.getCart().filter((entry) => entry.id !== remove.dataset.remove));
      render();
      app.toast("Item removed from your cart.");
    }
  });
  render();
});
