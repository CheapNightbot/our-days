

export default function Calendar() {
    const today = new Date();
    const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

    return (
        <div className="grid grid-cols-3 gap-6 px-8 py-4">
            {[...Array(12)].map((_, i) => (
                <div className="border rounded-md">
                    <h1 className="text-center font-bold text-lg border-b">
                        {new Intl.DateTimeFormat("en-US", {
                            month: 'long',
                        }).format(new Date(today.getFullYear(), i))}</h1>
                    <div className="grid grid-cols-7">
                        {[...Array(daysInMonth(today.getFullYear(), i + 1))].map((_, j) => (
                            <p key={j} className="text-center hover:bg-accent hover:text-accent-foreground rounded-full p-1">{j + 1}</p>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
