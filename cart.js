/* ===========================
   cart.js — Trueverse Oil
   =========================== */

/* ---- CONFIG ---- */
var STORAGE_KEY = "cart";
var STORE_NAME = "Trueverse Oil";
var WHATSAPP_PHONE = "919092418710"; // <-- CHANGE THIS to your WhatsApp number

/* ---- HELPERS ---- */
function getCart() {
  var raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatINR(amount) {
  var n = Number(amount) || 0;
  return "₹" + n.toLocaleString("en-IN");
}

/* ===========================
   CART FUNCTIONS
   =========================== */

function addToCart(name, price, image) {
  var cart = getCart();
  var idx = -1;

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      idx = i;
      break;
    }
  }

  if (idx !== -1) {
    cart[idx].quantity = (Number(cart[idx].quantity) || 0) + 1;
  } else {
    cart.push({
      name: String(name),
      price: Number(price) || 0,
      image: String(image || ""),
      quantity: 1
    });
  }

  setCart(cart);
  updateCartCount();
  alert(name + " added to cart!");
  window.location.href = "cart.html";
}

function loadCart() {
  var cart = getCart();
  var cartItemsEl = document.getElementById("cart-items");
  var subtotalEl = document.getElementById("subtotal");
  var totalEl = document.getElementById("total");

  if (!cartItemsEl || !subtotalEl || !totalEl) {
    updateCartCount();
    return;
  }

  cartItemsEl.innerHTML = "";
  var subtotal = 0;

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var price = Number(item.price) || 0;
    var qty = Number(item.quantity) || 0;
    var lineTotal = price * qty;
    subtotal += lineTotal;

    var rowHtml =
      '<tr>' +
      '  <td>' +
      '    <img src="' + (item.image || "") + '" class="cart-img" alt="' + item.name + '" width="50">' +
      '    <span>' + item.name + '</span>' +
      '  </td>' +
      '  <td>' + formatINR(price) + '</td>' +
      '  <td>' +
      '    <input type="number" min="1" value="' + qty + '" onchange="updateQuantity(' + i + ', this.value)" style="width:70px">' +
      '  </td>' +
      '  <td class="item-total">' + formatINR(lineTotal) + '</td>' +
      '  <td><button onclick="removeItem(' + i + ')" class="remove-btn">X</button></td>' +
      '</tr>';

    cartItemsEl.insertAdjacentHTML("beforeend", rowHtml);
  }

  subtotalEl.textContent = formatINR(subtotal);
  totalEl.textContent = formatINR(subtotal);
  updateCartCount();
}

function updateQuantity(index, quantity) {
  var cart = getCart();
  if (!cart[index]) return;
  var q = parseInt(quantity, 10);
  if (!q || q < 1) q = 1;
  cart[index].quantity = q;
  setCart(cart);
  loadCart();
}

function removeItem(index) {
  var cart = getCart();
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  setCart(cart);
  loadCart();
}

function checkout() {
  var cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty!");
    return;
  }
  alert("Thank you for your order!");
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "index.html";
}

function updateCartCount() {
  var cart = getCart();
  var count = 0;
  for (var i = 0; i < cart.length; i++) {
    count += Number(cart[i].quantity) || 0;
  }
  var el = document.getElementById("cart-count");
  if (el) el.textContent = String(count);
}

/* ===========================
   WHATSAPP ORDER
   =========================== */

function buildOrderMessage() {
  var cart = getCart();
  var subtotal = 0;
  var lines = [];

  for (var i = 0; i < cart.length; i++) {
    var it = cart[i];
    var price = Number(it.price) || 0;
    var qty = Number(it.quantity) || 0;
    var line = price * qty;
    subtotal += line;
    lines.push((i + 1) + ". " + it.name + " — " + formatINR(price) + " × " + qty + " = " + formatINR(line));
  }

  var msg = "🛒 New Order - " + STORE_NAME + "\n\n";
  msg += lines.join("\n");
  msg += "\n\nTotal: " + formatINR(subtotal) + "\n";
  msg += "Shipping: Free\n";
  msg += "\nPlease confirm the order.";

  return msg;
}

function orderInWhatsApp() {
  var cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty!");
    return;
  }
  var message = buildOrderMessage();
  var url = "https://wa.me/" + WHATSAPP_PHONE + "?text=" + encodeURIComponent(message);
  window.open(url, "_blank");
}

/* ===========================
   INIT
   =========================== */

window.onload = function () {
  loadCart();
  updateCartCount();

  var checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);

  var whatsappBtn = document.querySelector(".whatsapp-btn");
  if (whatsappBtn) whatsappBtn.addEventListener("click", orderInWhatsApp);
};

/* Expose for inline handlers */
window.addToCart = addToCart;
window.loadCart = loadCart;
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.checkout = checkout;
window.orderInWhatsApp = orderInWhatsApp;
