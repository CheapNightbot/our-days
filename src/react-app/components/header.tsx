import { MinusIcon } from "../icons/minus";
import { PlusIcon } from "../icons/plus";

interface HeaderProps {
    year: number;
    onPrevYear: () => void;
    onNextYear: () => void;
    minYear?: number;
    maxYear?: number;
}

export default function Header({
    year,
    onPrevYear,
    onNextYear,
    minYear = 2026,
    maxYear = new Date().getFullYear(),
}: HeaderProps) {
    // Calculate if buttons should be disabled
    const canGoPrev = year > minYear;
    const canGoNext = year < maxYear;

    return (
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-border px-8 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <h1 className="text-xl font-bold text-transparent bg-linear-to-r from-chart-1 to-chart-4 bg-clip-text hover:from-chart-2 hover:to-chart-3 transition-colors duration-500 ease-in-out">
                    Our Days
                </h1>

                <div className="flex items-center gap-3">
                    {/* Previous Year Button */}
                    <button
                        onClick={onPrevYear}
                        disabled={!canGoPrev}
                        title={!canGoPrev ? "Our journey starts in 2026 ✧" : ""}
                        className={`p-1 rounded-full transition-transform
                            ${canGoPrev
                                ? 'hover:bg-secondary text-secondary-foreground active:scale-90'
                                : 'text-muted-foreground cursor-not-allowed opacity-50'
                            }`}
                        aria-label="Previous year"
                    >
                        <MinusIcon width={20} height={20} />
                    </button>

                    {/* Year Display */}
                    <span className="relative text-lg font-semibold text-primary min-w-[4ch] text-center">
                        {year}
                        <small className="absolute right-0 top-0 -translate-y-2.5 translate-x-2.5 animate-pulse">
                            {year === new Date().getFullYear() && "✧"}
                        </small>
                    </span>

                    {/* Next Year Button */}
                    <button
                        onClick={onNextYear}
                        disabled={!canGoNext}
                        title={!canGoNext ? "This year hasn't bloomed yet 🌸" : ""}
                        className={`p-1 rounded-full transition-transform
                            ${canGoNext
                                ? 'hover:bg-secondary text-secondary-foreground active:scale-90'
                                : 'text-muted-foreground cursor-not-allowed opacity-50'
                            }`}
                        aria-label="Next year"
                    >
                        <PlusIcon width={20} height={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
