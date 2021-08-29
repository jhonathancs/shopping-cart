const baseUrl = 'https://api.mercadolibre.com/sites/MLB/'; // search?q= detail?q=
const productUrl = 'https://api.mercadolibre.com/items/';
const btnClear = document.getElementsByClassName('empty-cart')[0];
const classCart = '.cart__items';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

// https://develproder.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/proderators/await
// https://develproder.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/proderators/async_function
// https://thoughtbot.com/blog/good-things-come-to-those-who-await#:~:text=returns%20a%20promise%3A-,const%20response%20%3D%20await%20fetch(%22https%3A%2F%2Fapi.example,value%20we%20assign%20to%20response%20.
async function Products() {
  const response = await fetch(`${baseUrl}search?q=computador`);
  const produto = await response.json();
  return produto;
}

async function ProductSeku(sku) {
  const response = await fetch(`${productUrl}${sku}`);
  const produto = await response.json();
  return produto;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function getPriceFromProductItem(item) {
  return item.price;
}

// https://develproder.mozilla.org/es/docs/Web/API/Storage/getItem
function LocalS() {
  const local = localStorage.getItem('cartitems') || [];
  if (typeof local === 'string') {
    if (local.includes(',')) return local.split(',');
    return [local];
  }
  localStorage.setItem('cartitems', '');
  return local;
}

function saveLocalS(sku) {
  const items = LocalS();
  if (sku === undefined) return localStorage.setItem('cartitems', '');
  if (items.length === 0) {
    localStorage.setItem('cartitems', sku);
  } else {
    localStorage.setItem('cartitems', items.concat(sku));
  }
}

function LimparLs() {
  localStorage.setItem('cartitems', '');
}

function LimparCart() {
  document.querySelector(classCart).innerHTML = '';
  LimparLs();
  document.querySelector('.total-price').innerHTML = 0;
}
btnClear.addEventListener('click', LimparCart);

function reloadLS() {
  const itens = document.querySelectorAll('.cart__item');
  if (itens.length === 0) return saveLocalS();
  LimparLs();
  itens.forEach((item) => saveLocalS(item.sku));
}

function SomaTotal(value, prod) {
  const precio = document.querySelector('.total-price');
  const arred = parseFloat(precio.innerHTML, 2);
  const calc = {
    '+': (value1, value2) => value1 + value2,
    '-': (value1, value2) => value1 - value2,
  };
  const calcFinal = calc[prod];
  precio.innerHTML = parseFloat(calcFinal(arred, value)).toFixed(2);
}

function cartItemClickListener() {
  SomaTotal(parseFloat(this.price), '-');
  this.remove();
  reloadLS();
}

function createCartItemElementPrice({
  id: sku,
  title: name,
  price: salePrice,
}) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.sku = sku;
  li.price = salePrice;
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  const cart = document.querySelector(classCart);
  cart.appendChild(li);
  SomaTotal(salePrice, '+');
  return li;
}

function createCartItemElement(objeto) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.sku = objeto.sku;
  li.price = objeto.price;
  li.innerText = `SKU: ${objeto.sku} | NAME: ${objeto.name} | PRICE: $${objeto.price}`;
  li.addEventListener('click', cartItemClickListener);
  const cartin = document.querySelector(classCart);
  cartin.appendChild(li);
  return li;
}

async function addCart() {
  const sku = getSkuFromProductItem(this.parentElement);
  const price = getPriceFromProductItem(this.parentElement);
  const name = this.parentElement.querySelector('span.item__title').innerText;
  SomaTotal(price, '+');
  createCartItemElement({ sku, name, price });
  saveLocalS(sku);
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  if (element === 'button') e.addEventListener('click', addCart);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({
  id: sku,
  title: name,
  thumbnail: image,
  price: salePrice,
}) {
  const section = document.createElement('section');
  section.className = 'item';
  section.price = salePrice;
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(
    createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'),
);

  return section;
}

function loadLocalStor() {
  const itens = LocalS();
  if (itens[0] === undefined) return;
  itens.forEach(async (item) =>
    createCartItemElementPrice(await ProductSeku(item)));
} 

window.onload = async () => {
  loadLocalStor();
  const products = await Products();
  document.querySelector('.loading').remove();
  products.results.forEach((product) => {
    const element = createProductItemElement(product);
    const items = document.querySelector('.items');
    items.appendChild(element);
  });
};