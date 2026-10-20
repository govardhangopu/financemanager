const parseTransactionDate = (value) => {
    const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
};

export function filterTransactionsForRange(range, transactions = []) {
    if (range === "all") return transactions;

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    let startDate;
    let endDate;

    if (range === "today") {
        startDate = new Date(curYear, curMonth, today.getDate());
        endDate = new Date(curYear, curMonth, today.getDate() + 1);
    } else if (range === "month") {
        startDate = new Date(curYear, curMonth, 1);
        endDate = new Date(curYear, curMonth + 1, 1);
    } else if (range === "year") {
        startDate = new Date(curYear, 0, 1);
        endDate = new Date(curYear + 1, 0, 1);
    } else {
        return transactions;
    }

    return transactions.filter(transaction => {
        const transactionDate = parseTransactionDate(transaction.date);
        return transactionDate >= startDate && transactionDate < endDate;
    });
}

export function prepareTransactionsForRange(range, transactions = []) {
    // Step 1: Filtering
    const selectedTransactions = filterTransactionsForRange(range, transactions);

    //console.log(selectedTransactions);

    //Step 2: Sorting
    
    const sorted = [...selectedTransactions].sort(
        (a, b) => String(a.date).slice(0, 10).localeCompare(String(b.date).slice(0, 10))
    );

    // Step 3: Mapping Transactions for Each Date based on Granularity

    const granularity = {
        "all": "year",
        "year": "month",
        "month": "day",
        "today": "hour"
    }

    const dateMap = {};

    sorted.forEach(transaction=> {
        let date;
        if (range === "all")
            date = parseTransactionDate(transaction.date).getFullYear();
        else if (range === "year")
            date = parseTransactionDate(transaction.date).toDateString().split(" ")[1];
        else if (range === "month")
            date = String(transaction.date).slice(8, 10);
        else if (range === "today")
            date = parseTransactionDate(transaction.date).getHours();

        if (!dateMap[date])
            dateMap[date] = [];

        dateMap[date].push(transaction);
    })
    //console.log(dateMap);

    const labels = Object.keys(dateMap);
    const g = granularity[range];

    return { labels: labels || [], dateMap: dateMap || {}, granularity: g };
}
