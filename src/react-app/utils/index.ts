// Gets the user's browser locale automatically
const getUserLocale = () => navigator.language || 'en-US';

// Calculates days in a specific month
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

// Calculates which day of the week the month starts on (0 = Sunday, 6 = Saturday)
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

// Generates an array of numbers [1, 2, 3... daysInMonth]
const getDaysArray = (year: number, month: number) => {
    const days = getDaysInMonth(year, month);
    return Array.from({ length: days }, (_, i) => i + 1);
};

// Generates an array of empty slots for padding
const getPaddingArray = (year: number, month: number) => {
    const padding = getFirstDayOfMonth(year, month);
    return Array.from({ length: padding }, (_, i) => i);
};


export {
    getDaysArray,
    getDaysInMonth,
    getFirstDayOfMonth,
    getPaddingArray,
    getUserLocale
};
