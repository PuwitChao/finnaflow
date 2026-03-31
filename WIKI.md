# FinnaFlow CSV Guide 📄

Welcome to the FinnaFlow CSV integration guide. This document explains how to structure your financial data in a CSV format for seamless import into the application.

## 1. CSV Structure

To import your data, your CSV file MUST follow this exact header format (Case Sensitive):

```csv
Type,Name,Amount,Frequency,Category
```

### Column Definitions:

| Column | Description | Supported Values |
|---|---|---|
| **Type** | The nature of the entry. | `Income`, `Expense` |
| **Name** | A label for the item. | Any text (e.g., "Salary", "Rent") |
| **Amount** | The numeric value. | Positive numbers (e.g., `1200.50`) |
| **Frequency** | How often it occurs. | `Weekly`, `Monthly`, `Yearly` |
| **Category** | The logical grouping. | `Needs`, `Wants`, `Savings`, `Investments`, `Debt`, or any custom text. |

---

## 2. Example Data

You can copy and paste this into a text editor and save it as `my_budget.csv`:

```csv
Type,Name,Amount,Frequency,Category
Income,Main Salary,4500,Monthly,Earnings
Income,Freelance Project,300,Weekly,Business
Expense,Luxury Apartment,1800,Monthly,Needs
Expense,Organic Groceries,150,Weekly,Needs
Expense,Netflix,15.99,Monthly,Wants
Expense,Stock Portfolio,500,Monthly,Savings
```

---

## 3. Best Practices

1.  **Avoid Symbols**: Do not include currency symbols like `$` or `฿` in the **Amount** column. Use plain numbers only.
2.  **Quotes for Commas**: If your item names contain commas, wrap the name in double-quotes. (e.g., `"Food, Drinks & Fun"`).
3.  **Frequency Matching**: Make sure frequencies are capitalized exactly as `Weekly`, `Monthly`, or `Yearly`.
4.  **Encoding**: Save your file using **UTF-8** encoding to ensure special characters (like Thai script) are preserved correctly.

---

## 4. International Support (Thai)

คุณสามารถนำข้อมูลเข้าโดยใช้ภาษาไทยได้เช่นกัน:

```csv
Type,Name,Amount,Frequency,Category
Income,เงินเดือน,50000,Monthly,Earnings
Expense,ค่าเช่าบ้าน,15000,Monthly,Needs
```

---

*Need help? Open an issue on GitHub or consult the ARCHITECTURE.md for engine details.*
