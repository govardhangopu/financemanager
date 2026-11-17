const DEMO_ACTIVE_KEY = "financeManagerDemoActive";
const DEMO_DATA_KEY = "financeManagerDemoData";
const DEMO_DATA_VERSION = 2;
export const DEMO_TOKEN = "finance-manager-local-demo";

const DAY_MS = 24 * 60 * 60 * 1000;

export const isDemoSession = () =>
    typeof window !== "undefined" && window.sessionStorage.getItem(DEMO_ACTIVE_KEY) === "1";

const pad = (value) => String(value).padStart(2, "0");
const dateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const monthString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
const monthStart = (value) => {
    if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), 1);
    }

    const [year, month] = String(value).slice(0, 7).split("-").map(Number);
    return new Date(year, month - 1, 1);
};
const addMonths = (value, amount) => {
    const date = monthStart(value);
    date.setMonth(date.getMonth() + amount);
    return date;
};
const dateAt = (month, day) => {
    const date = monthStart(month);
    date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    return dateString(date);
};
const today = () => dateString(new Date());
const nowIso = () => new Date().toISOString();
const idNumber = (value) => Number(value);
const result = (data, config, status = 200) => ({
    data,
    status,
    statusText: status === 201 ? "Created" : "OK",
    headers: {},
    config,
    request: null,
});

const fail = (message, status = 400, config) => {
    const error = new Error(message);
    error.config = config;
    error.response = { status, data: { message }, config, headers: {} };
    throw error;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const createSeed = () => {
    const currentDate = today();
    const currentMonth = monthStart(currentDate);
    const categories = [
        { categoryid: 1, name: "Salary", type: "income", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 2, name: "Freelance", type: "income", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 3, name: "Housing", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 4, name: "Rent", type: "expense", parent_categoryid: 3, userid: 0, is_partial: 0 },
        { categoryid: 5, name: "Groceries", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 6, name: "Utilities", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 7, name: "Transport", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 8, name: "Dining", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 9, name: "Health", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 10, name: "Travel", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 11, name: "Education", type: "expense", parent_categoryid: null, userid: 0, is_partial: 0 },
        { categoryid: 12, name: "Bonus", type: "income", parent_categoryid: null, userid: 0, is_partial: 0 },
    ];
    const categoryById = new Map(categories.map((category) => [category.categoryid, category]));
    const transactions = [];
    const addSeedTransaction = (month, day, amount, categoryid) => {
        const date = dateAt(month, day);
        const category = categoryById.get(categoryid);
        transactions.push({
            transactionid: transactions.length + 1,
            userid: 0,
            amount,
            categoryid,
            is_partial: 0,
            date,
            category_name: category.name,
            type: category.type,
            parent_categoryid: category.parent_categoryid,
        });
    };
    const addSeedTransactionOnDate = (date, amount, categoryid) => {
        const category = categoryById.get(categoryid);
        transactions.push({
            transactionid: transactions.length + 1,
            userid: 0,
            amount,
            categoryid,
            is_partial: 0,
            date,
            category_name: category.name,
            type: category.type,
            parent_categoryid: category.parent_categoryid,
        });
    };

    // Six completed months create a genuine historical baseline for the current forecast rules.
    for (let offset = -6; offset <= -1; offset += 1) {
        const month = addMonths(currentMonth, offset);
        const key = monthString(month);
        addSeedTransaction(key, 1, 100000, 1);
        addSeedTransaction(key, 15, 11000, 2);
        addSeedTransaction(key, 3, 30000, 4);
        addSeedTransaction(key, 6, 11000, 5);
        addSeedTransaction(key, 9, 4500, 6);
        addSeedTransaction(key, 11, 3500, 7);
        addSeedTransaction(key, 13, 5500, 8);
        addSeedTransaction(key, 20, 2000, 9);
    }

    // Current month history is included in C0, while the planned date remains a scheduled flow.
    const currentKey = monthString(currentMonth);
    addSeedTransaction(currentKey, 1, 100000, 1);
    addSeedTransaction(currentKey, 3, 30000, 4);
    addSeedTransaction(currentKey, 6, 11000, 5);
    addSeedTransaction(currentKey, 9, 4500, 6);
    addSeedTransaction(currentKey, 11, 3500, 7);
    addSeedTransaction(currentKey, 13, 5500, 8);
    addSeedTransaction(currentKey, 15, 11000, 2);

    const nextMonth = addMonths(currentMonth, 1);
    const monthAfter = addMonths(currentMonth, 2);
    const plannedHealthDate = new Date();
    plannedHealthDate.setDate(plannedHealthDate.getDate() + 7);
    addSeedTransactionOnDate(dateString(plannedHealthDate), 2000, 9);
    addSeedTransaction(monthString(nextMonth), 10, 18000, 12);
    addSeedTransaction(monthString(monthAfter), 5, 42000, 10);

    const budgetStart = dateAt(currentKey, 1);
    const nextMonthStart = dateAt(monthString(nextMonth), 1);
    const travelMonth = addMonths(currentMonth, 3);
    const goals = [
        { goalid: 1, userid: 0, name: "Emergency fund", target_amount: 150000, target_date: dateAt(monthString(addMonths(currentMonth, 8)), 1), description: "Build a reliable cushion for unexpected costs.", priority_order: 0, created_at: nowIso(), updated_at: nowIso() },
        { goalid: 2, userid: 0, name: "Home deposit", target_amount: 500000, target_date: dateAt(monthString(addMonths(currentMonth, 36)), 1), description: "Save toward a future home.", priority_order: 1, created_at: nowIso(), updated_at: nowIso() },
        { goalid: 3, userid: 0, name: "A week away", target_amount: 90000, target_date: dateAt(monthString(addMonths(currentMonth, 12)), 1), description: "Plan a relaxed holiday without losing sight of other goals.", priority_order: 2, created_at: nowIso(), updated_at: nowIso() },
    ];
    const budgets = [
        { budgetid: 1, userid: 0, status: "active", target_amount: 72000, name: "Monthly essentials", description: "Core home and day-to-day costs.", budget_type: "monthly", start_date: budgetStart, end_date: null },
        { budgetid: 2, userid: 0, status: "upcoming", target_amount: 90000, name: "Travel fund", description: "A one-time plan for the next trip.", budget_type: "one_time", start_date: dateAt(monthString(travelMonth), 1), end_date: dateAt(monthString(travelMonth), 28) },
        { budgetid: 3, userid: 0, status: "active", target_amount: 36000, name: "Learning and growth", description: "Books, courses, and professional development.", budget_type: "yearly", start_date: budgetStart, end_date: null },
    ];
    const budgetCategories = [
        { budgetid: 1, categoryid: 3 }, { budgetid: 1, categoryid: 5 }, { budgetid: 1, categoryid: 6 },
        { budgetid: 1, categoryid: 7 }, { budgetid: 1, categoryid: 8 }, { budgetid: 1, categoryid: 9 },
        { budgetid: 2, categoryid: 10 }, { budgetid: 3, categoryid: 11 },
    ];
    const scenarios = [
        { scenarioid: 1, userid: 0, name: "A larger apartment", description: "Explore a higher monthly rent.", created_at: nowIso(), updated_at: nowIso() },
        { scenarioid: 2, userid: 0, name: "A career change", description: "Compare a new income stream and a one-time transition cost.", created_at: new Date(Date.now() - 1000).toISOString(), updated_at: new Date(Date.now() - 1000).toISOString() },
    ];
    const scenarioChanges = [
        { scenario_changeid: 1, scenarioid: 1, change_type: "recurring", target_type: "category", categoryid: 4, type: null, direction: "increase", amount: 5000, frequency: "monthly", start_date: dateAt(monthString(nextMonth), 1), end_date: null, description: "Higher rent", category_name: "Rent", category_deleted: false, created_at: nowIso(), updated_at: nowIso() },
        { scenario_changeid: 2, scenarioid: 2, change_type: "recurring", target_type: "new", categoryid: null, type: "income", direction: "increase", amount: 18000, frequency: "monthly", start_date: dateAt(monthString(nextMonth), 1), end_date: null, description: "New role", category_name: null, category_deleted: false, created_at: nowIso(), updated_at: nowIso() },
        { scenario_changeid: 3, scenarioid: 2, change_type: "one_time", target_type: "new", categoryid: null, type: "expense", direction: "increase", amount: 30000, frequency: null, start_date: dateAt(monthString(addMonths(currentMonth, 3)), 12), end_date: null, description: "Transition costs", category_name: null, category_deleted: false, created_at: nowIso(), updated_at: nowIso() },
    ];

    return {
        demoDataVersion: DEMO_DATA_VERSION,
        user: { userid: 0, name: "Demo Explorer", username: "demo", email: "demo@example.invalid", authMethods: { password: false, google: false } },
        transactions,
        categories,
        budgets,
        budgetCategories,
        budgetTransactions: [],
        goals,
        scenarios,
        scenarioChanges,
        nextIds: { transaction: transactions.length + 1, category: 13, budget: 4, goal: 4, scenario: 3, scenarioChange: 4 },
    };
};

export const startDemoSession = () => {
    let savedVersion = null;
    try {
        savedVersion = JSON.parse(window.sessionStorage.getItem(DEMO_DATA_KEY) || "null")?.demoDataVersion;
    } catch {
        savedVersion = null;
    }
    if (!isDemoSession() || savedVersion !== DEMO_DATA_VERSION) {
        window.sessionStorage.setItem(DEMO_DATA_KEY, JSON.stringify(createSeed()));
    }
    window.sessionStorage.setItem(DEMO_ACTIVE_KEY, "1");
};

export const clearDemoSession = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(DEMO_ACTIVE_KEY);
    window.sessionStorage.removeItem(DEMO_DATA_KEY);
};

