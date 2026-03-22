let currentMenu = null;

const state = {
  burger: null,
  burgerModifiers: [],
  fries: null,
  friesDoneness: null,
  friesAddOns: [],
  drink: null,
  shake: null
};

async function fetchMenu() {
  const res = await fetch("data/menu.json");
  return res.json();
}

function filterItem(item, vegOnly, caOnly) {
  if (vegOnly && !item.vegetarian) return false;
  if (caOnly && !item.californiaOnly) return false;
  return true;
}

function getSelectedItem(select) {
  const opt = select.options[select.selectedIndex];
  return opt && opt.value ? JSON.parse(opt.dataset.itemJson) : null;
}

function populateSelect(id, items) {
  const el = document.getElementById(id);
  const prev = el.value;
  el.innerHTML = '<option value="">-- None --</option>';
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.name;
    opt.textContent = item.secret
      ? `${item.name} \uD83E\uDD2B ($${item.price.toFixed(2)})`
      : `${item.name} ($${item.price.toFixed(2)})`;
    opt.dataset.itemJson = JSON.stringify(item);
    el.appendChild(opt);
  });
  if ([...el.options].some(o => o.value === prev)) {
    el.value = prev;
  } else {
    el.value = "";
  }
}

function populateFriesDoneness(doneness) {
  const el = document.getElementById("friesDoneness");
  el.innerHTML = "";
  doneness.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.name;
    opt.textContent = d.secret ? `${d.name} \uD83E\uDD2B` : d.name;
    opt.dataset.itemJson = JSON.stringify(d);
    el.appendChild(opt);
  });
  el.value = "Regular";
}

function showDescription(divId, item) {
  document.getElementById(divId).textContent = item ? (item.description || "") : "";
}

function renderCheckboxGrid(containerId, items, onChangeFn) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";
  items.forEach(item => {
    const label = document.createElement("label");
    label.className = item.secret ? "modifier-item modifier-secret" : "modifier-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = item.name;
    cb.dataset.itemJson = JSON.stringify(item);

    const nameSpan = document.createElement("span");
    nameSpan.className = "modifier-name";
    nameSpan.textContent = item.secret ? `${item.name} \uD83E\uDD2B` : item.name;

    const descSpan = document.createElement("span");
    descSpan.className = "modifier-desc";
    descSpan.textContent = item.description || "";

    label.append(cb, nameSpan, descSpan);
    grid.appendChild(label);
  });
  grid.addEventListener("change", onChangeFn);
}

function onBurgerChange(e) {
  const item = getSelectedItem(e.target);
  state.burger = item;
  state.burgerModifiers = [];
  showDescription("burgerDescription", item);

  const grid = document.getElementById("burgerModifiers");
  grid.hidden = !item;
  if (item) {
    grid.querySelectorAll("input[type=checkbox]").forEach(cb => { cb.checked = false; });
  }
  updateOrder();
}

function onBurgerModifierChange(e) {
  const cb = e.target;
  if (!cb.matches("input[type=checkbox]")) return;
  const mod = JSON.parse(cb.dataset.itemJson);
  if (cb.checked) {
    state.burgerModifiers.push(mod);
  } else {
    state.burgerModifiers = state.burgerModifiers.filter(m => m.name !== mod.name);
  }
  updateOrder();
}

function onFriesChange(e) {
  const item = getSelectedItem(e.target);
  state.fries = item;
  state.friesAddOns = [];
  showDescription("friesDescription", item);

  const opts = document.getElementById("friesOptions");
  opts.hidden = !item;

  if (item) {
    document.getElementById("friesDoneness").value = "Regular";
    const regularDoneness = currentMenu.friesDoneness.find(d => d.name === "Regular");
    state.friesDoneness = regularDoneness || null;
    showDescription("friesDonenessDescription", regularDoneness);
    document.getElementById("friesAddOns").querySelectorAll("input[type=checkbox]").forEach(cb => { cb.checked = false; });
  } else {
    state.friesDoneness = null;
    showDescription("friesDonenessDescription", null);
  }
  updateOrder();
}

function onFriesDonenessChange(e) {
  const item = getSelectedItem(e.target);
  state.friesDoneness = item;
  showDescription("friesDonenessDescription", item);
  updateOrder();
}

function onFriesAddOnChange(e) {
  const cb = e.target;
  if (!cb.matches("input[type=checkbox]")) return;
  const addOn = JSON.parse(cb.dataset.itemJson);
  if (cb.checked) {
    state.friesAddOns.push(addOn);
  } else {
    state.friesAddOns = state.friesAddOns.filter(a => a.name !== addOn.name);
  }
  updateOrder();
}

function onDrinkChange(e) {
  state.drink = getSelectedItem(e.target);
  showDescription("drinkDescription", state.drink);
  updateOrder();
}

function onShakeChange(e) {
  state.shake = getSelectedItem(e.target);
  showDescription("shakeDescription", state.shake);
  updateOrder();
}

function onFilterChange() {
  const vegOnly = document.getElementById("vegetarianOnly").checked;
  const caOnly = document.getElementById("californiaOnly").checked;

  const prevBurger = state.burger ? state.burger.name : "";
  const prevDrink = state.drink ? state.drink.name : "";
  const prevShake = state.shake ? state.shake.name : "";

  populateSelect("burger", currentMenu.burgers.filter(i => filterItem(i, vegOnly, caOnly)));
  populateSelect("drink", currentMenu.drinks.filter(i => filterItem(i, vegOnly, caOnly)));
  populateSelect("shake", currentMenu.shakes.filter(i => filterItem(i, vegOnly, caOnly)));

  // Update state if previous selection is no longer available
  const burgerEl = document.getElementById("burger");
  state.burger = burgerEl.value ? state.burger : null;
  if (!burgerEl.value) {
    showDescription("burgerDescription", null);
    document.getElementById("burgerModifiers").hidden = true;
    state.burgerModifiers = [];
  }

  const drinkEl = document.getElementById("drink");
  state.drink = drinkEl.value ? state.drink : null;
  if (!drinkEl.value) showDescription("drinkDescription", null);

  const shakeEl = document.getElementById("shake");
  state.shake = shakeEl.value ? state.shake : null;
  if (!shakeEl.value) showDescription("shakeDescription", null);

  updateOrder();
}

