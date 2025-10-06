/* ===========================
   cart.js — Trueverse Oil (Final Version with Plus/Minus Qty Buttons & Checkout Form)
   =========================== */

/* ---- CONFIG ---- */
var STORAGE_KEY = "cart";
var STORE_NAME = "Trueverse Oil";
var WHATSAPP_PHONE = "919092418710";
var MOBILE_BREAKPOINT = 600; 

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
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/* ===========================
   GLOBAL CART MANAGEMENT FUNCTIONS
   =========================== */

// Handles button clicks (+/-)
function changeQuantity(index, delta) {
    var cart = getCart();
    index = parseInt(index, 10); 
    if (isNaN(index) || !cart[index]) return;

    var currentQty = Number(cart[index].quantity) || 1;
    var newQty = currentQty + delta;

    if (newQty < 1) newQty = 1;

    cart[index].quantity = newQty;
    setCart(cart);
    renderCart(); // Re-render to update totals and display
}

// Handles manual input change
function updateQuantity(index, quantity) {
  var cart = getCart();
  index = parseInt(index, 10); 
  if (isNaN(index) || !cart[index]) return;

  var q = parseInt(quantity, 10);
  if (isNaN(q) || q < 1) q = 1; 
  cart[index].quantity = q;
  setCart(cart);
  renderCart();
}

function removeItem(index) {
  var cart = getCart();
  index = parseInt(index, 10); 
  if (isNaN(index) || index < 0 || index >= cart.length) return;
  
  if (!confirm("Are you sure you want to remove this item from your cart?")) {
      return;
  }

  cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

// Function to collect details and send order via WhatsApp (UPDATED)
function orderInWhatsApp() {
    var cart = getCart();
    if (!cart.length) {
        alert("Your cart is empty! Add products before ordering.");
        return;
    }
    
    // 1. Get Customer Input from form fields
    var name = document.getElementById('customer-name').value.trim();
    var phone = document.getElementById('customer-phone').value.trim();
    var address = document.getElementById('customer-address').value.trim();

    // 2. Validate Input
    if (!name || !phone || !address) {
        alert("Please fill in your Full Name, Contact Phone Number, and Shipping Address in the form above to proceed with the order.");
        return;
    }
    
    // 3. Calculate Cart Details
    var subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    var lines = cart.map((it, i) => {
        var price = Number(it.price) || 0;
        var qty = Number(it.quantity) || 0;
        var line = price * qty;
        return (i + 1) + ". " + it.name + " — " + formatINR(price) + " x " + qty + " = " + formatINR(line);
    });

    // 4. Construct WhatsApp Message
    var msg = "🛒 NEW ORDER - " + STORE_NAME + "\n\n";
    
    msg += "--- Customer Details ---\n";
    msg += "Name: " + name + "\n";
    msg += "Phone: " + phone + "\n";
    msg += "Address: " + address + "\n\n";
    
    msg += "--- Order Summary ---\n";
    msg += lines.join("\n");
    msg += "\n\nSubtotal: " + formatINR(subtotal) + "\n";
    msg += "Shipping: Free\n";
    msg += "Total: " + formatINR(subtotal) + "\n\n";
    
    msg += "Please confirm availability and dispatch details. Thank you!";
    
    // 5. Open WhatsApp
    var url = "https://wa.me/" + WHATSAPP_PHONE + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
}


/* ===========================
   CART DISPLAY RENDERERS
   =========================== */

function updateCartCount() {
  var cart = getCart();
  var count = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  
  var elMain = document.getElementById("cart-count");
  var elMobile = document.getElementById("cart-count-mobile"); 
  
  if (elMain) elMain.textContent = String(count);
  if (elMobile) elMobile.textContent = String(count);
}

// Renders the cart into the TABLE (<tbody id="cart-items">)
function renderTable(cart, cartItemsEl, subtotalEl, totalEl) {
    cartItemsEl.innerHTML = "";
    var subtotal = 0;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Your cart is empty.</td></tr>';
    }

    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var price = Number(item.price) || 0;
        var qty = Number(item.quantity) || 1; 
        var lineTotal = price * qty;
        subtotal += lineTotal;

        var rowHtml =
            '<tr>' +
            '  <td>' +
            '    <div class="product-info-table">' +
            '      <img src="' + (item.image || "") + '" alt="' + item.name + '">' +
            '      <span>' + item.name + '</span>' +
            '    </div>' +
            '  </td>' +
            '  <td>' + formatINR(price) + '</td>' +
            '  <td style="text-align: center;">' +
            '    <div class="qty-controls">' +
            '      <button type="button" class="qty-btn minus-btn" onclick="changeQuantity(' + i + ', -1)">-</button>' +
            '      <input type="number" class="qty-input" id="qty-input-' + i + '" min="1" value="' + qty + '" onchange="updateQuantity(' + i + ', this.value)">' +
            '      <button type="button" class="qty-btn plus-btn" onclick="changeQuantity(' + i + ', 1)">+</button>' +
            '    </div>' +
            '  </td>' +
            '  <td class="item-total" style="text-align: center;">' + formatINR(lineTotal) + '</td>' +
            '  <td style="text-align: right;"><button onclick="removeItem(' + i + ')" class="remove-btn">X</button></td>' +
            '</tr>';

        cartItemsEl.insertAdjacentHTML("beforeend", rowHtml);
    }
    
    subtotalEl.textContent = formatINR(subtotal);
    totalEl.textContent = formatINR(subtotal);
}

