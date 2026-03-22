# In-N-Out Order Builder

A browser-based order builder for first-time In-N-Out visitors. Pick your burger, customize it, choose your sides and drinks, and get a clean receipt-style summary — without having to figure it all out at the counter.

## Features

- **Full menu coverage** — every item from the standard menu plus all known secret menu items
- **Modifier system** — combine styles freely: Double-Double Animal Style Protein Style is a real order you can build here
- **Item descriptions** — every item explains what it actually is, so you know what you're ordering
- **🤫 Secret menu** — secret items are marked in all dropdowns and modifier grids
- **Fries doneness** — all 7 levels (Very Light through Extra Well-Done)
- **Filters** — vegetarian-only and California-only modes

## Running It

The app uses `fetch()` to load menu data, so it needs a local server:

```bash
python3 -m http.server
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```
i-n-o-builder/
├── index.html          # App shell and layout
├── assets/
│   ├── css/style.css   # In-N-Out themed styles
│   └── js/app.js       # All app logic
└── data/
    └── menu.json       # Menu data (burgers, modifiers, fries, drinks, shakes)
```

## Menu Data (`data/menu.json`)

The menu is structured to separate base items from customizations:

| Key | Description |
|---|---|
| `burgers` | Base burger options |
| `burgerModifiers` | Styles and add-ons (Animal Style, Protein Style, etc.) |
| `fries` | Single base fry item |
| `friesDoneness` | 7 doneness levels |
| `friesAddOns` | Animal Style, Cheese, Roadkill |
| `drinks` | All 17 drink options |
| `shakes` | All 6 shake flavors |

Items have these optional fields:

- `"secret": true` — not on the menu board, but any location will make it
- `"vegetarian": true` — contains no meat
- `"californiaOnly": true` — only available at California locations
- `"description"` — plain-English explanation shown in the UI

## Secret Menu Reference

**Burgers**
- **3x3 / 4x4** — triple or quad patty+cheese stacks
- **Flying Dutchman** — two patties, two cheese slices, no bun
- **Wish Burger** — veggie toppings only, no meat or cheese

**Styles (modifiers)**
- **Animal Style** — mustard-fried patty, grilled onions, extra spread, extra pickles
- **Protein Style** — lettuce wrap instead of bun
- **Mustard Grilled** — mustard seared onto the patty while cooking
- **Grilled Onions** — slow-caramelized instead of raw
- **Double Meat** — extra patty, no extra cheese
- **Chilies** — diced mild green/yellow chiles
- **Spread on the Side** — sauce in a cup for dipping

**Fries**
- **Well-Done / Extra Well-Done** — extra crispy (highly recommended)
- **Animal Style** — melted cheese, grilled onions, spread
- **Cheese** — just melted cheese
- **Roadkill** — Animal Style fries with a Flying Dutchman crumbled on top

**Drinks**
- **Arnold Palmer** — half iced tea, half lemonade
- **Lemon-Up** — 7UP with lemon
- **Root Beer Float** — vanilla shake + Barq's root beer *(California only)*

**Shakes**
- **Neapolitan** — vanilla, chocolate, and strawberry layered
- **Black & White** — vanilla and chocolate blended
- **Around the World** — all three fully blended
