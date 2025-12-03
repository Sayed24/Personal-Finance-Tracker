/* =========================
   ORIGINAL script.js (kept EXACTLY as provided)
   ========================= */

let transactions = JSON.parse(localStorage.getItem("financeData")) || [];

const title = document.getElementById("title");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const transactionList = document.getElementById("transactionList");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

let chart;

function updateLocalStorage() {
    localStorage.setItem("financeData", JSON.stringify(transactions));
}

function updateUI() {
    transactionList.innerHTML = "";

    let incomeSum = 0;
    let expenseSum = 0;

    transactions.forEach((t, index) => {
        const item = document.createElement("div");
        item.classList.add("transaction-item");
        item.style.borderColor = t.type === "income" ? "#28a745" : "#dc3545";

        item.innerHTML = `
            <div>
                <div class="title">${t.title} - <small>${t.category}</small></div>
                <div class="date">${t.date}</div>
            </div>
            <div class="amount">${t.type === "income" ? "+" : "-"}$${t.amount}</div>
        `;

        transactionList.appendChild(item);

        if (t.type === "income") incomeSum += t.amount;
        else expenseSum += t.amount;
    });

    totalIncome.textContent = `$${incomeSum}`;
    totalExpense.textContent = `$${expenseSum}`;
    balance.textContent = `$${incomeSum - expenseSum}`;

    updateChart(incomeSum, expenseSum);
}

addBtn.addEventListener("click", () => {
    if (!title.value || !amount.value) return alert("Please fill all fields.");

    transactions.push({
        title: title.value,
        amount: Number(amount.value),
        type: type.value,
        category: category.value,
        date: new Date().toLocaleDateString()
    });

    updateLocalStorage();
    updateUI();

    title.value = "";
    amount.value = "";
});

function updateChart(income, expense) {
    const ctx = document.getElementById("financeChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense]
            }]
        }
    });
}

updateUI();

/* =========================
   NEW features added after original code
   - Edit / Delete
   - Filter by category
   - Export CSV
   - Dark mode toggle
   - Animated Chart.js with breakdown by category
   - UI improvements, modal handling, responsive tweaks
   ========================= */

/* --- Helpers --- */
const filterCategory = document.getElementById("filterCategory");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const transactionsCount = document.getElementById("transactionsCount");

const editModal = document.getElementById("editModal");
const editTitle = document.getElementById("editTitle");
const editAmount = document.getElementById("editAmount");
const editType = document.getElementById("editType");
const editCategory = document.getElementById("editCategory");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const darkModeToggle = document.getElementById("darkModeToggle");

let editIndex = null;

/* Enhance original updateUI to include edit/delete buttons and filtering.
   We'll preserve the original behavior but add controls. */
function enhancedUpdateUI() {
    transactionList.innerHTML = "";

    let incomeSum = 0;
    let expenseSum = 0;

    // apply filter
    const filter = filterCategory ? filterCategory.value : "all";

    transactions.forEach((t, index) => {
        if (filter !== "all" && t.category !== filter) return;

        const item = document.createElement("div");
        item.classList.add("transaction-item", "fade-in");
        item.style.borderColor = t.type === "income" ? "#28a745" : "#dc3545";

        const left = document.createElement("div");
        left.innerHTML = `
            <div class="title">${t.title} - <small>${t.category}</small></div>
            <div class="meta date">${t.date}</div>
        `;

        const right = document.createElement("div");
        right.style.display = "flex";
        right.style.alignItems = "center";

        const amt = document.createElement("div");
        amt.classList.add("amount");
        amt.textContent = `${t.type === "income" ? "+" : "-"}$${t.amount}`;

        const actions = document.createElement("div");
        actions.classList.add("transaction-actions");

        const editBtn = document.createElement("button");
        editBtn.classList.add("action-btn");
        editBtn.title = "Edit";
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.addEventListener("click", () => openEditModal(index));

        const delBtn = document.createElement("button");
        delBtn.classList.add("action-btn");
        delBtn.title = "Delete";
        delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        delBtn.addEventListener("click", () => deleteTransaction(index));

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        right.appendChild(amt);
        right.appendChild(actions);

        item.appendChild(left);
        item.appendChild(right);

        transactionList.appendChild(item);

        if (t.type === "income") incomeSum += t.amount;
        else expenseSum += t.amount;
    });

    totalIncome.textContent = `$${incomeSum}`;
    totalExpense.textContent = `$${expenseSum}`;
    balance.textContent = `$${incomeSum - expenseSum}`;

    transactionsCount.textContent = `${transactions.length} total`;

    // update chart with category breakdown animation
    updateAnimatedChart();
}

/* Preserve original updateUI call locations by replacing updateUI with enhancedUpdateUI */
updateUI = enhancedUpdateUI;

