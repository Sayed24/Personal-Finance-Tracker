// ELEMENTS
const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");
const filterCategory = document.getElementById("filterCategory");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

// DATA
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;

// CHART
let chart;
const ctx = document.getElementById("financeChart");

// MOBILE MENU TOGGLE
menuToggle.onclick = () => {
  mobileNav.classList.toggle("active");
};

// THEME TOGGLE
document.getElementById("themeToggle").onclick = () => {
  if (document.body.classList.contains("theme-blue")) {
    document.body.classList.remove("theme-blue");
    document.body.classList.add("theme-glass");
  } else {
    document.body.classList.remove("theme-glass");
    document.body.classList.add("theme-blue");
  }
};

// DARK MODE AUTO & TOGGLE
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add("dark");
}

document.getElementById("darkModeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// ADD / EDIT TRANSACTION
form.addEventListener("submit", e => {
  e.preventDefault();

  const desc = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!desc || isNaN(amount)) return;

  if (editId !== null) {
    transactions[editId] = { desc, amount, category };
    editId = null;
  } else {
    transactions.push({ desc, amount, category });
  }

  saveAndUpdate();
  form.reset();
});

// FILTER CATEGORY
filterCategory.addEventListener("change", updateUI);

// SAVE DATA
function saveAndUpdate() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

// UPDATE UI
function updateUI() {
  list.innerHTML = "";

  let income = 0, expenses = 0;
  const filtered = filterCategory.value === "All" ? transactions : transactions.filter(t => t.category === filterCategory.value);

  filtered.forEach((t, index) => {
    if (t.amount >= 0) income += t.amount;
    else expenses += Math.abs(t.amount);

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.desc} — $${t.amount.toFixed(2)} (${t.category})</span>
      <div class="action-btns">
        <button class="edit-btn" onclick="editTransaction(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction(${index})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });

  document.getElementById("totalIncome").innerText = `$${income.toFixed(2)}`;
  document.getElementById("totalExpenses").innerText = `$${expenses.toFixed(2)}`;
  document.getElementById("balance").innerText = `$${(income - expenses).toFixed(2)}`;

  drawChart(income, expenses);
}

// EDIT TRANSACTION
function editTransaction(i) {
  const t = transactions[i];
  document.getElementById("description").value = t.desc;
  document.getElementById("amount").value = t.amount;
  document.getElementById("category").value = t.category;
  editId = i;
}

// DELETE TRANSACTION
function deleteTransaction(i) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions.splice(i, 1);
    saveAndUpdate();
  }
}

// DRAW CHART
function drawChart(income, expenses) {
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [{
        data: [income, expenses],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 800 },
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// EXPORT CSV
document.getElementById("exportCSV").onclick = () => {
  if (!transactions.length) return alert("No transactions to export.");
  let csv = "Description,Amount,Category\n";
  transactions.forEach(t => { csv += `${t.desc},${t.amount},${t.category}\n`; });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finance-tracker.csv";
  a.click();
};

// INITIALIZE
updateUI();