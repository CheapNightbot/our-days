

export default function Calendar() {
    const today = new Date();
    const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
    const weekdays: string[] = [];


    for (let i = 0; i < 7; i++) {
        let weekday = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
        }).format(new Date(2026, 1, i + 1));
        weekdays.push(weekday)
    }

    return (
        <div className="grid grid-cols-3 gap-6 px-8 py-4 lg:max-w-5xl mx-auto">
            {[...Array(12)].map((_, month) => (
                <div className="border rounded-md">
                    <h1 className="text-center font-bold text-lg border-b">
                        {new Intl.DateTimeFormat("en-US", {
                            month: 'long',
                        }).format(new Date(today.getFullYear(), month))}
                    </h1>
                    <h2 className="grid grid-cols-7 text-center border-b">
                        {weekdays.map((weekday, i) => (
                            <span key={i}>{weekday}</span>
                        ))}
                    </h2>
                    <div className="grid grid-cols-7">
                        {[...Array(new Date(today.getFullYear(), month, 1).getDay())].map((_, i) => <div key={i}></div>)}
                        {[...Array(daysInMonth(today.getFullYear(), month + 1))].map((_, day) => (
                            <p key={day} className="text-center hover:bg-accent hover:text-accent-foreground rounded-full p-1">{day + 1}</p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
