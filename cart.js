/* ===========================
   cart.js — Trueverse Oil (Corrected Final)
   =========================== */

/* ---- CONFIG ---- */
var STORAGE_KEY = "cart";
var STORE_NAME = "Trueverse Oil";
var WHATSAPP_PHONE = "919092418710"; // <-- Your WhatsApp number

/* ---- HELPERS ---- */
function getCart() {
  var raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error parsing cart:", e);
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
   CART DISPLAY & MANAGEMENT FUNCTIONS
   =========================== */

// Global function to update the cart count in the navbar
function updateCartCount() {
  var cart = getCart();
  var count = cart.reduce(function(total, item) {
    return total + (Number(item.quantity) || 0);
  }, 0);
  
  var el = document.getElementById("cart-count");
  // Also update the count on the mobile menu (cart-count-2) if on cart.html
  var el2 = document.getElementById("cart-count-2"); 
  
  if (el) el.textContent = String(count);
  if (el2) el2.textContent = String(count);
}

// Global function to render the cart (Called from window.onload and after updates)
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

  if (cart.length === 0) {
      cartItemsEl.innerHTML = 
          '<tr><td colspan="5" style="text-align:center; padding: 20px;">Your cart is empty.</td></tr>';
  }

  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    var price = Number(item.price) || 0;
    // FIX: Read quantity from item.quantity, which is now correctly set to 1 in product.html
    var qty = Number(item.quantity) || 1; // Default to 1 instead of 0 for safety
    var lineTotal = price * qty;
    subtotal += lineTotal;

    var rowHtml =
      '<tr>' +
      '  <td>' +
      '    <div style="display:flex; align-items:center; gap:10px;">' +
      '      <img src="' + (item.image || "") + '" alt="' + item.name + '" style="height:50px; width:50px; object-fit:cover; border-radius:4px;">' +
      '      <span>' + item.name + '</span>' +
      '    </div>' +
      '  </td>' +
      '  <td>' + formatINR(price) + '</td>' +
      '  <td>' +
      // Call global updateQuantity
      '    <input type="number" min="1" value="' + qty + '" onchange="updateQuantity(' + i + ', this.value)" style="width:70px; padding:5px; text-align:center; border:1px solid #ccc; border-radius:4px;">' +
      '  </td>' +
      '  <td class="item-total">' + formatINR(lineTotal) + '</td>' +
      // Call global removeItem
      '  <td><button onclick="removeItem(' + i + ')" class="remove-btn" style="background:#dc3545; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">X</button></td>' +
      '</tr>';

    cartItemsEl.insertAdjacentHTML("beforeend", rowHtml);
  }

  subtotalEl.textContent = formatINR(subtotal);
  totalEl.textContent = formatINR(subtotal);
  updateCartCount();
}

// Global function for quantity change
function updateQuantity(index, quantity) {
  var cart = getCart();
  if (!cart[index]) return;
  var q = parseInt(quantity, 10);
  if (isNaN(q) || q < 1) q = 1; // Ensure minimum quantity is 1
  cart[index].quantity = q;
  setCart(cart);
  loadCart(); // Reload the cart to update totals
}

// Global function for item removal
function removeItem(index) {
  var cart = getCart();
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  setCart(cart);
  loadCart(); // Reload the cart to update display
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
    lines.push((i + 1) + ". " + it.name + " — " + formatINR(price) + " x " + qty + " = " + formatINR(line));
  }

  var msg = "🛒 New Order - " + STORE_NAME + "\n\n";
  msg += lines.join("\n");
  msg += "\n\nTotal: " + formatINR(subtotal) + "\n";
  msg += "Shipping: Free\n";
  msg += "\nPlease confirm the order.";

  return msg;
}

// Global function for WhatsApp order
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

// Use DOMContentLoaded instead of window.onload for better performance
document.addEventListener('DOMContentLoaded', loadCart); 

// Listen for storage changes from other tabs/windows
window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
        loadCart();
    }
});
