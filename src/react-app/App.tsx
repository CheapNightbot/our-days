import Calendar from "./components/calendar";

function App() {
	return (
		<div className="min-h-screen w-full bg-white relative">
			<div
				className="fixed inset-0 z-0 pointer-events-none"
				style={{
					backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, #f3f4f6 2px, #f3f4f6 4px)",
				}}
			/>
			<div className="relative z-10">
				<Calendar />
			</div>
		</div>
	);
}

export default App;
