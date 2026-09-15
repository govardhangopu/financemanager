export const parseDateOnly = (dateValue) => {
    const [year, month, day] =
        String(dateValue)
            .split("T")[0]
            .split("-")
            .map(Number);

    return {
        year,
        month: month - 1,
        day
    };
};

export const addMonthsToDateOnly = (dateValue, months) => {
    const { year, month } = parseDateOnly(dateValue);

    const date = new Date(
        year,
        month + months,
        1
    );

    return {
        year: date.getFullYear(),
        month: date.getMonth()
    };
};