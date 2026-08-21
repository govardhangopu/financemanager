export function buildScenarioTimeline(transactions = []) {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const dateMap = {};

    sorted.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        if (!dateMap[date]) {
            dateMap[date] = [];
        }
        dateMap[date].push(transaction);
    });

    const labels = [];
    const actualData = [];
    const scenarioData = [];
    let actualNet = 0;
    let scenarioNet = 0;

    Object.entries(dateMap).forEach(([date, transactionsForDate]) => {
        transactionsForDate.forEach(transaction => {
            const actualAmount = Number(transaction.original_amount);
            const scenarioAmount = Number(transaction.amount);

            // Actual timeline only includes real transactions.
            if (Number.isFinite(actualAmount)) {
                if (transaction.type === "income") {
                    actualNet += actualAmount;
                } else if (transaction.type === "expense") {
                    actualNet -= actualAmount;
                }
            }

            // Scenario timeline includes real + hypothetical transactions.
            if (Number.isFinite(scenarioAmount)) {
                if (transaction.type === "income") {
                    scenarioNet += scenarioAmount;
                } else if (transaction.type === "expense") {
                    scenarioNet -= scenarioAmount;
                }
            }
        });

        labels.push(date);
        actualData.push(actualNet);
        scenarioData.push(scenarioNet);
    });

    return {
        labels,
        actualData,
        scenarioData
    };
}