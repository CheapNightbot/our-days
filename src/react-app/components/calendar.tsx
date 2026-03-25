import { useMemo, useState } from 'react';

interface CalendarProps {
    year: number;
}

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
    activeDate: string | null;
    setActiveDate: (date: string | null) => void;
}

const MonthCard = ({ year, month, locale, activeDate, setActiveDate }: MonthCardProps) => {
    // Memoize calculations so they don't run unnecessarily
    const { monthName, weekdays, padding, days } = useMemo(() => {
        const monthName = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(year, month, 1));

        // Generate weekdays dynamically
        const weekdays = Array.from({ length: 7 }, (_, i) => {
            return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(year, 1, 1 + i));
        });

        return {
            monthName,
            weekdays,
            padding: getPaddingArray(year, month),
            days: getDaysArray(year, month),
        };
    }, [year, month, locale]);

    const [animatingDay, setAnimatingDay] = useState<{ day: number, emoji: string } | null>(null);

    const handleEmojiClick = (day: number, emoji: string) => {
        // Trigger animation
        setAnimatingDay({ day, emoji });
        setTimeout(() => setAnimatingDay(null), 600);

        // Close the picker after reaction
        setActiveDate(null);
    };

    const toggleDayPicker = (day: number) => {
        // Create date string for this day
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // If clicking the same date, close it. Otherwise, open it.
        setActiveDate(activeDate === dateString ? null : dateString);
    };

    return (
        <div className="border rounded-md overflow-visible shadow-sm hover:shadow-md transition-shadow bg-card/60 min-h-81.5">
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
                {days.map((day) => {
                    // Create date string for this specific day
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isActive = activeDate === dateString;

                    return (
                        <div key={day} className="relative pt-1.5 m-1.5">
                            {/* Emoji Reaction Animation */}
                            {animatingDay && animatingDay.day === day && (
                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce z-30">
                                    <span className="text-3xl animate-in fade-in-50">{animatingDay.emoji}</span>
                                </span>
                            )}

                            {/* Day Number Button */}
                            <button
                                onClick={() => toggleDayPicker(day)}
                                className={`w-full h-full py-2.5 text-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center
                                    ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                                aria-label={`${monthName} ${day}`}
                                aria-expanded={isActive}
                            >
                                {day}
                            </button>

                            {/* Emoji Picker - Only show for active day */}
                            {isActive && (
                                <div
                                    // Prevent clicks inside from closing
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1 animate-in slide-in-from-top-50 fade-in-50 transition-all duration-300 ease-in-out z-20"
                                >
                                    <div className="bg-sidebar backdrop-blur-sm rounded-md shadow-md border border-border px-1.5 py-1 flex gap-1.5">
                                        {["😄", "😭", "😡", "😖", "😴", "🤩"].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleEmojiClick(day, emoji)}
                                                className="hover:scale-125 transition-transform active:scale-100"
                                                aria-label={`Today's mood was: ${emoji}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Component: Full Year Calendar ---

export default function Calendar({ year }: CalendarProps) {
    const locale = getUserLocale();

    const [activeDate, setActiveDate] = useState<string | null>(null); // Format: "YYYY-MM-DD"


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8 py-4 max-w-6xl mx-auto">
            {[...Array(12)].map((_, month) => (
                <MonthCard
                    key={month}
                    year={year}
                    month={month}
                    locale={locale}
                    activeDate={activeDate}
                    setActiveDate={setActiveDate}
                />
            ))}
        </div>
    );
}
