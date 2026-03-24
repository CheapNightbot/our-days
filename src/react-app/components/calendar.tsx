import { useMemo } from 'react';

// --- Helper Functions  ---

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

// --- Sub-Component: Single Month Card ---

interface MonthCardProps {
    year: number;
    month: number; // 0-11
    locale: string;
}

const MonthCard = ({ year, month, locale }: MonthCardProps) => {
    // Memoize calculations so they don't run unnecessarily
    const { monthName, weekdays, padding, days } = useMemo(() => {
        const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(year, month, 1));

        // Generate weekdays dynamically based on the first week of this month
        const weekdays = Array.from({ length: 7 }, (_, i) => {
            return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(year, month, 1 + i));
        });

        return {
            monthName,
            weekdays,
            padding: getPaddingArray(year, month),
            days: getDaysArray(year, month),
        };
    }, [year, month, locale]);

    return (
        <div className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Month Header */}
            <h1 className="text-center font-bold text-lg border-b p-2 bg-muted/50">
                {monthName}
            </h1>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 text-center border-b text-sm text-muted-foreground">
                {weekdays.map((day, i) => (
                    <span key={i} className="p-1">{day}</span>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7">
                {/* Padding Days (Empty Slots) */}
                {padding.map((i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                ))}

                {/* Actual Days */}
                {days.map((day) => (
                    <button
                        key={day}
                        className="aspect-square text-center hover:bg-accent hover:text-accent-foreground rounded-full m-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`${monthName} ${day}`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Main Component: Full Year Calendar ---

export default function Calendar() {
    const currentYear = new Date().getFullYear();
    const locale = getUserLocale();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 py-4 max-w-6xl mx-auto">
            {[...Array(12)].map((_, month) => (
                <MonthCard
                    key={month}
                    year={currentYear}
                    month={month}
                    locale={locale}
                />
            ))}
        </div>
    );
}
