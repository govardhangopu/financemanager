import { addMonthsToDateOnly } from "../utils/date.utils.js";

const toDateOnly = (value) => String(value).slice(0, 10);

export const buildProjectionTimeline = ({ startDate, months, startingCumulativeNetFlow, averageMonthlyNetFlow, scheduledTransactions = [], endDate: requestedEndDate, includeBaseline = true }) => {
    const firstMonth = addMonthsToDateOnly(startDate, 0);
    const lastMonth = addMonthsToDateOnly(startDate, months - 1);
    const rangeStart = `${firstMonth.year}-${String(firstMonth.month + 1).padStart(2, "0")}-01`;
    const rangeEndDate = new Date(Date.UTC(lastMonth.year, lastMonth.month + 1, 0));
    const monthEnd = `${rangeEndDate.getFullYear()}-${String(rangeEndDate.getMonth() + 1).padStart(2, "0")}-${String(rangeEndDate.getDate()).padStart(2, "0")}`;
    const rangeEnd = requestedEndDate && requestedEndDate < monthEnd ? requestedEndDate : monthEnd;
    const scheduledByDate = new Map();

    for (const transaction of scheduledTransactions) {
        const date = toDateOnly(transaction.date);
        if (date < rangeStart || date > rangeEnd) continue;
        const dayTransactions = scheduledByDate.get(date) ?? [];
        dayTransactions.push(transaction);
        scheduledByDate.set(date, dayTransactions);
    }

    const projection = [];
    let cumulativeNetFlow = startingCumulativeNetFlow;
    const cursor = new Date(`${rangeStart}T00:00:00Z`);
    const end = new Date(`${rangeEnd}T00:00:00Z`);
    const today = toDateOnly(startDate);

    while (cursor <= end) {
        const date = cursor.toISOString().slice(0, 10);
        const [year, month] = date.split("-").map(Number);
        const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const scheduledToday = scheduledByDate.get(date) ?? [];
        const scheduledNetFlow = scheduledToday.reduce((sum, transaction) => sum + transaction.netFlow, 0);
        const baselineNetFlow = includeBaseline && date >= today
            ? averageMonthlyNetFlow / daysInMonth
            : 0;
        cumulativeNetFlow += baselineNetFlow;
        cumulativeNetFlow += scheduledNetFlow;

        const isMonthEnd = Number(date.slice(8, 10)) === daysInMonth;
        if (scheduledToday.length > 0 || (includeBaseline && (isMonthEnd || date === rangeEnd))) {
            const monthOffset = (year - firstMonth.year) * 12 + (month - 1 - firstMonth.month) + 1;
            projection.push({ month: monthOffset, monthIndex: monthOffset - 1, date, monthlyNetFlow: includeBaseline ? averageMonthlyNetFlow : 0, baselineNetFlow, scheduledNetFlow, scheduledTransactions: scheduledToday, cumulativeNetFlow });
        }
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return projection;
};
