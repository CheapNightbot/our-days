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

// Generates today's date in YYYY-MM-DD
const getToday = (dateString: string) => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateString === todayString;
};

// Submit reaction to the backend
const submitReaction = async (
    date: string,
    emoji: string,
    action: "add" | "remove"
) => {
    try {
        const response = await fetch("/api/reaction", {
            method: action === "remove" ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, emoji }),
            credentials: "include", // Important! Sends cookies
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return true;
    } catch (error) {
        return false;
    }
};


export {
    getDaysArray,
    getDaysInMonth,
    getFirstDayOfMonth,
    getPaddingArray,
    getToday,
    getUserLocale,
    submitReaction
};
