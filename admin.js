
// ==========================================
// SIVVA SHOP — ADMIN PANEL
// CRUD: CREATE, READ, UPDATE, DELETE
// ==========================================

const PRODUCTS_STORAGE_KEY = "sivvaProducts";

// Получаем элементы HTML
const productForm = document.getElementById("productForm");

const productIdInput = document.getElementById("productId");
const titleInput = document.getElementById("productTitle");
const categoryInput = document.getElementById("productCategory");
const priceInput = document.getElementById("productPrice");
const imageInput = document.getElementById("productImage");
const descriptionInput = document.getElementById("productDescription");
const specsInput = document.getElementById("productSpecs");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

const productsContainer = document.getElementById("adminProducts");
const countElement = document.getElementById("productCount");

let localProducts = [];


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
// Сохранение товаров
// ==========================================

function saveProducts() {
    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(localProducts)
    );
}


// ==========================================
// READ — получение товаров
// ==========================================

async function fetchProducts() {

    try {
        const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);

        if (saved) {
            localProducts = JSON.parse(saved);

            if (!Array.isArray(localProducts)) {
                throw new Error("Некорректный формат товаров");
            }

        } else {

            const response = await fetch("./data.json");

            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            localProducts = await response.json();

            if (!Array.isArray(localProducts)) {
                throw new Error("Файл data.json должен содержать массив товаров");
            }

            saveProducts();
        }

        renderProducts();

    } catch (error) {

        console.error("Ошибка загрузки товаров:", error);

        if (productsContainer) {
            productsContainer.innerHTML =
                '<p class="muted">Не удалось загрузить товары. Проверьте файл data.json.</p>';
        }
    }
}


// ==========================================
// Отображение всех товаров
// ==========================================

function renderProducts() {

    if (!productsContainer || !countElement) return;

    countElement.textContent = localProducts.length;

    if (localProducts.length === 0) {
        productsContainer.innerHTML =
            '<p class="muted">Товаров пока нет.</p>';
        return;
    }

    productsContainer.innerHTML = localProducts.map(product => `

        <article class="admin-product">

            <img
                src="${escapeHtml(product.image)}"
                alt="${escapeHtml(product.title)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://placehold.co/180x180/e8dece/354638?text=SIVVA'"
            >

            <div class="admin-product-info">

                <h3>
                    ${escapeHtml(product.title)}
                </h3>

                <p class="muted">
                    ${escapeHtml(product.category)}
                    · ID: ${Number(product.id)}
                </p>

                <p class="price">
                    ${formatPrice(product.price)}
                </p>

                <p class="muted">
                    ${escapeHtml(product.description)}
                </p>

                <div class="admin-actions">

                    <button
                        type="button"
                        data-action="edit"
                        data-id="${Number(product.id)}"
                    >
                        Редактировать
                    </button>

                    <button
                        type="button"
                        class="danger"
                        data-action="delete"
                        data-id="${Number(product.id)}"
                    >
                        Удалить
                    </button>

                </div>

            </div>

        </article>

    `).join("");
}


// ==========================================
// Обработка кнопок редактирования и удаления
// ==========================================

if (productsContainer) {

    productsContainer.addEventListener("click", function(event) {

        const btn = event.target.closest("button[data-action]");

        if (!btn) return;

        const id = Number(btn.dataset.id);

        if (btn.dataset.action === "edit") {
            prepareUpdate(id);
        }

        if (btn.dataset.action === "delete") {
            deleteProduct(id);
        }

    });
}


// ==========================================
// CREATE и UPDATE — добавление и изменение
// ==========================================

if (productForm) {

    productForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const id = productIdInput.value;

        const title = titleInput.value.trim();
        const category = categoryInput.value;
        const price = Number(priceInput.value);
        const image = imageInput.value.trim();
        const description = descriptionInput.value.trim();

        // Проверка обязательных полей
        if (
            !title ||
            !category ||
            !price ||
            price < 1 ||
            !image ||
            !description
        ) {
            alert("Заполните все обязательные поля и укажите корректную цену.");
            return;
        }

        // Проверка характеристик товара
        let specs = {};

        try {

            specs = specsInput.value.trim()
                ? JSON.parse(specsInput.value)
                : {};

            if (
                specs === null ||
                Array.isArray(specs) ||
                typeof specs !== "object"
            ) {
                throw new Error("Некорректные характеристики");
            }

        } catch (error) {

            alert(
                'Проверьте формат характеристик. Пример: {"Материал":"Кожа","Цвет":"Белый"}'
            );

            return;
        }

        const productData = {
            title,
            category,
            price,
            image,
            description,
            specs
        };

        if (id) {

            // UPDATE — изменение товара

            localProducts = localProducts.map(product =>

                Number(product.id) === Number(id)
                    ? {
                        ...product,
                        ...productData,
                        id: Number(id)
                    }
                    : product

            );

            alert("Товар успешно обновлён!");

        } else {

            // CREATE — добавление нового товара

            const newId = localProducts.length
                ? Math.max(
                    ...localProducts.map(product => Number(product.id))
                ) + 1
                : 1;

            const newProduct = {
                id: newId,
                ...productData
            };

            localProducts.unshift(newProduct);

            alert("Товар успешно добавлен!");
        }

        saveProducts();

        resetForm();

        renderProducts();

    });
}


// ==========================================
// Подготовка редактирования товара
// ==========================================

function prepareUpdate(id) {

    const product = localProducts.find(
        item => Number(item.id) === Number(id)
    );

    if (!product) return;

    productIdInput.value = product.id;

    titleInput.value = product.title;
    categoryInput.value = product.category;
    priceInput.value = product.price;
    imageInput.value = product.image;
    descriptionInput.value = product.description;

    specsInput.value = JSON.stringify(
        product.specs || {},
        null,
        2
    );

    submitBtn.textContent = "Сохранить изменения";

    cancelBtn.style.display = "inline-block";

    document.getElementById("formTitle").textContent =
        "Редактировать товар";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// DELETE — удаление товара
// ==========================================

function deleteProduct(id) {

    id = Number(id);

    if (!confirm("Вы действительно хотите удалить этот товар?")) {
        return;
    }

    localProducts = localProducts.filter(
        product => Number(product.id) !== id
    );

    // Удаление товара из корзины
    let cart = [];

    try {
        cart = JSON.parse(
            localStorage.getItem("sivvaCart") || "[]"
        );
    } catch (error) {
        console.error("Ошибка чтения корзины:", error);
    }

    cart = cart.filter(
        item => Number(item.id) !== id
    );

    // Удаление товара из избранного
    let favorites = [];

    try {
        favorites = JSON.parse(
            localStorage.getItem("sivvaFavorites") || "[]"
        );
    } catch (error) {
        console.error("Ошибка чтения избранного:", error);
    }

    favorites = favorites.filter(
        favoriteId => Number(favoriteId) !== id
    );

    localStorage.setItem(
        "sivvaCart",
        JSON.stringify(cart)
    );

    localStorage.setItem(
        "sivvaFavorites",
        JSON.stringify(favorites)
    );

    saveProducts();

    renderProducts();

    alert("Товар удалён!");
}


// ==========================================
// Очистка формы
// ==========================================

function resetForm() {

    if (!productForm) return;

    productForm.reset();

    productIdInput.value = "";

    submitBtn.textContent = "Добавить товар";

    cancelBtn.style.display = "none";

    document.getElementById("formTitle").textContent =
        "Добавить новый товар";
}


// ==========================================
// Кнопка отмены редактирования
// ==========================================

if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
}


// ==========================================
// Запуск административной панели
// ==========================================

fetchProducts();
