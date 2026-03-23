

export default function Calendar() {
    const today = new Date();
    const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

    return (
        <div className="w-80 p-10">
            <h1 className="text-center font-bold text-lg border">{new Intl.DateTimeFormat("en-US", {
                year: 'numeric',
                month: 'long',
            }).format(today)}</h1>
            <div className="grid grid-cols-7 border rounded-md p-2">
                {[...Array(daysInMonth(today.getFullYear(), today.getMonth() + 1))].map((_, i) => (
                    <p key={i} className="text-center hover:bg-accent hover:text-accent-foreground rounded-full p-1">{i + 1}</p>
                ))}
            </div>
        </div>
    )
}
