function CalendarHeader() {
    return (
        <div className="grid grid-cols-7 items-center border relative rounded-md p-4 shadow-sm border-gray-300">
            <h3 className="text-black text-lg font-semibold text-center">Sun</h3>
            <h3 className="text-black text-lg font-semibold text-center">Mon</h3>
            <h3 className="text-black text-lg font-semibold text-center">Tue</h3>
            <h3 className="text-black text-lg font-semibold text-center">Wed</h3>
            <h3 className="text-black text-lg font-semibold text-center">Thu</h3>
            <h3 className="text-black text-lg font-semibold text-center">Fri</h3>
            <h3 className="text-black text-lg font-semibold text-center">Sat</h3>
        </div>
    )
}

export default CalendarHeader;