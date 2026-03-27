import {
    useEffect,
    useMemo,
    useState
} from 'react';
import {
    getDaysArray,
    getPaddingArray,
    getToday,
    getUserLocale,
    submitReaction,
} from '../utils';

interface CalendarProps {
    year: number;
}

// --- Sub-Component: Single Month Card ---

interface MonthCardProps {
    year: number;
    month: number; // 0-11
    locale: string;
    activeDate: string | null;
    setActiveDate: (date: string | null) => void;
    dailyReactions: Record<string, { emoji: string; count: number }[]>;
    onReactionChange: (date: string, emoji: string, action: 'add' | 'remove') => Promise<void>;
}

const MonthCard = ({
    year,
    month,
    locale,
    activeDate,
    setActiveDate,
    dailyReactions,
    onReactionChange,
}: MonthCardProps) => {
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

    const [animatingDay, setAnimatingDay] = useState<{
        day: number;
        emoji: string;
        action: 'add' | 'remove';
    } | null>(null);

    const handleEmojiClick = async (day: number, emoji: string) => {
        // Create the full date string FIRST
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Determine if this is add or remove
        const isRemoving = dailyReactions[dateString]?.some(r => r.emoji === emoji);

        // Trigger animation
        setAnimatingDay({ day, emoji, action: isRemoving ? 'remove' : 'add' });
        setTimeout(() => setAnimatingDay(null), 600);

        // Close the picker after reaction
        setActiveDate(null);

        await onReactionChange(dateString, emoji, isRemoving ? 'remove' : 'add');
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
                    const isToday = getToday(dateString);
                    const isPast = new Date(dateString) < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                        <div key={day} className="relative pt-1.5 m-1.5">
                            {/* Emoji Reaction Animation */}
                            {animatingDay && animatingDay.day === day && (
                                <span className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30
                                    ${animatingDay.action === 'add'
                                        ? 'animate-in zoom-in-50 fade-in-0 duration-500 ease-in-out'
                                        : 'hidden'
                                    }`}>
                                    <span className={`text-3xl transition-all duration-300
                                        ${animatingDay.action === 'remove' ? 'scale-50' : 'scale-100'}`}>
                                        {animatingDay.emoji}
                                    </span>
                                </span>
                            )}

                            {/* Day Number Button */}
                            <button
                                onClick={() => isToday && toggleDayPicker(day)}
                                disabled={!isToday}
                                className={`group w-full h-full aspect-square text-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center
                                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                                    ${isToday ? 'hover:bg-accent hover:text-accent-foreground cursor-pointer border border-border' : 'cursor-default opacity-70'}
                                    ${isPast ? 'grayscale' : ''}
                                `}
                                aria-label={`${monthName} ${day}${isToday ? ' (Today)' : ''}`}
                                aria-expanded={isActive}
                            >
                                {day}
                                {/* Show saved reaction for this day */}
                                {dailyReactions[dateString]?.length > 0 && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/6 flex gap-0.5">
                                        {dailyReactions[dateString].slice(0, 2).map((item, i) => (
                                            <span
                                                key={item.emoji}
                                                className={`text-xs opacity-70 animate-in blur-in transition-all
                                                     ${i === 0 ? 'scale-100' : 'scale-90 opacity-60'}`}
                                                title={`${item.emoji}: ${item.count} reactions`}
                                            >
                                                {item.emoji}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </button>

                            {/* Emoji Picker - Only show for TODAY and active day */}
                            {isActive && isToday && (
                                <div
                                    // Prevent clicks inside from closing
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1 animate-in slide-in-from-top-50 fade-in-50 transition-all duration-300 ease-in-out z-20"
                                >
                                    <div className="bg-sidebar backdrop-blur-sm rounded-md shadow-md border border-border px-1.5 py-1 flex gap-1.5">
                                        {["😄", "😭", "😡", "😖", "😴", "🤩"].map(emoji => {
                                            // Find count for this emoji on this date
                                            const countData = dailyReactions[dateString]?.find(r => r.emoji === emoji);
                                            const count = countData?.count || 0;

                                            return (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleEmojiClick(day, emoji)}
                                                    className="relative hover:scale-125 transition-transform active:scale-100 flex flex-col items-center"
                                                    aria-label={`Today's mood was: ${emoji}`}
                                                >
                                                    <span className='text-sm'>{emoji}</span>
                                                    {count > 0 && (
                                                        <span className="text-[9px] text-muted-foreground mt-0.5">
                                                            {count}
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
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
    const [dailyReactions, setDailyReactions] = useState<Record<string, { emoji: string; count: number }[]>>({});

    const onReactionChange = async (date: string, emoji: string, action: 'add' | 'remove') => {
        // Sync to backend
        const success = await submitReaction(date, emoji, action);
        if (success) {
            // Refresh counts for this date
            const res = await fetch(`/api/reactions?date=${date}`);
            if (res.ok) {
                const data = await res.json();
                setDailyReactions(prev => ({ ...prev, [date]: data.reactions }));
            }
        }
    }

    // Fetch all reactions for the `year`
    useEffect(() => {
        const fetchYearReactions = async () => {
            try {
                const res = await fetch(`/api/reactions/bulk?year=${year}`);
                if (res.ok) {
                    const data = await res.json();
                    setDailyReactions(data.reactions); // data.reactions is already grouped by date!
                }
            } catch (e) {
                console.error("Failed to fetch year reactions", e);
            }
        };

        fetchYearReactions();
    }, [year]);

    // Close emoji picker when click outside
    useEffect(() => {
        if (!activeDate) return;

        const handleClickOutside = () => setActiveDate(null);
        // Delay slightly to avoid closing immediately when opening
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeDate, setActiveDate]);

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
                    dailyReactions={dailyReactions}
                    onReactionChange={onReactionChange}
                />
            ))}
        </div>
    );
}
