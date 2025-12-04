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

/* =========================
   ADDITIONAL NEW FEATURES (all added WITHOUT removing any original code)
   - Monthly time-series chart (line)
   - Grouping (weekly/monthly) summaries
   - Print report creation + print button
   - More categories added already in HTML
   - Single-seed and UI hooks (seed button)
   - Safe parsing of edit-suffixed dates
   ========================= */

/* Utility: parse a date string created by this app (handles " (edited)" suffix) */
function parseDateFromString(dateStr) {
    if (!dateStr) return null;
    // If it contains "(", remove everything from first space + '(' to allow "MM/DD/YYYY (edited)"
    const idx = dateStr.indexOf('(');
    const cleaned = idx !== -1 ? dateStr.slice(0, idx).trim() : dateStr.trim();
    // Some browsers may store dates as "YYYY-MM-DD" in seed; try Date parsing
    const d = new Date(cleaned);
    if (!isNaN(d)) return d;
    // Try locale / MM/DD/YYYY fallback (split by /)
    const parts = cleaned.split(/[\/\-\.]/).map(p => parseInt(p,10));
    if (parts.length >=3) {
        // detect if it is yyyy-mm-dd or mm/dd/yyyy
        if (parts[0] > 31) {
            return new Date(parts[0], (parts[1]||1)-1, parts[2]||1);
        } else {
            return new Date(parts[2], (parts[0]||1)-1, parts[1]||1);
        }
    }
    return null;
}

/* Build monthly time-series data from transactions */
function buildMonthlySeries() {
    const series = {}; // key: YYYY-MM, value: { income, expense }
    transactions.forEach(t => {
        const d = parseDateFromString(t.date) || new Date();
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        if (!series[key]) series[key] = { income: 0, expense: 0 };
        if (t.type === 'income') series[key].income += t.amount;
        else series[key].expense += t.amount;
    });
    // sort keys ascending
    const keys = Object.keys(series).sort();
    const labels = keys;
    const incomes = keys.map(k => series[k].income);
    const expenses = keys.map(k => series[k].expense);
    return { labels, incomes, expenses };
}

/* Time series chart instance */
let timeSeriesChart = null;
function showTimeSeriesChart() {
    const ctx = document.getElementById("financeChart").getContext("2d");
    const data = buildMonthlySeries();
    // fallback sample if no real data
    const labs = data.labels.length ? data.labels : [ (new Date()).getFullYear() + '-' + String((new Date()).getMonth()+1).padStart(2,'0') ];
    const inc = data.incomes.length ? data.incomes : [0];
    const exp = data.expenses.length ? data.expenses : [0];

    if (animatedChart) { animatedChart.destroy(); animatedChart = null; }
    if (timeSeriesChart) timeSeriesChart.destroy();

    timeSeriesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labs,
            datasets: [
                {
                    label: 'Income',
                    data: inc,
                    tension: 0.3,
                    fill: false,
                    borderColor: 'hsl(140 60% 40%)',
                    pointRadius: 4
                },
                {
                    label: 'Expense',
                    data: exp,
                    tension: 0.3,
                    fill: false,
                    borderColor: 'hsl(10 70% 50%)',
                    pointRadius: 4
                }
            ]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return `${ctx.dataset.label}: $${ctx.raw}`;
                        }
                    }
                }
            },
            maintainAspectRatio: false
        }
    });

    const canvas = document.getElementById("financeChart");
    canvas.style.height = "320px";
}

/* Hook chart mode UI */
const btnCategoryChart = document.getElementById("btnCategoryChart");
const btnTimeSeriesChart = document.getElementById("btnTimeSeriesChart");
btnCategoryChart.addEventListener("click", () => {
    updateAnimatedChart();
});
btnTimeSeriesChart.addEventListener("click", () => {
    showTimeSeriesChart();
});

/* Grouping summaries */
const groupBySelect = document.getElementById("groupBy");
const periodSummary = document.getElementById("periodSummary");