function article(name) {
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

function joinAnd(arr) {
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")}, and ${arr[arr.length - 1]}`;
}

function generateVerbalOrder() {
  const parts = [];

  if (state.burger) {
    const styles = state.burgerModifiers.filter(m => m.category === "style").map(m => m.name);
    const adds   = state.burgerModifiers.filter(m => m.category === "add").map(m => m.name);
    const removes = state.burgerModifiers.filter(m => m.category === "remove")
                      .map(m => m.name.replace(/^No /, "").toLowerCase());

    let burgerStr = `${article(state.burger.name)} ${state.burger.name}`;
    if (styles.length) burgerStr += `, ${styles.join(", ")}`;
    if (adds.length)   burgerStr += `, with ${joinAnd(adds)}`;
    if (removes.length) burgerStr += `, hold the ${joinAnd(removes)}`;
    parts.push(burgerStr);
  }

  if (state.fries) {
    const doneness = state.friesDoneness && state.friesDoneness.name !== "Regular"
      ? state.friesDoneness.name : "";
    const addOns = state.friesAddOns.map(a => a.name);
    const qualifiers = [doneness, ...addOns].filter(Boolean);
    parts.push(qualifiers.length ? `fries, ${qualifiers.join(", ")}` : "fries");
  }

  if (state.drink) {
    parts.push(`${article(state.drink.name)} ${state.drink.name}`);
  }

  if (state.shake) {
    const shakeName = `${state.shake.name} shake`;
    parts.push(`${article(shakeName)} ${shakeName}`);
  }

  if (parts.length === 0) return null;
  if (parts.length === 1) return `Can I get ${parts[0]}?`;
  if (parts.length === 2) return `Can I get ${parts[0]} and ${parts[1]}?`;
  const last = parts.pop();
  return `Can I get ${parts.join(", ")}, and ${last}?`;
}

function updateOrder() {
  const lines = [];
  let total = 0;

  if (state.burger) {
    lines.push(`Burger: ${state.burger.name}`);
    total += state.burger.price;
    state.burgerModifiers.forEach(mod => {
      const priceStr = mod.price > 0 ? ` (+$${mod.price.toFixed(2)})` : "";
      lines.push(`  + ${mod.name}${priceStr}`);
      total += mod.price;
    });
    lines.push("");
  }

  if (state.fries) {
    const donenessStr = state.friesDoneness && state.friesDoneness.name !== "Regular"
      ? `, ${state.friesDoneness.name}`
      : "";
    lines.push(`Fries: ${state.fries.name}${donenessStr}`);
    total += state.fries.price;
    state.friesAddOns.forEach(addOn => {
      lines.push(`  + ${addOn.name} (+$${addOn.price.toFixed(2)})`);
      total += addOn.price;
    });
    lines.push("");
  }

  if (state.drink) {
    lines.push(`Drink: ${state.drink.name}`);
    total += state.drink.price;
    lines.push("");
  }

  if (state.shake) {
    lines.push(`Shake: ${state.shake.name}`);
    total += state.shake.price;
    lines.push("");
  }

  const out = document.getElementById("orderOutput");
  if (lines.length === 0) {
    out.textContent = "Select items to build your order...";
  } else {
    out.textContent =
      `*** IN-N-OUT ORDER ***\n\n` +
      lines.join("\n") +
      `Total: $${total.toFixed(2)}\n\n` +
      `"That's ready in a few!"`;
  }

  const verbal = generateVerbalOrder();
  const verbalBox = document.getElementById("verbalOrder");
  if (verbal) {
    document.getElementById("verbalText").textContent = verbal;
    verbalBox.hidden = false;
  } else {
    verbalBox.hidden = true;
  }

  const receipt = document.querySelector(".receipt");
  receipt.classList.remove("animate");
  void receipt.offsetWidth;
  receipt.classList.add("animate");
}

function attachEvents() {
  document.getElementById("burger").addEventListener("change", onBurgerChange);
  document.getElementById("fries").addEventListener("change", onFriesChange);
  document.getElementById("friesDoneness").addEventListener("change", onFriesDonenessChange);
  document.getElementById("drink").addEventListener("change", onDrinkChange);
  document.getElementById("shake").addEventListener("change", onShakeChange);
  document.getElementById("vegetarianOnly").addEventListener("change", onFilterChange);
  document.getElementById("californiaOnly").addEventListener("change", onFilterChange);
}

document.addEventListener("DOMContentLoaded", async () => {
  currentMenu = await fetchMenu();

  populateSelect("burger", currentMenu.burgers);
  populateSelect("fries", currentMenu.fries);
  populateSelect("drink", currentMenu.drinks);
  populateSelect("shake", currentMenu.shakes);
  populateFriesDoneness(currentMenu.friesDoneness);

  renderCheckboxGrid("burgerModifiers", currentMenu.burgerModifiers, onBurgerModifierChange);
  renderCheckboxGrid("friesAddOns", currentMenu.friesAddOns, onFriesAddOnChange);

  attachEvents();
  updateOrder();
});
