
// ==========================================
// SIVVA SHOP — ОСНОВНОЙ JAVASCRIPT
// ==========================================

const PRODUCTS_STORAGE_KEY = "sivvaProducts";

let products = [];


// ==========================================
// Защита HTML от XSS
// ==========================================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}


// ==========================================
// Форматирование цены
// ==========================================

function formatPrice(price) {
    return Number(price || 0).toLocaleString("ru-RU") + " сом";
}


// ==========================================
// READ — загрузка товаров
// ==========================================

async function loadProducts() {

    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);

    if (savedProducts) {
        try {
            products = JSON.parse(savedProducts);

            if (!Array.isArray(products)) {
                throw new Error("Некорректный формат товаров");
            }

            return products;

        } catch (error) {
            console.error("Ошибка чтения товаров:", error);
            localStorage.removeItem(PRODUCTS_STORAGE_KEY);
        }
    }

    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error("Файл data.json должен содержать массив товаров");
        }

        saveProducts();

        return products;

    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
        products = [];
        return products;
    }
}


// ==========================================
// Сохранение товаров
// ==========================================

function saveProducts() {
    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
    );
}


// ==========================================
// КОРЗИНА
// ==========================================

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("sivvaCart") || "[]");
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("sivvaCart", JSON.stringify(cart));
}


// ==========================================
// ИЗБРАННОЕ
// ==========================================

function getFavorites() {
    try {
        return JSON.parse(
            localStorage.getItem("sivvaFavorites") || "[]"
        );
    } catch {
        return [];
    }
}


// ==========================================
// Создание карточки товара
// ==========================================

function productCard(product) {
    return `
        <div class="product-card">

            <img
                src="${escapeHtml(product.image)}"
                alt="${escapeHtml(product.title)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://placehold.co/600x500/e8dece/354638?text=SIVVA+SHOP'"
            >

            <div class="product-info">

                <h3>${escapeHtml(product.title)}</h3>

                <p class="muted">
                    ${escapeHtml(product.description)}
                </p>

                <div class="price">
                    ${formatPrice(product.price)}
                </div>

                <button onclick="addToCart(${Number(product.id)})">
                    В корзину
                </button>

                <button
                    class="secondary"
                    onclick="addToFavorites(${Number(product.id)})"
                >
                    ♡ Избранное
                </button>

                <p>
                    <a href="product.html?id=${Number(product.id)}">
                        Подробнее о товаре →
                    </a>
                </p>

            </div>
        </div>
    `;
}


// ==========================================
// Отображение товаров
// ==========================================

function renderProducts(list) {

    const element = document.getElementById("productList");

    if (!element) return;

    element.innerHTML = list.length
        ? list.map(productCard).join("")
        : '<p class="muted">Товаров пока нет.</p>';
}


// ==========================================
// CREATE — добавление в корзину
// ==========================================

function addToCart(id) {

    const product = products.find(
        item => Number(item.id) === Number(id)
    );

    if (!product) return;

    const cart = getCart();

    const cartItem = cart.find(
        item => Number(item.id) === Number(id)
    );

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            quantity: 1
        });
    }

    saveCart(cart);

    alert("Товар добавлен в корзину!");
}


// ==========================================
// Добавление в избранное
// ==========================================

function addToFavorites(id) {

    let favorites = getFavorites();

    id = Number(id);

    if (favorites.includes(id)) {
        alert("Этот товар уже в избранном.");
    } else {
        favorites.push(id);

        localStorage.setItem(
            "sivvaFavorites",
            JSON.stringify(favorites)
        );

        alert("Товар добавлен в избранное!");
    }
}


// ==========================================
// Фильтрация каталога
// ==========================================

function showCatalog(category) {

    let list = products;

    if (category !== "all") {
        list = products.filter(
            product => product.category === category
        );
    }

    renderProducts(list);
}


// ==========================================
// READ — отображение корзины
// ==========================================

