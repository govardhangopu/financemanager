
export function buildCumulativeSeries(dateMap, labels, accumulatorFn) {
    const values =  [];
    let value = 0;
    labels.forEach(label => {
        const transactions = dateMap[label] || [];
        transactions.forEach(transaction => 
            value = accumulatorFn(value, transaction)
        )            
        values.push(value);
    });
    return values;
}