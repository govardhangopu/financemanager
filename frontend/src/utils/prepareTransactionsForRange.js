export function prepareTransactionsForRange(range, transactions = []) {

    // Step 1: Filtering

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    let selectedTransactions = transactions;

    if (range === "all") {
        selectedTransactions = transactions;
    } else {
        let date;

        if (range === "today")
            date = new Date(curYear, curMonth, today.getDate(), 0, 0, 0);
        else if (range === "month") 
            date = new Date(curYear, curMonth, 1);
        else if (range === "year")
            date = new Date(curYear, 0, 1);

        //console.log(date);
        selectedTransactions = transactions.filter(t => {
            const tdate = new Date(t.date);
            return tdate >= date;
        });

    }
    //console.log(selectedTransactions);

    //Step 2: Sorting
    
    const sorted = [...selectedTransactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
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
            date = new Date(transaction.date).getFullYear();
        else if (range === "year")
            date = new Date(transaction.date).toDateString().split(" ")[1];
        else if (range === "month")
            date = new Date(transaction.date).toISOString().split('T')[0].slice(8);
        else if (range === "today")
            date = new Date(transaction.date).getHours();

        if (!dateMap[date])
            dateMap[date] = [];

        dateMap[date].push(transaction);
    })
    //console.log(dateMap);

    const labels = Object.keys(dateMap);
    const g = granularity[range];

    return { labels: labels || [], dateMap: dateMap || {}, granularity: g };
}