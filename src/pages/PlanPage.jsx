function PlanPage({ plans }) {
    return (
        <>
            <div className="p-6">
                <h1 className="text-2xl font-semibold">Calendar</h1>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="border p-4 mb-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold">{plan.name}</h2>
                        <p>Type: {plan.type}</p>
                        <p>Speed: {plan.speed}</p>
                        <p>Price: {plan.price}</p>
                        {plan.bestValue && <p className="text-green-500 font-bold">Best Value</p>}
                    </div>
                ))}
            </div>
        </>
    )
}

export default PlanPage;