export const getDemoUser = () => {
    if (!isDemoSession()) return null;
    return getState().user;
};

const getState = () => {
    try {
        const saved = window.sessionStorage.getItem(DEMO_DATA_KEY);
        if (saved) {
            const state = JSON.parse(saved);
            if (state.demoDataVersion === DEMO_DATA_VERSION) return state;
        }
    } catch {
        // A malformed tab-local snapshot is replaced with the safe synthetic seed.
    }
    const state = createSeed();
    window.sessionStorage.setItem(DEMO_DATA_KEY, JSON.stringify(state));
    return state;
};

const saveState = (state) => window.sessionStorage.setItem(DEMO_DATA_KEY, JSON.stringify(state));
const findCategory = (state, id) => state.categories.find((item) => idNumber(item.categoryid) === idNumber(id));
const findBudget = (state, id) => state.budgets.find((item) => idNumber(item.budgetid) === idNumber(id));
const findScenario = (state, id) => state.scenarios.find((item) => idNumber(item.scenarioid) === idNumber(id));
const findGoal = (state, id) => state.goals.find((item) => idNumber(item.goalid) === idNumber(id));

const descendants = (state, categoryId) => {
    const resultIds = new Set([idNumber(categoryId)]);
    let changed = true;
    while (changed) {
        changed = false;
        state.categories.forEach((category) => {
            if (resultIds.has(idNumber(category.parent_categoryid)) && !resultIds.has(idNumber(category.categoryid))) {
                resultIds.add(idNumber(category.categoryid));
                changed = true;
            }
        });
    }
    return [...resultIds];
};

const withCategory = (state, transaction) => {
    const category = findCategory(state, transaction.categoryid);
    return {
        ...transaction,
        category_name: category?.name ?? null,
        type: category?.type ?? null,
        parent_categoryid: category?.parent_categoryid ?? null,
    };
};

const sortedGoals = (state) => [...state.goals].sort((a, b) =>
    Number(a.priority_order) - Number(b.priority_order)
    || String(a.target_date).localeCompare(String(b.target_date))
    || Number(a.goalid) - Number(b.goalid)
);

const monthlyHistory = (state, categoryIds = null) => {
    const currentMonth = monthString(new Date());
    const cutoffMonth = monthString(addMonths(currentMonth, -6));
    const byMonth = new Map();
    state.transactions.forEach((transaction) => {
        const category = findCategory(state, transaction.categoryid);
        if (!category || transaction.date >= currentDateString() || transaction.date.slice(0, 7) >= currentMonth) return;
        const month = transaction.date.slice(0, 7);
        if (month < cutoffMonth) return;
        if (categoryIds && !categoryIds.has(idNumber(transaction.categoryid))) return;
        byMonth.set(month, (byMonth.get(month) || 0) + (category.type === "income" ? 1 : -1) * Number(transaction.amount));
    });
    return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, net_flow]) => ({ month, net_flow }));
};

