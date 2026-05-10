const grid = document.querySelector('#productGrid');
const filters = [...document.querySelectorAll('.filter')];
let products = [];
let activeFilter = 'All';

function normalizeUrl(url) {
  if (!url) return 'https://www.karlssonandwickman.com/ethnic-jewelry';
  return url.replace('https://www.karlssonandwickman.comhttps://www.karlssonandwickman.com', 'https://www.karlssonandwickman.com');
}

function objectFamily(product) {
  if (product.category === 'Bracelets') return 'Bracelet';
  if (product.category === 'Necklaces') return 'Necklace';
  if (product.category === 'Pendants') return 'Pendant';
  if (product.category === 'Earrings') return 'Earrings';
  if (product.category === 'Belts') return 'Belt';
  return 'Object';
}

function imagePath(product) {
  return `../${product.image}`;
}

function render() {
  const visible = activeFilter === 'All'
    ? products
    : products.filter((product) => product.category === activeFilter);

  grid.innerHTML = visible.map((product) => `
    <a class="product-card" href="${normalizeUrl(product.url)}" aria-label="${product.title}">
      <div class="product-card__media">
        <span class="badge">${product.price === 'Price on request' ? 'On request' : 'Available'}</span>
        <img src="${imagePath(product)}" alt="${product.title}" loading="lazy" />
      </div>
      <div class="product-info">
        <p class="designer">${objectFamily(product)}</p>
        <h3 class="product-title">${product.title}</h3>
        <p class="product-price">${product.price}</p>
      </div>
      <span class="product-action">View object</span>
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

fetch('../products.json')
  .then((response) => {
    if (!response.ok) throw new Error(`Could not load products: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    products = data;
    render();
  })
  .catch((error) => {
    grid.innerHTML = `<p class="product-title">${error.message}</p>`;
  });
