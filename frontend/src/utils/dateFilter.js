export function dateFilter(range, transactions) {
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

        console.log(date);
        selectedTransactions = transactions.filter(t => {
            const tdate = new Date(t.date);
            if (tdate >= date) return true;
            else return false;
        });

    }
    //console.log(selectedTransactions);
    return selectedTransactions;
}