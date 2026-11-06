# XPENC Templates

Category templates for [XPENC](https://xpenc.in). Each one is a ready-made set of categories you can import in one tap. Browse and preview them all at **[xpenc.in/templates](https://xpenc.in/templates)**.

A template file holds only the structure: category names, icons, colours, and which categories sit under which. It contains no amounts, transactions, accounts or personal data.

## Quick setups

| Template | For | Categories |
|---|---|---|
| [50/30/20 Budget](quick-setups/50-30-20-budget.json) | Splitting spending into Needs (~50%) and Wants (~30%), with 20% saved to Goals | 22 |
| [Student](quick-setups/student.json) | College and hostel life: fees, books, canteen, travel passes, recharges | 34 |
| [Family Household](quick-setups/family-household.json) | Running a home: bills, ration, kids' school, vehicle, health, festivals, EMIs | 53 |

Templates shared by other users are in [community/](community/).

## How to use one

You need XPENC 1.6.6 or newer (currently in beta).

1. Download the template from [xpenc.in/templates](https://xpenc.in/templates), or open its file here and tap **Download raw file**.
2. In XPENC, go to **More → Categories**, tap **Templates** in the top bar, then **Import from file**.
3. The template is saved alongside your own. Nothing changes until you switch to it.

When you switch, categories with the same name (Rent, Food, Groceries and so on) are moved into place, and their history moves with them. Your past transactions keep the category they already have.

## Share yours

1. In XPENC, open **Templates** on the Categories screen, then use **Share as file** on any saved template.
2. Rename the file in lower-case-with-dashes, such as `freelancer.json`.
3. Open it in a text editor and add a `"description"` line under `"name"` that says who it's for:
   ```json
   "name": "Freelancer",
   "description": "Client payments in; software, internet, equipment and tax out.",
   ```
4. Open a pull request that adds the file to `community/`.

A check runs on every pull request and explains anything that needs fixing. The rules:

- One template per pull request, with a file name nobody has used yet.
- Structure only: `name`, `description`, and `income` and `expense` lists of categories with `name`, `icon`, `color` and `children`. Any other field is refused.
- At least one money-in and one money-out category. Names are unique within each.
- Up to two levels (a category and its subcategories) and at most 400 categories.

Once merged, the template appears on xpenc.in/templates within a few minutes.

## For maintainers

`index.json` lists every template and is what the website reads. It's rebuilt and committed automatically on every push to `main`. To build or check it locally:

```sh
node tools/build-index.mjs            # check every template and write index.json
node tools/build-index.mjs --validate # check only
```

When XPENC gains new icons, add their keys to `ICONS` in [tools/build-index.mjs](tools/build-index.mjs).