function showCart() {

    const cart = getCart();

    const cartElement = document.getElementById("cartItems");
    const totalElement = document.getElementById("cartTotal");

    if (!cartElement || !totalElement) return;

    cartElement.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartElement.innerHTML =
            '<p class="muted">Корзина пока пуста.</p>';
    }

    cart.forEach(cartItem => {

        const product = products.find(
            item => Number(item.id) === Number(cartItem.id)
        );

        if (!product) return;

        const sum = Number(product.price) * Number(cartItem.quantity);

        total += sum;

        cartElement.innerHTML += `
            <div class="cart-row">

                <div>
                    <b>${escapeHtml(product.title)}</b>
                    <br>

                    <span class="muted">
                        ${formatPrice(product.price)} × ${cartItem.quantity}
                    </span>
                </div>

                <b>${formatPrice(sum)}</b>

                <button
                    class="secondary"
                    onclick="removeFromCart(${Number(product.id)})"
                >
                    Удалить
                </button>

            </div>
        `;
    });

    totalElement.textContent = formatPrice(total);
}


// ==========================================
// Удаление из корзины
// ==========================================

function removeFromCart(id) {

    let cart = getCart();

    cart = cart.filter(
        item => Number(item.id) !== Number(id)
    );

    saveCart(cart);

    showCart();
}


// ==========================================
// Отображение избранного
// ==========================================

function showFavorites() {

    const favorites = getFavorites();

    const favoriteProducts = products.filter(
        product => favorites.includes(Number(product.id))
    );

    renderProducts(favoriteProducts);
}


// ==========================================
// Подробная страница товара
// ==========================================

function showOneProduct() {

    const params = new URLSearchParams(
        window.location.search
    );

    const id = Number(params.get("id")) || 1;

    const product = products.find(
        item => Number(item.id) === id
    );

    const element = document.getElementById("oneProduct");

    if (!element) return;

    if (!product) {
        element.innerHTML =
            '<p class="muted">Товар не найден.</p>';
        return;
    }

    const specs = product.specs &&
        typeof product.specs === "object"
            ? Object.entries(product.specs).map(
                ([key, value]) => `
                    <p class="muted">
                        <b>${escapeHtml(key)}:</b>
                        ${escapeHtml(value)}
                    </p>
                `
            ).join("")
            : "";

    element.innerHTML = `
        <div class="grid">

            <div class="product-card">

                <img
                    src="${escapeHtml(product.image)}"
                    alt="${escapeHtml(product.title)}"
                    onerror="this.onerror=null;this.src='https://placehold.co/600x500/e8dece/354638?text=SIVVA+SHOP'"
                >

            </div>

            <div>

                <h1>${escapeHtml(product.title)}</h1>

                <p class="muted">
                    ${escapeHtml(product.description)}
                </p>

                <h2 class="price">
                    ${formatPrice(product.price)}
                </h2>

                ${specs}

                <p class="muted">
                    Уточните доступный размер и наличие перед покупкой.
                </p>

                <button onclick="addToCart(${Number(product.id)})">
                    Добавить в корзину
                </button>

            </div>

        </div>
    `;
}


// ==========================================
// Проверки формы заказа
// ==========================================

const fioRegex =
    /^[А-ЯЁа-яёA-Za-z]+(?:[-'][А-ЯЁа-яёA-Za-z]+)?(?:\s+[А-ЯЁа-яёA-Za-z]+(?:[-'][А-ЯЁа-яёA-Za-z]+)?){1,2}$/;

const phoneRegex = /^\+996\d{9}$/;

const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


// ==========================================
// Оформление заказа
// ==========================================

function submitOrder(event) {

    event.preventDefault();

    const name = document
        .getElementById("customerName")
        .value.trim();

    const phone = document
        .getElementById("customerPhone")
        .value.trim();

    const address = document
        .getElementById("customerAddress")
        .value.trim();

    const emailElement =
        document.getElementById("customerEmail");

    const email = emailElement
        ? emailElement.value.trim()
        : "";

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


// ==========================================
// Запуск сайта
// ==========================================

document.addEventListener("DOMContentLoaded", async function() {

    await loadProducts();

    const page = document.body.dataset.page;

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

        const form = document.getElementById("orderForm");

        if (form) {
            form.addEventListener("submit", submitOrder);
        }
    }

});