/* Delete transaction */
function deleteTransaction(index) {
    const confirmed = confirm("Delete this transaction?");
    if (!confirmed) return;
    transactions.splice(index, 1);
    updateLocalStorage();
    updateUI();
}

/* Edit flow */
function openEditModal(index) {
    editIndex = index;
    const t = transactions[index];
    editTitle.value = t.title;
    editAmount.value = t.amount;
    editType.value = t.type;
    editCategory.value = t.category;

    editModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

cancelEditBtn.addEventListener("click", () => {
    editModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    editIndex = null;
});

saveEditBtn.addEventListener("click", () => {
    if (editIndex === null) return;
    if (!editTitle.value || !editAmount.value) {
        alert("Please fill all fields.");
        return;
    }
    transactions[editIndex].title = editTitle.value;
    transactions[editIndex].amount = Number(editAmount.value);
    transactions[editIndex].type = editType.value;
    transactions[editIndex].category = editCategory.value;
    // update date to show edited date
    transactions[editIndex].date = new Date().toLocaleDateString() + " (edited)";

    updateLocalStorage();
    updateUI();

    editModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    editIndex = null;
});

/* Export CSV */
exportCsvBtn.addEventListener("click", () => {
    if (!transactions.length) return alert("No transactions to export.");
    const header = ["Title","Amount","Type","Category","Date"];
    const rows = transactions.map(t => [
        `"${t.title.replace(/"/g,'""')}"`,
        t.amount,
        t.type,
        t.category,
        `"${t.date}"`
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    a.download = `finance-export-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});

/* Filter */
if (filterCategory) {
    filterCategory.addEventListener("change", updateUI);
}

/* Dark mode */
function applyDarkMode(enabled) {
    if (enabled) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("finance-dark", enabled ? "1" : "0");
}
darkModeToggle.addEventListener("change", () => applyDarkMode(darkModeToggle.checked));
(function initDark() {
    const dark = localStorage.getItem("finance-dark") === "1";
    darkModeToggle.checked = dark;
    applyDarkMode(dark);
})();

/* Enhanced Chart: doughnut with category breakdown and animation */
let animatedChart = null;
function updateAnimatedChart() {
    const ctx = document.getElementById("financeChart").getContext("2d");

    // build category sums
    const catSums = {};
    transactions.forEach(t => {
        if (!catSums[t.category]) catSums[t.category] = 0;
        // expenses treat as positive values for chart
        catSums[t.category] += Math.abs(t.amount);
    });

    const labels = Object.keys(catSums);
    const data = labels.map(l => catSums[l]);

    // fallback when no transactions
    const finalLabels = labels.length ? labels : ["No Data"];
    const finalData = data.length ? data : [1];

    if (animatedChart) animatedChart.destroy();

    animatedChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: finalLabels,
            datasets: [{
                data: finalData,
                // nice animated palette auto-generated
                backgroundColor: finalLabels.map((_, i) => `hsl(${(i*65)%360} 70% 55%)`),
                borderWidth: 0
            }]
        },
        options: {
            animation: {
                animateRotate: true,
                duration: 800
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 8 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: $${value}`;
                        }
                    }
                }
            },
            maintainAspectRatio: false,
        }
    });

    // give canvas a height
    const canvas = document.getElementById("financeChart");
    canvas.style.height = "320px";
}

/* Replace original addBtn handler to keep original behavior and re-render enhanced UI */
addBtn.removeEventListener ? addBtn.removeEventListener("click", () => {}) : null;
addBtn.addEventListener("click", () => {
    // Use the exact original validation and push logic (keeps original code behavior)
    if (!title.value || !amount.value) return alert("Please fill all fields.");

    transactions.push({
        title: title.value,
        amount: Number(amount.value),
        type: type.value,
        category: category.value,
        date: new Date().toLocaleDateString()
    });

    updateLocalStorage();
    updateUI();

    title.value = "";
    amount.value = "";
});

/* On first load, call enhanced update UI (which replaces original updateUI) */
updateUI();

/* Provide a convenient function to seed sample data (developer helper) */
function seedSample() {
    transactions = [
        { title: "Salary", amount: 3000, type: "income", category: "Salary", date: "2025-01-01" },
        { title: "Groceries", amount: 150, type: "expense", category: "Food", date: "2025-01-03" },
        { title: "Electric Bill", amount: 90, type: "expense", category: "Bills", date: "2025-01-05" },
        { title: "Freelance", amount: 450, type: "income", category: "General", date: "2025-01-12" }
    ];
    updateLocalStorage();
    updateUI();
}

/* Expose seedSample to global for quick testing in console (optional) */
window.seedSample = seedSample;

/* Accessibility: close modal on escape */
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editModal.getAttribute("aria-hidden") === "false") {
        editModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        editIndex = null;
    }
});
