function PlanRowHeader() {
    return (
        <div className="grid grid-cols-[1.5rem_1fr_1fr_1fr_1fr_1fr] gap-4 items-center border w-full h-12 bg-red-300 rounded-sm shadow-sm px-4 mb-1">
            <div aria-hidden="true" />
            <h2 className="text-left text-lg text-black font-semibold truncate">Name</h2>
            <h2 className="text-center text-md text-black font-semibold">Type</h2>
            <h2 className="text-center text-md text-black font-semibold">Network</h2>
            <h2 className="text-center text-md text-black font-semibold">Speed</h2>
            <h2 className="text-right text-md text-black font-semibold">Price</h2>
        </div>
    )
}

export default PlanRowHeader;