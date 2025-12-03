// SELECTORS
const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");
const filterCategory = document.getElementById("filterCategory");

let transactions = [];
let editId = null;

// CHART DATA
let chart;
const ctx = document.getElementById("financeChart");

// DARK MODE
document.getElementById("darkModeToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

// ADD OR UPDATE TRANSACTION
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const desc = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    if (editId !== null) {
        transactions[editId] = { desc, amount, category };
        editId = null;
    } else {
        transactions.push({ desc, amount, category });
    }

    form.reset();
    updateUI();
});

// UPDATE TOTALS + LIST + CHART
function updateUI() {
    list.innerHTML = "";

    let income = 0;
    let expenses = 0;

    const filtered =
        filterCategory.value === "All"
            ? transactions
            : transactions.filter(t => t.category === filterCategory.value);

    filtered.forEach((t, index) => {
        if (t.amount >= 0) income += t.amount;
        else expenses += Math.abs(t.amount);

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${t.desc} — $${t.amount} (${t.category})</span>
            <div class="action-btns">
                <button class="edit-btn" onclick="editTransaction(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
            </div>
        `;
        list.appendChild(li);
    });

    document.getElementById("totalIncome").innerText = `$${income}`;
    document.getElementById("totalExpenses").innerText = `$${expenses}`;
    document.getElementById("balance").innerText = `$${income - expenses}`;

    drawChart(income, expenses);
}

// EDIT
function editTransaction(i) {
    const t = transactions[i];
    document.getElementById("description").value = t.desc;
    document.getElementById("amount").value = t.amount;
    document.getElementById("category").value = t.category;

    editId = i;
}

// DELETE
function deleteTransaction(i) {
    transactions.splice(i, 1);
    updateUI();
}

// CHART.JS
function drawChart(income, expenses) {
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Income", "Expenses"],
            datasets: [{
                data: [income, expenses],
                borderWidth: 1
            }]
        },
        options: {
            animation: { duration: 800 },
            responsive: true
        }
    });
}

// FILTER
filterCategory.addEventListener("change", updateUI);

// EXPORT CSV
document.getElementById("exportCSV").onclick = () => {
    let csv = "Description,Amount,Category\n";

    transactions.forEach(t => {
        csv += `${t.desc},${t.amount},${t.category}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "finance-tracker.csv";
    a.click();
};