// Renders the cart into the CARD (<div id="cart-cards">)
function renderCards(cart, cartCardsEl, subtotalEl, totalEl) {
    cartCardsEl.innerHTML = "";
    var subtotal = 0;

    if (cart.length === 0) {
        cartCardsEl.innerHTML = 
            '<div style="text-align:center; padding: 20px; background: white; border-radius: 12px; box-shadow: var(--subtle-shadow);">Your cart is empty.</div>';
    }

    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var price = Number(item.price) || 0;
        var qty = Number(item.quantity) || 1;
        var lineTotal = price * qty;
        subtotal += lineTotal;

        var cardHtml =
            '<div class="cart-item-card" data-item-index="' + i + '">' +
            '    <div class="product-info-card">' +
            '        <img src="' + (item.image || "") + '" alt="' + item.name + '">' +
            '        <div>' +
            '            <div class="product-name-card">' + item.name + '</div>' +
            '            <div>Unit Price: ' + formatINR(price) + '</div>' +
            '        </div>' +
            '    </div>' +
            '    <div class="price-details-card">' +
            '        <span class="label">Item Total:</span>' +
            '        <span class="value">' + formatINR(lineTotal) + '</span>' +
            '    </div>' +
            '    <div class="card-actions">' +
            '        <span class="label">Quantity:</span>' +
            '        <div class="qty-controls card-qty-controls">' +
            '          <button type="button" class="qty-btn minus-btn" onclick="changeQuantity(' + i + ', -1)">-</button>' +
            '          <input type="number" class="qty-input" id="qty-input-card-' + i + '" min="1" value="' + qty + '" onchange="updateQuantity(' + i + ', this.value)">' +
            '          <button type="button" class="qty-btn plus-btn" onclick="changeQuantity(' + i + ', 1)">+</button>' +
            '        </div>' +
            '        <button class="remove-btn" onclick="removeItem(' + i + ')">Remove</button>' +
            '    </div>' +
            '</div>';
        
        cartCardsEl.insertAdjacentHTML("beforeend", cardHtml);
    }
    
    subtotalEl.textContent = formatINR(subtotal);
    totalEl.textContent = formatINR(subtotal);
}

// Main function to render the cart (Chooses between table and cards)
function renderCart() {
  var cart = getCart();
  var subtotalEl = document.getElementById("subtotal");
  var totalEl = document.getElementById("total");
  var cartItemsEl = document.getElementById("cart-items"); 
  var cartCardsEl = document.getElementById("cart-cards"); 
  var cartTableWrapper = document.querySelector('.cart-table-wrapper'); 

  if (!subtotalEl || !totalEl) {
    updateCartCount();
    return;
  }

  var isMobileView = window.innerWidth <= MOBILE_BREAKPOINT;

  if (cartTableWrapper) cartTableWrapper.style.display = isMobileView ? 'none' : 'block';
  if (cartCardsEl) cartCardsEl.style.display = isMobileView ? 'block' : 'none';

  if (cartItemsEl && !isMobileView) {
      renderTable(cart, cartItemsEl, subtotalEl, totalEl);
      if (cartCardsEl) cartCardsEl.innerHTML = "";
  } else if (cartCardsEl && isMobileView) {
      renderCards(cart, cartCardsEl, subtotalEl, totalEl);
      if (cartItemsEl) cartItemsEl.innerHTML = "";
  } else {
      var subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
      subtotalEl.textContent = formatINR(subtotal);
      totalEl.textContent = formatINR(subtotal);
  }
  
  updateCartCount();
}


/* ===========================
   MENU LOGIC
   =========================== */

function setupMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!menuBtn || !mobileMenu) return;
    
    function openMenu() {
      mobileMenu.classList.add('open');
      menuBtn.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
    }
    function closeMenu() {
      mobileMenu.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      menuBtn.focus();
    }
    function toggleMenu() {
      if (mobileMenu.classList.contains('open')) closeMenu(); else openMenu();
    }

    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });
    document.addEventListener('click', function (e) {
      if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target) && mobileMenu.classList.contains('open')) {
        closeMenu();
      }
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        closeMenu();
      }
    });
}


/* ===========================
   INIT
   =========================== */

document.addEventListener('DOMContentLoaded', function() {
    setupMenu();
    renderCart();
    window.addEventListener('resize', renderCart); 
}); 

window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
        renderCart();
    }
});