const currentDateString = () => today();
const getBaseline = (state) => {
    const history = monthlyHistory(state);
    const currentCumulativeNetFlow = state.transactions.reduce((sum, transaction) => {
        const category = findCategory(state, transaction.categoryid);
        if (!category || transaction.date >= currentDateString()) return sum;
        return sum + (category.type === "income" ? 1 : -1) * Number(transaction.amount);
    }, 0);
    const scheduledTransactions = state.transactions
        .filter((transaction) => transaction.date >= currentDateString())
        .map((transaction) => {
            const category = findCategory(state, transaction.categoryid);
            return {
                transactionid: transaction.transactionid,
                amount: Number(transaction.amount),
                date: transaction.date,
                categoryid: transaction.categoryid,
                category_name: category?.name ?? null,
                category_type: category?.type ?? null,
                netFlow: category?.type === "income" ? Number(transaction.amount) : category?.type === "expense" ? -Number(transaction.amount) : 0,
            };
        })
        .sort((a, b) => a.date.localeCompare(b.date) || Number(a.transactionid) - Number(b.transactionid));
    const averageMonthlyNetFlow = history.length
        ? history.reduce((sum, row) => sum + Number(row.net_flow), 0) / history.length
        : 0;
    return { hasData: history.length > 0, currentCumulativeNetFlow, scheduledTransactions, averageMonthlyNetFlow };
};

const parseDateParts = (value) => String(value).slice(0, 10).split("-").map(Number);
const utcDate = (value) => {
    const [year, month, day] = parseDateParts(value);
    return new Date(Date.UTC(year, month - 1, day));
};
const utcDateString = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const buildTimeline = ({ startDate, months, startingCumulativeNetFlow, averageMonthlyNetFlow, scheduledTransactions = [], endDate, includeBaseline = true }) => {
    const [startYear, startMonth] = parseDateParts(startDate);
    const firstMonth = new Date(Date.UTC(startYear, startMonth - 1, 1));
    const lastMonth = new Date(Date.UTC(startYear, startMonth - 1 + months - 1, 1));
    const rangeStart = utcDateString(firstMonth);
    const monthEndDate = new Date(Date.UTC(lastMonth.getUTCFullYear(), lastMonth.getUTCMonth() + 1, 0));
    const monthEnd = utcDateString(monthEndDate);
    const rangeEnd = endDate && endDate < monthEnd ? endDate : monthEnd;
    const scheduledByDate = new Map();
    scheduledTransactions.forEach((transaction) => {
        const date = String(transaction.date).slice(0, 10);
        if (date < rangeStart || date > rangeEnd) return;
        const day = scheduledByDate.get(date) || [];
        day.push(transaction);
        scheduledByDate.set(date, day);
    });
    const output = [];
    let cumulativeNetFlow = Number(startingCumulativeNetFlow) || 0;
    const todayValue = String(startDate).slice(0, 10);
    for (let cursor = utcDate(rangeStart), end = utcDate(rangeEnd); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
        const date = utcDateString(cursor);
        const year = cursor.getUTCFullYear();
        const month = cursor.getUTCMonth();
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        const scheduledToday = scheduledByDate.get(date) || [];
        const scheduledNetFlow = scheduledToday.reduce((sum, item) => sum + Number(item.netFlow || 0), 0);
        const baselineNetFlow = includeBaseline && date >= todayValue ? Number(averageMonthlyNetFlow || 0) / daysInMonth : 0;
        cumulativeNetFlow += baselineNetFlow + scheduledNetFlow;
        const isMonthEnd = Number(date.slice(8, 10)) === daysInMonth;
        if (scheduledToday.length || (includeBaseline && (isMonthEnd || date === rangeEnd))) {
            const monthOffset = (year - firstMonth.getUTCFullYear()) * 12 + (month - firstMonth.getUTCMonth()) + 1;
            output.push({ month: monthOffset, monthIndex: monthOffset - 1, date, monthlyNetFlow: includeBaseline ? Number(averageMonthlyNetFlow || 0) : 0, baselineNetFlow, scheduledNetFlow, scheduledTransactions: scheduledToday, cumulativeNetFlow });
        }
    }
    return output;
};

const getForecastData = (state, months, startDate) => {
    const baseline = getBaseline(state);
    const projection = buildTimeline({
        startDate: startDate || currentDateString(),
        months: Math.max(1, Math.min(120, Number(months) || 12)),
        startingCumulativeNetFlow: baseline.currentCumulativeNetFlow,
        averageMonthlyNetFlow: baseline.averageMonthlyNetFlow,
        scheduledTransactions: baseline.scheduledTransactions,
        includeBaseline: baseline.hasData,
    });
    return {
        hasData: baseline.hasData || baseline.scheduledTransactions.length > 0 || baseline.currentCumulativeNetFlow !== 0,
        isScheduledOnly: !baseline.hasData && baseline.scheduledTransactions.length > 0,
        months: Number(months) || 12,
        startingCumulativeNetFlow: baseline.currentCumulativeNetFlow,
        averageMonthlyNetFlow: baseline.averageMonthlyNetFlow,
        summary: { finalCumulativeNetFlow: projection.at(-1)?.cumulativeNetFlow ?? baseline.currentCumulativeNetFlow },
        projection,
    };
};

const allocateAmount = (cashPool, goals, goalId) => {
    let available = Math.max(0, Number(cashPool) || 0);
    for (const goal of goals) {
        const allocated = Math.min(Number(goal.target_amount), available);
        if (Number(goal.goalid) === Number(goalId)) return allocated;
        available -= allocated;
    }
    return 0;
};

const goalsWithAllocation = (state) => {
    const baseline = getBaseline(state);
    let available = Math.max(0, baseline.currentCumulativeNetFlow);
    return sortedGoals(state).map((goal) => {
        const allocated_amount = Math.min(Number(goal.target_amount), available);
        available -= allocated_amount;
        return { ...goal, allocated_amount, current_cumulative_net_flow: baseline.currentCumulativeNetFlow };
    });
};

