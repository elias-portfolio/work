const grid = document.querySelector('#productGrid');
const filters = [...document.querySelectorAll('.filter')];

let products = [];
let activeFilter = 'All';

function render() {
  const visible = activeFilter === 'All'
    ? products
    : products.filter((product) => product.category === activeFilter);

  grid.innerHTML = visible.map((product) => `
    <a class="product-card" href="${product.url}" aria-label="${product.title}">
      <img src="${product.image}" alt="${product.title}" loading="lazy" />
      <div class="product-meta">
        <h3 class="product-title">${product.title}</h3>
        <div class="product-sub">
          <span>${product.category}</span>
          <span>${product.price}</span>
        </div>
      </div>
    </a>
  `).join('');
}

function setFilter(filter) {
  activeFilter = filter;
  filters.forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
  render();
}

filters.forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));

document.querySelectorAll('[data-filter-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const filter = link.dataset.filterLink;
    window.setTimeout(() => setFilter(filter), 120);
  });
});

fetch('products.json')
  .then((response) => response.json())
  .then((data) => {
    products = data;
    render();
  });
