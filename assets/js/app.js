
async function fetchMenu() {
  const res = await fetch("data/menu.json");
  return res.json();
}

function populateSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">-- None --</option>';
  options.forEach(opt => {
    const el = document.createElement("option");
    el.value = opt.name;
    el.textContent = `${opt.name} ${opt.price ? `($${opt.price.toFixed(2)})` : ''}`;
    el.dataset.vegetarian = opt.vegetarian || false;
    el.dataset.california = opt.californiaOnly || false;
    el.dataset.price = opt.price || 0;
    select.appendChild(el);
  });
}

function updateOrder() {
  const burger = document.getElementById("burger");
  const fries = document.getElementById("fries");
  const drink = document.getElementById("drink");
  const shake = document.getElementById("shake");

  const lines = [];
  let total = 0;

  [burger, fries, drink, shake].forEach(select => {
    if (select.value) {
      const price = parseFloat(select.options[select.selectedIndex].dataset.price || 0);
      lines.push(`- ${select.value} ($${price.toFixed(2)})`);
      total += price;
    }
  });

  const out = document.getElementById("orderOutput");
  out.textContent = lines.length
    ? `*** IN-N-OUT RECEIPT ***\n\n${lines.join("\n")}\n\nTotal: $${total.toFixed(2)}\n\n"That’ll be ready in a few!"`
    : "Select items to build your order...";

  const receipt = document.querySelector(".receipt");
  receipt.classList.remove("animate");
  void receipt.offsetWidth;
  receipt.classList.add("animate");
}

function applyFilters(menu) {
  const vegOnly = document.getElementById("vegetarianOnly").checked;
  const caOnly = document.getElementById("californiaOnly").checked;

  const filterFn = item =>
    (!vegOnly || item.vegetarian) &&
    (!caOnly || !item.californiaOnly || item.californiaOnly === true);

  populateSelect("burger", menu.burgers.filter(filterFn));
  populateSelect("fries", menu.fries.filter(filterFn));
  populateSelect("drink", menu.drinks.filter(filterFn));
  populateSelect("shake", menu.shakes.filter(filterFn));
}

document.addEventListener("DOMContentLoaded", async () => {
  const menu = await fetchMenu();
  applyFilters(menu);
  updateOrder();

  document.querySelectorAll("select, input[type=checkbox]").forEach(el =>
    el.addEventListener("change", () => {
      applyFilters(menu);
      updateOrder();
    })
  );
});