const getGoalProjectionData = (state, goalId) => {
    const goals = sortedGoals(state);
    const goal = goals.find((item) => Number(item.goalid) === Number(goalId));
    if (!goal) return fail("Goal not found.", 404);
    const baseline = getBaseline(state);
    const allocatedAmount = allocateAmount(baseline.currentCumulativeNetFlow, goals, goalId);
    const targetAmount = Number(goal.target_amount);
    const goalIndex = goals.findIndex((item) => Number(item.goalid) === Number(goalId));
    const cumulativeTargetThroughGoal = goals.slice(0, goalIndex + 1).reduce((sum, item) => sum + Number(item.target_amount), 0);
    const metadata = { goalid: goal.goalid, name: goal.name, targetAmount, targetDate: goal.target_date, priorityOrder: goal.priority_order };
    const todayValue = currentDateString();
    if (!baseline.hasData && baseline.scheduledTransactions.length === 0 && baseline.currentCumulativeNetFlow === 0) {
        return { hasData: false, goal: metadata, currentCumulativeNetFlow: baseline.currentCumulativeNetFlow, allocatedAmount, projectedCumulativeNetFlow: null, requiredMonthlyNetFlow: null, monthsRemaining: null, onTrack: null, goalReached: false, deadlinePassed: false, projection: [] };
    }
    const [targetYear, targetMonth] = parseDateParts(goal.target_date);
    const [todayYear, todayMonth] = parseDateParts(todayValue);
    const monthsToTarget = (targetYear - todayYear) * 12 + targetMonth - todayMonth;
    const monthsRemaining = Math.max(1, monthsToTarget + 1);
    if (allocatedAmount >= targetAmount) {
        return { hasData: true, goal: metadata, currentCumulativeNetFlow: baseline.currentCumulativeNetFlow, allocatedAmount, projectedCumulativeNetFlow: allocatedAmount, requiredMonthlyNetFlow: 0, shortfall: 0, monthlyGap: 0, monthsRemaining, projection: [], goalReachedAt: 0, goalReachedDate: null, monthsEarly: monthsRemaining, onTrack: true, goalReached: true, deadlinePassed: false };
    }
    if (String(goal.target_date).slice(0, 10) <= todayValue) {
        const shortfall = Math.max(0, targetAmount - allocatedAmount);
        return { hasData: true, goal: metadata, currentCumulativeNetFlow: baseline.currentCumulativeNetFlow, allocatedAmount, projectedCumulativeNetFlow: allocatedAmount, requiredMonthlyNetFlow: 0, shortfall, monthlyGap: 0, monthsRemaining: 0, projection: [], onTrack: false, goalReached: false, deadlinePassed: true };
    }
    const timeline = buildTimeline({ startDate: todayValue, months: monthsRemaining, startingCumulativeNetFlow: baseline.currentCumulativeNetFlow, averageMonthlyNetFlow: baseline.averageMonthlyNetFlow, scheduledTransactions: baseline.scheduledTransactions, endDate: String(goal.target_date).slice(0, 10) });
    const projection = timeline.map((point) => ({ ...point, totalCumulativeNetFlow: point.cumulativeNetFlow, cumulativeNetFlow: allocateAmount(point.cumulativeNetFlow, goals, goalId) }));
    const projectedCumulativeNetFlow = projection.at(-1)?.cumulativeNetFlow ?? allocatedAmount;
    const requiredMonthlyNetFlow = Math.max(0, (cumulativeTargetThroughGoal - Math.max(0, baseline.currentCumulativeNetFlow)) / monthsRemaining);
    const shortfall = Math.max(0, targetAmount - projectedCumulativeNetFlow);
    const monthlyGap = Math.max(0, requiredMonthlyNetFlow - baseline.averageMonthlyNetFlow);
    const reached = projection.find((point) => point.cumulativeNetFlow >= targetAmount);
    return { hasData: true, goal: metadata, currentCumulativeNetFlow: baseline.currentCumulativeNetFlow, allocatedAmount, projectedCumulativeNetFlow, requiredMonthlyNetFlow, shortfall, monthlyGap, goalReachedAt: reached?.month ?? null, goalReachedDate: reached?.date ?? null, monthsEarly: reached ? Math.max(0, monthsRemaining - reached.month) : 0, monthsRemaining, projection, onTrack: projectedCumulativeNetFlow >= targetAmount, goalReached: false, deadlinePassed: false };
};

const budgetStatus = (budget) => {
    const day = currentDateString();
    if (day < String(budget.start_date).slice(0, 10)) return "upcoming";
    if (budget.end_date && day > String(budget.end_date).slice(0, 10)) return "completed";
    return "active";
};
const budgetTransactions = (state, budgetId) => {
    const budget = findBudget(state, budgetId);
    if (!budget) return fail("Budget not found.", 404);
    const roots = state.budgetCategories.filter((item) => Number(item.budgetid) === Number(budgetId)).map((item) => item.categoryid);
    const included = new Set(roots.flatMap((id) => descendants(state, id)));
    return state.transactions
        .filter((transaction) => {
            const category = findCategory(state, transaction.categoryid);
            return included.has(Number(transaction.categoryid)) && category?.type === "expense"
                && transaction.date >= String(budget.start_date).slice(0, 10)
                && (!budget.end_date || transaction.date <= String(budget.end_date).slice(0, 10));
        })
        .map((transaction) => withCategory(state, transaction));
};
const budgetSpent = (state, budget) => budgetTransactions(state, budget.budgetid).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
const monthDiff = (date, start) => {
    const [y, m] = parseDateParts(date);
    const [sy, sm] = parseDateParts(start);
    return (y - sy) * 12 + m - sm;
};

const scenarioChangesFor = (state, scenarioId) => state.scenarioChanges
    .filter((change) => Number(change.scenarioid) === Number(scenarioId))
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    .map((change) => {
        const category = findCategory(state, change.categoryid);
        return { ...change, category_name: category?.name ?? null, category_deleted: ["category", "pattern"].includes(change.target_type) && !change.categoryid };
    });