function buildGroupSummary() {
    const group = groupBySelect ? groupBySelect.value : 'monthly';
    if (group === 'none') {
        periodSummary.textContent = 'No grouping applied.';
        return;
    }
    if (group === 'monthly') {
        const series = buildMonthlySeries();
        // latest month summary
        if (!series.labels.length) {
            periodSummary.textContent = 'No monthly data.';
            return;
        }
        const last = series.labels[series.labels.length - 1];
        const income = series.incomes[series.incomes.length -1] || 0;
        const expense = series.expenses[series.expenses.length -1] || 0;
        periodSummary.innerHTML = `<strong>${last}</strong>: Income $${income} — Expenses $${expense}`;
    } else if (group === 'weekly') {
        // build week buckets: ISO week (approx using getWeek)
        const weekSums = {};
        transactions.forEach(t => {
            const d = parseDateFromString(t.date) || new Date();
            const y = d.getFullYear();
            // simple week number using Jan 1 offset
            const onejan = new Date(y,0,1);
            const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
            const key = `${y}-W${String(week).padStart(2,'0')}`;
            if (!weekSums[key]) weekSums[key] = { income:0, expense:0 };
            if (t.type === 'income') weekSums[key].income += t.amount;
            else weekSums[key].expense += t.amount;
        });
        const keys = Object.keys(weekSums).sort();
        if (!keys.length) { periodSummary.textContent = 'No weekly data.'; return; }
        const last = keys[keys.length-1];
        const s = weekSums[last];
        periodSummary.innerHTML = `<strong>${last}</strong>: Income $${s.income} — Expenses $${s.expense}`;
    }
}

/* update UI override to include group summary and chart selection handling */
const seedBtn = document.getElementById("seedBtn");
if (seedBtn) seedBtn.addEventListener("click", () => { seedSample(); });

if (groupBySelect) {
    groupBySelect.addEventListener("change", () => {
        buildGroupSummary();
        updateUI();
    });
}

/* Update chart on storage change and at load */
const originalUpdateUIRef = updateUI;
updateUI = function() {
    originalUpdateUIRef();
    buildGroupSummary();
};

/* Print report generation */
const printReportBtn = document.getElementById("printReportBtn");
const printArea = document.getElementById("printArea");
const printSummary = document.getElementById("printSummary");
const printTransactions = document.getElementById("printTransactions");

function makePrintFriendly() {
    // summary
    const inc = transactions.reduce((s,t)=> t.type==='income' ? s + t.amount : s, 0);
    const exp = transactions.reduce((s,t)=> t.type==='expense' ? s + t.amount : s, 0);
    const bal = inc - exp;
    printSummary.innerHTML = `<p><strong>Total Income:</strong> $${inc} &nbsp;&nbsp; <strong>Total Expense:</strong> $${exp} &nbsp;&nbsp; <strong>Balance:</strong> $${bal}</p>`;

    // transactions table
    const rows = transactions.map(t => {
        return `<tr><td>${t.date}</td><td>${t.title}</td><td>${t.category}</td><td>${t.type}</td><td>$${t.amount}</td></tr>`;
    }).join('');
    printTransactions.innerHTML = `<table class="print-table"><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>`;
}

printReportBtn.addEventListener("click", () => {
    makePrintFriendly();
    // show print area then trigger print
    window.setTimeout(() => {
        window.print();
    }, 100);
});

/* Also expose a CSV + PDF friendly export (CSV already exists). */

/* Ensure charts update when transactions change */
const originalUpdateLocalStorageRef = updateLocalStorage;
updateLocalStorage = function() {
    originalUpdateLocalStorageRef();
    // refresh charts & UI that depend on storage
    updateAnimatedChart();
    showTimeSeriesChart();
};

/* On load, ensure proper chart shown (category by default) */
window.addEventListener("load", () => {
    // show category breakdown initially
    updateAnimatedChart();
    buildGroupSummary();
});

/* Keep global helper to clear data if needed (dev) */
window.clearAllData = function() {
    if (!confirm("Clear all stored transactions?")) return;
    transactions = [];
    updateLocalStorage();
    updateUI();
};

/* ====== FIXES & ENHANCEMENTS ADDED BELOW (keeps your original JS above intact) ====== */

/* Guard helpers: ensure elements exist before operating */
function safeGet(id) {
    return document.getElementById(id) || null;
}

