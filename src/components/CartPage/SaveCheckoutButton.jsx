import { useContext, useRef, useState } from 'react'
import TextAsset from '../../assets/TextAssets.json'
import { TodoContext } from '../../context/TodoContext.jsx'
import { CustomerContext } from '../../context/CustomerContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import Notification from '../Notification.jsx'
import DueDateInput from '../DueDateInput.jsx'

function SaveCheckoutButton({ cart, isFormValid }) {
    const { createTodoFromCheckout, tasks, setTasks } = useContext(TodoContext)
    const { activeCustomer } = useContext(CustomerContext)
    const { isCheckoutSaved, markCheckoutSaved } = useCart()
    const [notice, setNotice] = useState('')
    const [isDuePopoverOpen, setIsDuePopoverOpen] = useState(false)
    const [savedCheckoutTaskId, setSavedCheckoutTaskId] = useState(null)
    const dueDateInputRef = useRef(null)

    // Button is disabled if the cart is empty or the form is invalid
    const isEmpty = cart.length === 0;
    const isDisabled = isEmpty || !isFormValid || isCheckoutSaved;

    const savedTask = tasks.find((task) => task.id === savedCheckoutTaskId);
    
    const handleSaveCheckout = (e) => {
        e.preventDefault();
        const customerName = activeCustomer
            ? `${activeCustomer.firstName ?? ''} ${activeCustomer.lastName ?? ''}`.trim()
            : 'Customer'
        const customerId = activeCustomer?.id ?? null

        const result = createTodoFromCheckout({ customerName, cart, customerId })
        markCheckoutSaved()
        setSavedCheckoutTaskId(result.taskId)
        setIsDuePopoverOpen(true)

        if (result.found) {
            setNotice('Todo item updated successfully!')
        } else {
            setNotice('Todo item created successfully!')
        }
    };

    const handleTaskDueDateClear = (taskId) => {
        setTasks((currentTasks) =>
        currentTasks.map((task) =>
            task.id === taskId
            ? { ...task, dueAt: '', reminderAt: null, reminderNotifiedAt: null }
            : task,
        ),
        )
    }

    const handleTaskDueDateCommit = (taskId, parsedDue) => {
        setTasks((currentTasks) =>
        currentTasks.map((task) =>
            task.id === taskId
            ? {
                ...task,
                dueAt: parsedDue.normalizedDisplay,
                reminderAt: parsedDue.date.toISOString(),
                reminderNotifiedAt: null,
                }
            : task,
        ),
        )
        setNotice('Due date saved.')
    }

    const handleDoneClick = () => {
        dueDateInputRef.current?.commitNow?.()
        setIsDuePopoverOpen(false)
    }

    return (
        <>
            <div className="relative inline-block">
                <button
                    onClick={handleSaveCheckout                }
                type="button"
                disabled={isDisabled}
                className={`mt-2 text-white py-2 w-full rounded-md transition-colors ${
                    isDisabled
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                >
                    {TextAsset.UserInfoBox.saveCheckoutButton}
                </button>

                {isDuePopoverOpen && savedTask ? (
                    <div className="absolute left-1/2 bottom-full z-[100] mb-3 w-72 -translate-x-1/2 rounded-lg border border-gray-300 bg-white p-3 shadow-xl">
                        <p className="mb-2 text-xs font-semibold text-gray-700">Set due date (optional)</p>
                        <DueDateInput
                            ref={dueDateInputRef}
                            taskId={savedTask.id}
                            taskName={savedTask.name}
                            value={savedTask.dueAt}
                            onCommit={handleTaskDueDateCommit}
                            onClear={handleTaskDueDateClear}
                            isCompleted={savedTask.isCompleted}
                            isEditable
                        />
                        <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={handleDoneClick}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        >
                            Done
                        </button>
                    </div>
                    <div className="absolute left-1/2 -bottom-2 h-4 w-4 -translate-x-1/2 rotate-45 border-r border-b border-gray-300 bg-white" aria-hidden="true" />
                </div>
            ) : null}
            </div>

            <Notification message={notice} onDone={() => setNotice('')} duration={2600} />
        </>
    )
}

export default SaveCheckoutButton;