const scenarioProjection = (state, scenarioId, months, startDate, changesOverride = null) => {
    const baseline = getBaseline(state);
    const n = Math.max(1, Math.min(120, Number(months) || 12));
    if (!baseline.hasData) return { hasData: false, months: n, baselineMonthlyNetFlow: 0, summary: { totalImpact: 0, baselineFinalCumulative: 0, scenarioFinalCumulative: 0 }, projection: [] };
    const changes = changesOverride || scenarioChangesFor(state, scenarioId);
    const impacts = Array.from({ length: n }, () => 0);
    changes.forEach((change) => {
        if (["category", "pattern"].includes(change.target_type) && !change.categoryid) return;
        for (let index = 0; index < n; index += 1) {
            const projectionMonth = addMonths(startDate, index);
            const projectionMonthKey = monthString(projectionMonth);
            const changeStart = String(change.start_date).slice(0, 10);
            const changeEnd = change.end_date ? String(change.end_date).slice(0, 10) : null;
            let impact = 0;
            if (change.change_type === "one_time" && projectionMonthKey === changeStart.slice(0, 7)) {
                impact = change.type === "income" ? Number(change.amount) : -Number(change.amount);
            } else if (change.change_type === "recurring") {
                const projectionDate = new Date(startDate);
                projectionDate.setMonth(projectionDate.getMonth() + index);
                const active = projectionDate >= new Date(changeStart) && (!changeEnd || projectionDate <= new Date(changeEnd));
                if (active && change.target_type === "new") {
                    impact = change.type === "income" ? Number(change.amount) : -Number(change.amount);
                } else if (active && ["category", "pattern"].includes(change.target_type)) {
                    const categoryIds = new Set(descendants(state, change.categoryid));
                    const hasCategoryHistory = state.transactions.some((transaction) => categoryIds.has(Number(transaction.categoryid)));
                    const category = findCategory(state, change.categoryid);
                    if (hasCategoryHistory && category) {
                        impact = change.direction === "increase"
                            ? (category.type === "income" ? Number(change.amount) : -Number(change.amount))
                            : (category.type === "income" ? -Number(change.amount) : Number(change.amount));
                    }
                }
            }
            impacts[index] += impact;
        }
    });
    let baselineCumulative = 0;
    let scenarioCumulative = 0;
    const projection = Array.from({ length: n }, (_, index) => {
        baselineCumulative += baseline.averageMonthlyNetFlow;
        const scenarioMonthlyNetFlow = baseline.averageMonthlyNetFlow + impacts[index];
        scenarioCumulative += scenarioMonthlyNetFlow;
        return { month: monthString(addMonths(startDate, index)), baselineMonthlyNetFlow: baseline.averageMonthlyNetFlow, scenarioMonthlyNetFlow, monthlyImpact: impacts[index], baselineCumulativeNetFlow: baselineCumulative, scenarioCumulativeNetFlow: scenarioCumulative };
    });
    const final = projection.at(-1);
    return { hasData: true, months: n, baselineMonthlyNetFlow: baseline.averageMonthlyNetFlow, summary: { totalImpact: final.scenarioCumulativeNetFlow - final.baselineCumulativeNetFlow, baselineFinalCumulative: final.baselineCumulativeNetFlow, scenarioFinalCumulative: final.scenarioCumulativeNetFlow }, projection };
};

const validateScenarioChange = (data) => {
    if (!["recurring", "one_time"].includes(data.change_type)) fail("Invalid change type.");
    if (!["category", "pattern", "new"].includes(data.target_type)) fail("Invalid target type.");
    if (!["increase", "decrease"].includes(data.direction)) fail("Invalid direction.");
    if (data.amount == null || Number(data.amount) <= 0) fail("Amount must be greater than zero.");
    if (!data.start_date) fail("Start date is required.");
    if (["category", "pattern"].includes(data.target_type)) {
        if (!data.categoryid) fail("Category is required.");
        if (data.type != null) fail("Type should not be provided for category or pattern changes.");
    }
    if (data.target_type === "new" && !["income", "expense"].includes(data.type)) fail("Invalid transaction type.");
    if (data.change_type === "recurring" && data.frequency !== "monthly") fail("Recurring changes currently support monthly frequency only.");
    if (data.change_type === "one_time" && data.frequency != null) fail("One-time changes cannot have a frequency.");
    if (data.end_date && data.end_date < data.start_date) fail("End date cannot be before start date.");
};

