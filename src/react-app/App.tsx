import { useState } from "react";
import Calendar from "./components/calendar";
import Header from "./components/header";

// Constants for year boundaries
const LAUNCH_YEAR = 2026;
const CURRENT_YEAR = new Date().getFullYear();

function App() {
	// Clamp initial year to valid range (just in case!)
	const initialYear = Math.min(
		Math.max(new Date().getFullYear(), LAUNCH_YEAR),
		CURRENT_YEAR
	);

	const [year, setYear] = useState<number>(initialYear);

	const handlePrevYear = () => {
		if (year > LAUNCH_YEAR) {
			setYear(y => y - 1);
		}
	};

	const handleNextYear = () => {
		if (year < CURRENT_YEAR) {
			setYear(y => y + 1);
		}
	};

	return (
		<div className="min-h-screen w-full bg-white relative">
			<div
				className="fixed inset-0 z-0 pointer-events-none"
				style={{
					backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, #f3f4f6 2px, #f3f4f6 4px)",
				}}
			/>

			<div className="relative z-10">
				<Header
					year={year}
					onPrevYear={handlePrevYear}
					onNextYear={handleNextYear}
					minYear={LAUNCH_YEAR}
					maxYear={CURRENT_YEAR}
				/>
				<Calendar year={year} />
			</div>
		</div>
	);
}

export default App;
