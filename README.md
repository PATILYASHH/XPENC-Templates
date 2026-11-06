# XPENC Templates

Category templates for [XPENC](https://xpenc.in). Each one is a ready-made set of categories you can import in one tap.

A template file holds only the structure: category names, icons, colours, and which categories sit under which. It contains no amounts, transactions, accounts or personal data.

## Quick setups

| Template | For | Categories |
|---|---|---|
| [50/30/20 Budget](quick-setups/50-30-20-budget.json) | Splitting spending into Needs (~50%) and Wants (~30%), with 20% saved to Goals | 22 |
| [Student](quick-setups/student.json) | College and hostel life: fees, books, canteen, travel passes, recharges | 34 |
| [Family Household](quick-setups/family-household.json) | Running a home: bills, ration, kids' school, vehicle, health, festivals, EMIs | 53 |

## How to use one

You need XPENC 1.6.6 or newer (currently in beta).

1. Open the template file above and download it (**Download raw file**).
2. In XPENC, go to **More → Categories**, tap **Templates** in the top bar, then **Import from file**.
3. The template is saved alongside your own. Nothing changes until you switch to it.

When you switch, categories with the same name (Rent, Food, Groceries and so on) are moved into place, and their history moves with them. Your past transactions keep the category they already have.

## Share yours

In XPENC, open **Templates** on the Categories screen, then use **Share as file** on any saved template. Open a pull request that adds the file to `community/`.

- One template per pull request, with a short, clear name.
- Structure only. The exported file already has nothing personal in it, so please don't add anything to it.
- Up to two levels (a category and its subcategories) and at most 400 categories.
