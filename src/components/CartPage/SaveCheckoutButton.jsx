import { useContext, useRef, useState } from 'react'
import TextAsset from '../../assets/TextAssets.json'
import { useTodo } from '../../context/TodoContext.jsx'
import { CustomerContext } from '../../context/CustomerContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { cartStorage } from '../../storage/storageProvider.js'
import Notification from '../Notification.jsx'
import DueDateInput from '../DueDateInput.jsx'

function SaveCheckoutButton({ cart, isFormValid }) {
    const { createTodoFromCheckout, tasks, updateTask } = useTodo()
    const { activeCustomer } = useContext(CustomerContext)
    const { isCheckoutSaved, markCheckoutSaved } = useCart()
    const [notice, setNotice] = useState('')
    const [savedCheckoutTaskId, setSavedCheckoutTaskId] = useState(null)
    const dueDateInputRef = useRef(null)
    const [isDuePopoverOpen, setIsDuePopoverOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Button is disabled if the cart is empty or the form is invalid
    const isEmpty = cart.length === 0;
    const isDisabled = isEmpty || !isFormValid || isCheckoutSaved || isSaving;

    const savedTask = tasks.find((task) => task.id === savedCheckoutTaskId);
    
    const handleSaveCheckout = async (e) => {
        e.preventDefault();
        
        if (!activeCustomer?.id) {
            setNotice('Please select a customer first.')
            return
        }

        setIsSaving(true)

        const customerName = `${activeCustomer.firstName ?? ''} ${activeCustomer.lastName ?? ''}`.trim() || 'Customer'
        const customerId = activeCustomer.id
        const planNames = cart.map((item) => item.name || item.planName).filter(Boolean)

        // Save cart to database
        const { success: cartSaved, error: cartError, cartId } = await cartStorage.saveCheckoutCart(customerId, cart)

        if (!cartSaved) {
            console.error('Failed to save cart:', cartError)
            setNotice('Failed to save cart. Please try again.')
            setIsSaving(false)
            return
        }

        // Create todo with cart reference
        const result = await createTodoFromCheckout({ 
            customerName, 
            cart: { id: cartId }, 
            customerId, 
            planNames 
        })
        
        markCheckoutSaved()
        setSavedCheckoutTaskId(result.taskId)
        setIsSaving(false)

        if (result.found) {
            setNotice('Checkout saved and todo updated!')
        } else {
            setNotice('Checkout saved and todo created!')
        }
    };

    const handleTaskDueDateClear = async (taskId) => {
        await updateTask(taskId, { dueAt: '', reminderAt: null, reminderNotifiedAt: null })
    }

    const handleTaskDueDateCommit = async (taskId, parsedDue) => {
        await updateTask(taskId, {
            dueAt: parsedDue.normalizedDisplay,
            reminderAt: parsedDue.hasTime ? parsedDue.date.toISOString() : null,
            reminderNotifiedAt: null,
        })
    }

    const handleDoneClick = () => {
        dueDateInputRef.current?.commitNow?.()
        setIsDuePopoverOpen(false)
    }

    const handleNotificationAction = () => {
        setIsDuePopoverOpen(true)
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div
                            className="w-74 rounded-lg border border-gray-300 bg-white p-3 shadow-xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <p className="mb-2 text-xs font-semibold text-gray-700">Set due date (optional)</p>
                            <DueDateInput
                                ref={dueDateInputRef}
                                taskId={savedTask.id}
                                taskName={savedTask.name}
                                value={savedTask.dueAt}
                                reminderAt={savedTask.reminderAt}
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
                    </div>
                </div>
            ) : null}
            </div>

            <Notification message={notice} onDone={() => setNotice('')} duration={8000} actionLabel="Set due date?" onAction={handleNotificationAction} />
        </>
    )
}

export default SaveCheckoutButton;