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
