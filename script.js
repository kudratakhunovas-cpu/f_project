
const products = [
  { id: 1, title: "Classic Leather Sneakers", category: "sneakers", price: 12500, image: "images/shoe1.jpg", description: "Кожаные кроссовки в минималистичном стиле." },
  { id: 2, title: "Street Luxury Sneakers", category: "sneakers", price: 15800, image: "images/shoe2.jpg", description: "Премиальные кроссовки для городских образов." },
  { id: 3, title: "White Premium Sneakers", category: "sneakers", price: 13900, image: "images/shoe3.jpg", description: "Белые кроссовки с лаконичным дизайном." },
  { id: 4, title: "Elegant Heel Shoes", category: "heels", price: 11200, image: "images/shoe4.jpg", description: "Элегантные туфли для особых случаев." },
  { id: 5, title: "Black Classic Heels", category: "heels", price: 9800, image: "images/shoe5.jpg", description: "Классические чёрные туфли." },
  { id: 6, title: "Evening Luxury Heels", category: "heels", price: 14500, image: "images/shoe6.jpg", description: "Вечерняя модель с выразительным силуэтом." },
  { id: 7, title: "Leather Ankle Boots", category: "boots", price: 16900, image: "images/shoe7.jpg", description: "Кожаные ботинки на каждый день." },
  { id: 8, title: "Winter Premium Boots", category: "boots", price: 18500, image: "images/shoe8.jpg", description: "Стильные ботинки для прохладной погоды." },
  { id: 9, title: "Tall Elegant Boots", category: "boots", price: 21900, image: "images/shoe9.jpg", description: "Высокие сапоги с элегантным силуэтом." },
  { id: 10, title: "Limited Edition Sneakers", category: "sneakers", price: 24500, image: "images/shoe10.jpg", description: "Выразительная модель из премиальной подборки." }
];


function formatPrice(price) {
  return price.toLocaleString("ru-RU") + " сом";
}

// Работа с корзиночкой
function getCart() {
  let cart = localStorage.getItem("sivvaCart");
  return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
  localStorage.setItem("sivvaCart", JSON.stringify(cart));
}


function getFavorites() {
  return JSON.parse(localStorage.getItem("sivvaFavorites") || "[]");
}


function productCard(product) {
  return `
    <div class="product-card">
      <img
        src="${product.image}"
        alt="${product.title}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/600x500/e8dece/354638?text=SIVVA+SHOP'"
      >
      <div class="product-info">
        <h3>${product.title}</h3>
        <p class="muted">${product.description}</p>
        <div class="price">${formatPrice(product.price)}</div>
        <button onclick="addToCart(${product.id})">В корзину</button>
        <button class="secondary" onclick="addToFavorites(${product.id})">
          ♡ Избранное
        </button>
        <p>
          <a href="product.html?id=${product.id}">
            Подробнее о товаре →
          </a>
        </p>
      </div>
    </div>
  `;
}


function renderProducts(list) {
  let element = document.getElementById("productList");
  if (!element) return;
  element.innerHTML = list.map(productCard).join("");
}

function addToCart(id) {
  let product = products.find(item => item.id === id);
  if (!product) return;

  let cart = getCart();
  let cartItem = cart.find(item => item.id === id);

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  saveCart(cart);
  alert("Товар добавлен в корзину!");
}

function addToFavorites(id) {
  let favorites = getFavorites();

  if (favorites.includes(id)) {
    alert("Этот товар уже в избранном.");
  } else {
    favorites.push(id);
    localStorage.setItem("sivvaFavorites", JSON.stringify(favorites));
    alert("Товар добавлен в избранное!");
  }
}


function showCatalog(category) {
  let list = products;

  if (category !== "all") {
    list = products.filter(product => product.category === category);
  }

  renderProducts(list);
}


function showCart() {
  let cart = getCart();
  let cartElement = document.getElementById("cartItems");
  let totalElement = document.getElementById("cartTotal");

  if (!cartElement || !totalElement) return;

  cartElement.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartElement.innerHTML = "<p class='muted'>Корзина пока пуста.</p>";
  }

  cart.forEach(cartItem => {
    let product = products.find(item => item.id === cartItem.id);
    if (!product) return;

    let sum = product.price * cartItem.quantity;
    total += sum;

    cartElement.innerHTML += `
      <div class="cart-row">
        <div>
          <b>${product.title}</b><br>
          <span class="muted">
            ${formatPrice(product.price)} × ${cartItem.quantity}
          </span>
        </div>
        <b>${formatPrice(sum)}</b>
        <button class="secondary" onclick="removeFromCart(${product.id})">
          Удалить
        </button>
      </div>
    `;
  });

  totalElement.textContent = formatPrice(total);
}