const handleTransactions = (state, method, path, params, data, config) => {
    const id = path[0];
    if (method === "GET" && !id) {
        let rows = state.transactions.map((transaction) => withCategory(state, transaction));
        const partial = params?.is_partial;
        if (partial !== undefined && partial !== null && partial !== "null") rows = rows.filter((item) => Number(item.is_partial) === Number(partial));
        return rows;
    }
    if (method === "POST" && !id) {
        if (data.amount == null || Number(data.amount) <= 0) fail("Amount must be greater than zero.", 400, config);
        const category = data.categoryid ? findCategory(state, data.categoryid) : null;
        if (data.categoryid && !category) fail("Category not found or not accessible.", 404, config);
        const row = { transactionid: state.nextIds.transaction++, userid: 0, amount: Number(data.amount), categoryid: data.categoryid ? Number(data.categoryid) : null, is_partial: Number(data.is_partial ?? 0), date: String(data.date || today()).slice(0, 10) };
        if (![0, 1].includes(row.is_partial)) fail("Invalid partial transaction value.", 400, config);
        state.transactions.push(row); saveState(state);
        return { fieldCount: 0, affectedRows: 1, insertId: row.transactionid, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (method === "PUT" && !id) {
        const row = state.transactions.find((item) => Number(item.transactionid) === Number(data.transactionid));
        if (!row) fail("Transaction not found.", 404, config);
        if (data.amount !== undefined && Number(data.amount) <= 0) fail("Amount must be greater than zero.", 400, config);
        if (data.categoryid !== undefined && data.categoryid && !findCategory(state, data.categoryid)) fail("Category not found or not accessible.", 404, config);
        if (data.is_partial !== undefined && ![0, 1].includes(Number(data.is_partial))) fail("Invalid partial transaction value.", 400, config);
        Object.assign(row, { amount: data.amount === undefined ? row.amount : Number(data.amount), categoryid: data.categoryid === undefined ? row.categoryid : (data.categoryid ? Number(data.categoryid) : null), is_partial: data.is_partial === undefined ? row.is_partial : Number(data.is_partial), date: data.date === undefined ? row.date : String(data.date).slice(0, 10) });
        saveState(state);
        return { fieldCount: 0, affectedRows: 1, changedRows: 1, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (method === "DELETE" && id) {
        const before = state.transactions.length;
        state.transactions = state.transactions.filter((item) => Number(item.transactionid) !== Number(id));
        state.budgetTransactions = state.budgetTransactions.filter((item) => Number(item.transactionid) !== Number(id));
        saveState(state);
        return { fieldCount: 0, affectedRows: before - state.transactions.length, info: "", serverStatus: 2, warningStatus: 0 };
    }
    return fail("Demo transaction route not found.", 404, config);
};

const handleCategories = (state, method, path, params, data, config) => {
    if (method === "GET" && path.length === 0) {
        const partial = params?.is_partial;
        return state.categories.filter((item) => partial ? Number(item.is_partial) === Number(partial) : true);
    }
    if (method === "POST" && path.length === 0) {
        if (!data.name?.trim()) fail("Category name is required.", 400, config);
        if (!["income", "expense"].includes(data.type)) fail("Category type must be income or expense.", 400, config);
        const isPartial = Number(data.is_partial);
        if (![0, 1].includes(isPartial)) fail("Invalid partial category value.", 400, config);
        if (state.categories.some((item) => item.name.toLowerCase() === data.name.trim().toLowerCase() && Number(item.is_partial) === isPartial)) fail(`Category with the name '${data.name}' already exists.`, 400, config);
        const parentId = data.parent_categoryid ? Number(data.parent_categoryid) : null;
        const parent = parentId ? findCategory(state, parentId) : null;
        if (parentId && !parent) fail("Parent category not found.", 404, config);
        if (parent && parent.type !== data.type) fail("Category type must match the parent category type.", 400, config);
        const row = { categoryid: state.nextIds.category++, name: data.name.trim(), type: data.type, parent_categoryid: parentId, userid: 0, is_partial: isPartial };
        state.categories.push(row); saveState(state);
        return { fieldCount: 0, affectedRows: 1, insertId: row.categoryid, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (method === "PUT" && path.length === 0) {
        const row = findCategory(state, data.categoryid);
        if (!row) fail("Category not found.", 404, config);
        if (data.name === undefined && data.parent_categoryid === undefined && data.is_partial === undefined) fail("No data to update.", 400, config);
        const nextName = data.name === undefined ? row.name : String(data.name).trim();
        const nextParentId = data.parent_categoryid === undefined ? row.parent_categoryid : (data.parent_categoryid ? Number(data.parent_categoryid) : null);
        const nextPartial = data.is_partial === undefined ? Number(row.is_partial) : Number(data.is_partial);
        if (!nextName) fail("Category name is required.", 400, config);
        if (![0, 1].includes(nextPartial)) fail("Invalid partial category value.", 400, config);
        if (state.categories.some((item) => Number(item.categoryid) !== Number(row.categoryid) && item.name.toLowerCase() === nextName.toLowerCase() && Number(item.is_partial) === nextPartial)) fail(`Category with the name '${nextName}' already exists.`, 400, config);
        if (nextParentId) {
            const parent = findCategory(state, nextParentId);
            if (!parent) fail("Parent category not found.", 404, config);
            if (Number(nextParentId) === Number(row.categoryid)) fail("A category cannot be its own parent.", 400, config);
            if (parent.type !== row.type) fail("Category type must match the parent category type.", 400, config);
            if (descendants(state, row.categoryid).some((childId) => Number(childId) === Number(nextParentId))) fail("A category cannot be moved under one of its descendants.", 400, config);
        }
        row.name = nextName;
        row.parent_categoryid = nextParentId;
        row.is_partial = nextPartial;
        saveState(state);
        return { fieldCount: 0, affectedRows: 1, changedRows: 1, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (method === "DELETE" && path[0]) {
        const row = findCategory(state, path[0]);
        if (!row) fail("Category not found.", 404, config);
        const removed = new Set(descendants(state, row.categoryid));
        state.categories = state.categories.filter((item) => !removed.has(Number(item.categoryid)));
        state.transactions.forEach((item) => { if (removed.has(Number(item.categoryid))) item.categoryid = null; });
        state.budgetCategories = state.budgetCategories.filter((item) => !removed.has(Number(item.categoryid)));
        state.scenarioChanges.forEach((item) => { if (removed.has(Number(item.categoryid))) item.categoryid = null; });
        saveState(state);
        return { fieldCount: 0, affectedRows: 1, info: "", serverStatus: 2, warningStatus: 0 };
    }
    return fail("Demo category route not found.", 404, config);
};

const handleBudgets = (state, method, path, data, config) => {
    const id = path[0];
    const action = path[1];
    if (method === "GET" && !id) return state.budgets.map((budget) => ({ ...budget, status: budgetStatus(budget), spent_amount: budgetSpent(state, budget) }));
    if (method === "POST" && !id) {
        if (!data.name?.trim()) fail("Budget name is required.", 400, config);
        if (Number(data.target_amount) <= 0) fail("Target amount must be greater than zero.", 400, config);
        if (!["monthly", "yearly", "one_time", "other"].includes(data.budget_type)) fail("Invalid budget type.", 400, config);
        if (!data.start_date) fail("Start date is required.", 400, config);
        if (data.end_date && data.end_date < data.start_date) fail("End date cannot be before start date.", 400, config);
        const row = { budgetid: state.nextIds.budget++, userid: 0, status: "active", target_amount: Number(data.target_amount), name: data.name.trim(), description: data.description?.trim() || null, budget_type: data.budget_type, start_date: data.start_date, end_date: data.end_date || null };
        row.status = budgetStatus(row); state.budgets.push(row); saveState(state);
        return { fieldCount: 0, affectedRows: 1, insertId: row.budgetid, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (!id) return fail("Demo budget route not found.", 404, config);
    const budget = findBudget(state, id);
    if (!budget) return fail("Budget not found.", 404, config);
    if (method === "GET" && !action) return [{ ...budget, status: budgetStatus(budget) }];
    if (method === "GET" && action === "progress") {
        const target = Number(budget.target_amount);
        const spent = budgetTransactions(state, id).reduce((sum, row) => sum + Number(row.amount), 0);
        return { progress: target > 0 ? Math.min((spent / target) * 100, 100) : 0 };
    }
    if (method === "GET" && action === "categories") {
        const ids = state.budgetCategories.filter((item) => Number(item.budgetid) === Number(id)).map((item) => Number(item.categoryid));
        return state.categories.filter((item) => ids.includes(Number(item.categoryid)));
    }
    if (method === "GET" && action === "transactions") return budgetTransactions(state, id);
    if (method === "PUT" && !action) {
        const finalBudget = {
            name: data.name === undefined ? budget.name : String(data.name).trim(),
            target_amount: data.target_amount === undefined ? Number(budget.target_amount) : Number(data.target_amount),
            budget_type: data.budget_type === undefined ? budget.budget_type : data.budget_type,
            start_date: data.start_date === undefined ? budget.start_date : data.start_date,
            end_date: data.end_date === undefined ? budget.end_date : (data.end_date || null),
            description: data.description === undefined ? budget.description : (String(data.description || "").trim() || null),
        };
        if (!finalBudget.name) fail("Budget name is required.", 400, config);
        if (!Number.isFinite(finalBudget.target_amount) || finalBudget.target_amount <= 0) fail("Target amount must be greater than zero.", 400, config);
        if (!["monthly", "yearly", "one_time", "other"].includes(finalBudget.budget_type)) fail("Invalid budget type.", 400, config);
        if (!finalBudget.start_date) fail("Start date is required.", 400, config);
        if (finalBudget.end_date && finalBudget.end_date < finalBudget.start_date) fail("End date cannot be before start date.", 400, config);
        Object.assign(budget, finalBudget);
        budget.status = budgetStatus(budget); saveState(state);
        return { fieldCount: 0, affectedRows: 1, changedRows: 1, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (method === "DELETE" && !action) {
        state.budgets = state.budgets.filter((item) => Number(item.budgetid) !== Number(id));
        state.budgetCategories = state.budgetCategories.filter((item) => Number(item.budgetid) !== Number(id));
        saveState(state);
        return { fieldCount: 0, affectedRows: 1, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (action === "category" && path[2]) {
        const categoryId = Number(path[2]);
        const index = state.budgetCategories.findIndex((item) => Number(item.budgetid) === Number(id) && Number(item.categoryid) === categoryId);
        if (method === "POST") {
            const category = findCategory(state, categoryId);
            if (!category || category.type !== "expense") fail("Only expense categories can be added to a budget.", 400, config);
            if (index < 0) state.budgetCategories.push({ budgetid: Number(id), categoryid: categoryId });
        } else if (method === "DELETE" && index >= 0) state.budgetCategories.splice(index, 1);
        saveState(state);
        return { fieldCount: 0, affectedRows: 1, info: "", serverStatus: 2, warningStatus: 0 };
    }
    if (action === "transaction" && path[2]) {
        if (method === "POST" && !state.budgetTransactions.some((item) => Number(item.budgetid) === Number(id) && Number(item.transactionid) === Number(path[2]))) state.budgetTransactions.push({ budgetid: Number(id), transactionid: Number(path[2]) });
        if (method === "DELETE") state.budgetTransactions = state.budgetTransactions.filter((item) => !(Number(item.budgetid) === Number(id) && Number(item.transactionid) === Number(path[2])));
        saveState(state);
        return { fieldCount: 0, affectedRows: 1, info: "", serverStatus: 2, warningStatus: 0 };
    }
    return fail("Demo budget route not found.", 404, config);
};

const handleGoals = (state, method, path, data, config) => {
    if (method === "GET" && path.length === 0) return goalsWithAllocation(state);
    if (method === "PUT" && path[0] === "reorder") {
        const ids = data.goalIds?.map(Number);
        if (!Array.isArray(ids) || ids.length !== state.goals.length || new Set(ids).size !== ids.length || state.goals.some((goal) => !ids.includes(Number(goal.goalid)))) fail("Reorder request must include every goal exactly once.", 400, config);
        ids.forEach((goalid, priority_order) => { findGoal(state, goalid).priority_order = priority_order; });
        saveState(state); return goalsWithAllocation(state);
    }
    if (method === "POST" && path.length === 0) {
        if (!data.name?.trim()) fail("Goal name is required.", 400, config);
        if (data.name.trim().length > 100) fail("Goal name must not exceed 100 characters.", 400, config);
        if (!Number.isFinite(Number(data.target_amount)) || Number(data.target_amount) <= 0) fail("Goal target amount must be greater than 0.", 400, config);
        if (!data.target_date) fail("Goal target date is required.", 400, config);
        const row = { goalid: state.nextIds.goal++, userid: 0, name: data.name.trim(), target_amount: Number(data.target_amount), target_date: String(data.target_date).slice(0, 10), description: data.description?.trim() || null, priority_order: Math.max(-1, ...state.goals.map((item) => Number(item.priority_order))) + 1, created_at: nowIso(), updated_at: nowIso() };
        state.goals.push(row); saveState(state); return row;
    }
    const id = path[0];
    if (!id) return fail("Demo goal route not found.", 404, config);
    if (method === "GET" && path[1] === "projection") return getGoalProjectionData(state, id);
    const goal = findGoal(state, id);
    if (!goal) return fail("Goal not found.", 404, config);
    if (method === "GET") return goal;
    if (method === "PUT") {
        if (!data.name?.trim()) fail("Goal name is required.", 400, config);
        if (data.name.trim().length > 100) fail("Goal name must not exceed 100 characters.", 400, config);
        if (!Number.isFinite(Number(data.target_amount)) || Number(data.target_amount) <= 0) fail("Goal target amount must be greater than 0.", 400, config);
        if (!data.target_date) fail("Goal target date is required.", 400, config);
        Object.assign(goal, { name: data.name.trim(), target_amount: Number(data.target_amount), target_date: String(data.target_date).slice(0, 10), description: data.description?.trim() || null, updated_at: nowIso() });
        saveState(state); return goal;
    }
    if (method === "DELETE") {
        state.goals = state.goals.filter((item) => Number(item.goalid) !== Number(id));
        saveState(state); return { message: "Goal deleted successfully." };
    }
    return fail("Demo goal route not found.", 404, config);
};

const handleScenarios = (state, method, path, params, data, config) => {
    if (method === "GET" && path.length === 0) return [...state.scenarios].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    if (method === "POST" && path.length === 0) {
        if (!data.name?.trim()) fail("Scenario name is required.", 400, config);
        const scenario = { scenarioid: state.nextIds.scenario++, userid: 0, name: data.name.trim(), description: data.description?.trim() || null, created_at: nowIso(), updated_at: nowIso() };
        state.scenarios.push(scenario); saveState(state); return [scenario];
    }
    const scenarioId = path[0];
    if (!scenarioId) return fail("Demo scenario route not found.", 404, config);
    const scenario = findScenario(state, scenarioId);
    if (!scenario) return fail("Scenario not found.", 404, config);
    const second = path[1];
    if (method === "GET" && !second) return scenario;
    if (method === "PUT" && !second) {
        if (!data.name?.trim()) fail("Scenario name is required.", 400, config);
        Object.assign(scenario, { name: data.name.trim(), description: data.description?.trim() || null, updated_at: nowIso() }); saveState(state); return scenario;
    }
    if (method === "DELETE" && !second) {
        state.scenarios = state.scenarios.filter((item) => Number(item.scenarioid) !== Number(scenarioId));
        state.scenarioChanges = state.scenarioChanges.filter((item) => Number(item.scenarioid) !== Number(scenarioId));
        saveState(state); return { message: "Scenario deleted successfully." };
    }
    if (second === "projection" && method === "GET") return scenarioProjection(state, scenarioId, params?.months, params?.start_date || currentDateString());
    if (second === "projection" && method === "POST") return scenarioProjection(state, scenarioId, data.months, data.start_date || currentDateString(), data.changes || []);
    if (second === "changes" && path.length === 2 && method === "GET") return scenarioChangesFor(state, scenarioId);
    if (second === "changes" && path.length === 2 && method === "POST") {
        validateScenarioChange(data);
        const change = { ...data, scenario_changeid: state.nextIds.scenarioChange++, scenarioid: Number(scenarioId), categoryid: data.categoryid ? Number(data.categoryid) : null, amount: Number(data.amount), start_date: String(data.start_date).slice(0, 10), end_date: data.end_date ? String(data.end_date).slice(0, 10) : null, description: data.description?.trim() || null, created_at: nowIso(), updated_at: nowIso() };
        if (change.categoryid && !findCategory(state, change.categoryid)) fail("Category not found.", 404, config);
        state.scenarioChanges.push(change); saveState(state); return scenarioChangesFor(state, scenarioId).find((item) => Number(item.scenario_changeid) === change.scenario_changeid);
    }
    if (second === "changes" && path.length >= 3) {
        const changeId = path[2];
        const row = state.scenarioChanges.find((item) => Number(item.scenarioid) === Number(scenarioId) && Number(item.scenario_changeid) === Number(changeId));
        if (!row) return fail("Scenario change not found.", 404, config);
        if (path.length === 3 && method === "GET") return { ...row };
        if (path.length === 3 && method === "PUT") {
            validateScenarioChange(data);
            if (data.categoryid && !findCategory(state, data.categoryid)) fail("Category not found.", 404, config);
            Object.assign(row, { ...data, categoryid: data.categoryid ? Number(data.categoryid) : null, amount: Number(data.amount), start_date: String(data.start_date).slice(0, 10), end_date: data.end_date ? String(data.end_date).slice(0, 10) : null, description: data.description?.trim() || null, updated_at: nowIso() });
            saveState(state); return scenarioChangesFor(state, scenarioId).find((item) => Number(item.scenario_changeid) === Number(changeId));
        }
        if (path.length === 3 && method === "DELETE") {
            state.scenarioChanges = state.scenarioChanges.filter((item) => Number(item.scenario_changeid) !== Number(changeId));
            saveState(state); return { message: "Scenario change deleted successfully." };
        }
    }
    return fail("Demo scenario route not found.", 404, config);
};

const handleUsers = (state, method, path, data, config) => {
    if (method === "GET" && path.join("/") === "users/auth/status") return { authMethods: { password: false, google: false }, googleEmail: null };
    if (method === "PATCH" && path.join("/") === "users/profile") {
        Object.assign(state.user, { name: data.name, username: data.username, email: data.email }); saveState(state); return { user: state.user };
    }
    if (method === "DELETE" && path.join("/") === "users/account") return { message: "Demo session ended." };
    if (path.join("/") === "users/password" || path.join("/") === "users/password/set") return fail("Password settings are unavailable in demo mode.", 400, config);
    if (path.join("/") === "users/google/link/start" || path.join("/") === "users/google/link") return fail("Google account linking is unavailable in demo mode.", 400, config);
    return fail("Account actions are unavailable in demo mode.", 400, config);
};

const routeDemoRequest = (config, baseURL) => {
    const rawUrl = config.url || "";
    const fullUrl = /^https?:\/\//i.test(rawUrl)
        ? rawUrl
        : `${String(baseURL || config.baseURL || "").replace(/\/+$/, "")}/${String(rawUrl).replace(/^\/+/, "")}`;
    const parsed = new URL(fullUrl, window.location.origin);
    const basePath = new URL(baseURL || config.baseURL || window.location.origin, window.location.origin).pathname.replace(/\/+$/, "");
    const segments = parsed.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const resources = ["users", "transactions", "categories", "budgets", "goals", "forecast", "scenarios"];
    const resourceIndex = segments.findIndex((segment) => resources.includes(segment));
    const resource = resourceIndex >= 0
        ? segments[resourceIndex]
        : basePath.split("/").filter(Boolean).at(-1);
    const path = resourceIndex >= 0 ? segments.slice(resourceIndex + 1) : [];
    const method = String(config.method || "get").toUpperCase();
    let data = config.data;
    if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { data = {}; }
    }
    const state = getState();
    let responseData;
    if (resource === "transactions") responseData = handleTransactions(state, method, path, config.params || {}, data || {}, config);
    else if (resource === "categories") responseData = handleCategories(state, method, path, data || {}, config);
    else if (resource === "budgets") responseData = handleBudgets(state, method, path, data || {}, config);
    else if (resource === "goals") responseData = handleGoals(state, method, path, data || {}, config);
    else if (resource === "scenarios") responseData = handleScenarios(state, method, path, config.params || {}, data || {}, config);
    else if (resource === "forecast" && method === "GET") responseData = getForecastData(state, config.params?.months, config.params?.start_date);
    else if (resource === "users") responseData = handleUsers(state, method, segments.slice(resourceIndex), data || {}, config);
    else return fail("This API route is not available in demo mode.", 404, config);
    saveState(state);
    return result(responseData, config);
};

export const createDemoAdapter = (baseURL, fallbackAdapter) => async (config) => {
    if (!isDemoSession()) return fallbackAdapter(config);
    return routeDemoRequest(config, baseURL);
};
