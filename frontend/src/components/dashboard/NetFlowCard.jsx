import { useState } from 'react';
import { useFinance } from '../../context/FinanceContext.jsx';
import { prepareTransactionsForRange } from '../../utils/prepareTransactionsForRange.js';
import { buildCumulativeSeries } from '../../utils/buildCumulativeSeries.js';
import { GenericChart } from "../GenericChart.jsx";
import Loader from '../Loader.jsx';
import './NetFlowCard.css';

const applyTransactionToNetFlow = (sum, transaction) => {
    const amount = Number(transaction.amount);

    if (!Number.isFinite(amount)) return sum;
    if (transaction.type === "income") return sum + amount;
    if (transaction.type === "expense") return sum - amount;
    return sum;
};

export default function NetFlowCard()  {
    const [range, setRange] = useState("all");
    let { netWorth, transactions, transactionsLoading, loadErrors } = useFinance();

    let { dateMap, labels, granularity } = prepareTransactionsForRange(range, transactions);

    const rangeTransactions = Object.values(dateMap).flat();
    netWorth = rangeTransactions.reduce(applyTransactionToNetFlow, 0);
    const values = buildCumulativeSeries(dateMap, labels, applyTransactionToNetFlow);
    // The arrow describes the latest movement in the plotted series, while
    // the amount remains the net total for the selected range.
    const latestPeriodNetFlow = values.length > 0
        ? values[values.length - 1] - (values[values.length - 2] ?? 0)
        : 0;
    const direction = latestPeriodNetFlow > 0 ? "positive" : latestPeriodNetFlow < 0 ? "negative" : "neutral";
    const directionLabel = direction === "positive"
        ? "Latest period increased net flow"
        : direction === "negative"
            ? "Latest period decreased net flow"
            : "No net flow change in the latest period";
    const dataset = [{ label: "Net Flow", data: values, borderColor: "#008080", backgroundColor: "#008080" }];

    return (
        <div>
            <p className="heading">Net Flow</p>
            { transactionsLoading ? <Loader text="Loading..." /> : loadErrors.transactions ? <p role="alert">{loadErrors.transactions}</p> : <>
            <p className="netflow">
                <span>₹ {netWorth.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                <span
                    className={`netflow-direction is-${direction}`}
                    role="img"
                    aria-label={directionLabel}
                    title={directionLabel}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
                        {direction === "positive" ? (
                            <path d="M6 18 18 6M8 6h10v10" />
                        ) : direction === "negative" ? (
                            <path d="M6 6 18 18M8 18h10V8" />
                        ) : (
                            <path d="M5 12h14m-5-5 5 5-5 5" />
                        )}
                    </svg>
                </span>
            </p>
            <select name="time-range-select" className="time-range-select" 
                value={range} onChange={(e) => setRange(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                    <option value="all">All-time</option>
            </select>
            <GenericChart labels={labels} datasets={dataset} />
            </>}
        </div>
    )
}