function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  showCart();
}


function showFavorites() {
  let favorites = getFavorites();
  let favoriteProducts = products.filter(product => favorites.includes(product.id));
  let element = document.getElementById("productList");

  if (!element) return;

  if (favoriteProducts.length === 0) {
    element.innerHTML = "<p class='muted'>Пока нет избранных товаров.</p>";
  } else {
    renderProducts(favoriteProducts);
  }
}


function showOneProduct() {
  let params = new URLSearchParams(window.location.search);
  let id = Number(params.get("id")) || 1;
  let product = products.find(item => item.id === id);
  let element = document.getElementById("oneProduct");

  if (!element || !product) return;

  element.innerHTML = `
    <div class="grid">
      <div class="product-card">
        <img
          src="${product.image}"
          alt="${product.title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/600x500/e8dece/354638?text=SIVVA+SHOP'"
        >
      </div>
      <div>
        <h1>${product.title}</h1>
        <p class="muted">${product.description}</p>
        <h2 class="price">${formatPrice(product.price)}</h2>
        <p class="muted">
          Уточните доступный размер и наличие перед покупкой.
        </p>
        <button onclick="addToCart(${product.id})">
          Добавить в корзину
        </button>
      </div>
    </div>
  `;
}



const fioRegex =
  /^[А-ЯЁа-яёA-Za-z]+(?:[-'][А-ЯЁа-яёA-Za-z]+)*(?:\s+[А-ЯЁа-яёA-Za-z]+(?:[-'][А-ЯЁа-яёA-Za-z]+)*){1,2}$/;


const phoneRegex = /^\+996\d{9}$/;


const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;



function submitOrder(event) {
  event.preventDefault();

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const emailElement = document.getElementById("customerEmail");

  const email = emailElement ? emailElement.value.trim() : "";


  if (getCart().length === 0) {
    alert("Сначала добавьте товар в корзину.");
    return;
  }


  if (!fioRegex.test(name)) {
    alert("Введите корректное ФИО: фамилию и имя.");
    return;
  }

 
  const cleanPhone = phone.replace(/[\s()-]/g, "");


  if (!phoneRegex.test(cleanPhone)) {
    alert("Введите номер Кыргызстана в формате +996555123456.");
    return;
  }


  if (!emailRegex.test(email)) {
    alert("Введите корректный адрес электронной почты.");
    return;
  }

  
  if (address === "") {
    alert("Введите адрес доставки.");
    return;
  }

  alert(
    "Спасибо, " + name +
    "! Ваша заявка оформлена.\n" +
    "Телефон: " + cleanPhone +
    "\nEmail: " + email
  );

  saveCart([]);
  event.target.reset();
}



document.addEventListener("DOMContentLoaded", function() {
  let page = document.body.dataset.page;

  if (page === "home") {
    renderProducts(products.slice(0, 4));
  }

  if (page === "catalog") {
    showCatalog("all");
  }

  if (page === "sneakers") {
    showCatalog("sneakers");
  }

  if (page === "heels") {
    showCatalog("heels");
  }

  if (page === "boots") {
    showCatalog("boots");
  }

  if (page === "cart") {
    showCart();
  }

  if (page === "favorites") {
    showFavorites();
  }

  if (page === "product") {
    showOneProduct();
  }

  if (page === "order") {
    let form = document.getElementById("orderForm");

    if (form) {
      form.addEventListener("submit", submitOrder);
    }
  }
});

```javascript
// Анимация карточек товаров

document.addEventListener("DOMContentLoaded", function() {

  let cards = document.querySelectorAll(".product-card");

  cards.forEach(card => {

    // Событие 1: наведение мыши
    card.addEventListener("mouseenter", function() {
      card.style.transform = "translateY(-5px)";
      card.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
    });

    // Событие 2: уход мыши
    card.addEventListener("mouseleave", function() {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "";
    });

    // Событие 3: нажатие на карточку
    card.addEventListener("click", function(event) {

      if (
        event.target.closest("button") ||
        event.target.closest("a")
      ) {
        return;
      }

      card.style.transform = "scale(0.97)";

      setTimeout(function() {
        card.style.transform = "translateY(0)";
      }, 200);

    });

  });

});
```