/* 1) Robust chart updater (avoids crashing when canvas/context missing) */
function safeUpdateAnimatedChart() {
    const canvas = safeGet('financeChart');
    if (!canvas) return;
    try {
        updateAnimatedChart();
    } catch (err) {
        console.warn('updateAnimatedChart error:', err);
    }
}
function safeShowTimeSeriesChart() {
    const canvas = safeGet('financeChart');
    if (!canvas) return;
    try {
        showTimeSeriesChart();
    } catch (err) {
        console.warn('showTimeSeriesChart error:', err);
    }
}

/* 2) Theme toggle (switch between default blue and glass/purple theme and persist) */
const themeToggleBtn = safeGet('themeToggle');
(function initTheme() {
    const saved = localStorage.getItem('finance-theme');
    if (saved === 'glass') {
        document.body.classList.add('theme-glass');
    } else {
        document.body.classList.remove('theme-glass');
    }
})();
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('theme-glass');
        const active = document.body.classList.contains('theme-glass') ? 'glass' : 'blue';
        localStorage.setItem('finance-theme', active);
    });
}

/* 3) Improve dark mode persistence & wiring (safe) */
const darkToggle = safeGet('darkModeToggle');
if (darkToggle) {
    darkToggle.addEventListener('change', () => {
        applyDarkMode(darkToggle.checked);
    });
    // initialize (already done by original initDark, re-apply)
    (function reinitDark() {
        const dark = localStorage.getItem("finance-dark") === "1";
        darkToggle.checked = dark;
        applyDarkMode(dark);
    })();
}

/* 4) Hook chart buttons safely */
const safeBtnCat = safeGet('btnCategoryChart');
const safeBtnTs = safeGet('btnTimeSeriesChart');
if (safeBtnCat) safeBtnCat.addEventListener('click', safeUpdateAnimatedChart);
if (safeBtnTs) safeBtnTs.addEventListener('click', safeShowTimeSeriesChart);

/* 5) Ensure exportCsvBtn exists */
const safeExportBtn = safeGet('exportCsvBtn');
if (safeExportBtn && !exportCsvBtn) {
    // create fallback - but original exportCsvBtn variable exists above usually
    safeExportBtn.addEventListener('click', () => {
        // reuse export CSV logic if exportCsvBtn wasn't bound earlier
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
}

/* 6) Make updateLocalStorage also refresh charts safely (ensure original behavior preserved) */
const origUpdateLocal = updateLocalStorage;
updateLocalStorage = function() {
    origUpdateLocal();
    safeUpdateAnimatedChart();
    safeShowTimeSeriesChart();
};

/* 7) Ensure initial charts render without throwing */
window.addEventListener('DOMContentLoaded', () => {
    // initial render after DOM ready
    try {
        safeUpdateAnimatedChart();
    } catch(e) {}
});

/* 8) Improve responsiveness on orientation change */
window.addEventListener('orientationchange', () => {
    // redraw chart to adapt to new size
    setTimeout(() => {
        safeUpdateAnimatedChart();
        safeShowTimeSeriesChart();
    }, 300);
});

/* 9) Improve print handler to reveal print area briefly (keeps original logic) */
if (typeof printReportBtn !== 'undefined' && printReportBtn) {
    printReportBtn.addEventListener('click', () => {
        makePrintFriendly();
        // show print area visually for print (some browsers hide rarely)
        const pa = safeGet('printArea');
        if (pa) pa.style.display = 'block';
        setTimeout(() => {
            window.print();
            if (pa) pa.style.display = '';
        }, 120);
    });
}

/* 10) Small helper: make sure seed button binds even if inserted later */
const safeSeed = safeGet('seedBtn');
if (safeSeed && !window.seedSampleBound) {
    safeSeed.addEventListener('click', () => {
        if (typeof seedSample === 'function') seedSample();
    });
    window.seedSampleBound = true;
}

/* 11) Fix: ensure transaction count updates even when filter hides items */
(function wrapUpdateUIForCount() {
    const orig = updateUI;
    updateUI = function() {
        orig();
        const el = safeGet('transactionsCount');
        if (el) el.textContent = `${transactions.length} total`;
    };
})();

/* End of FIXES & ENHANCEMENTS */