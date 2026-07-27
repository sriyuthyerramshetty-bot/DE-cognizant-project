import { useContext, useRef, useState } from 'react'
import TextAsset from '../../assets/TextAssets.json'
import { useTodo } from '../../context/TodoContext.jsx'
import { CustomerContext } from '../../context/CustomerContext.jsx'
import { useNotification } from '../../context/NotificationContext.jsx'
import { cartStorage } from '../../storage/storageProvider.js'
import DueDateInput from '../DueDateInput.jsx'
import { isSaveCheckoutButtonDisabled } from './SaveCheckoutButton.logic.js'

function SaveCheckoutButton({ cart, isFormValid }) {
    const { createTodoFromCheckout, tasks, updateTask } = useTodo()
    const { activeCustomer } = useContext(CustomerContext)
    const { showNotification } = useNotification()
    const [savedCheckoutTaskId, setSavedCheckoutTaskId] = useState(null)
    const dueDateInputRef = useRef(null)
    const [isDuePopoverOpen, setIsDuePopoverOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Button is disabled if the cart is empty, the form is invalid, or a save is already in progress.
    const isEmpty = cart.length === 0;
    const isDisabled = isSaveCheckoutButtonDisabled({
        isEmpty,
        isFormValid,
        isSaving,
        tasks,
        activeCustomerId: activeCustomer?.id,
        cart,
    })

    const savedTask = tasks.find((task) => task.id === savedCheckoutTaskId);
    
    const handleSaveCheckout = async (e) => {
        e.preventDefault();
        
        if (!activeCustomer?.id) {
            showNotification({ message: 'Please select a customer first.' })
            return
        }

        setIsSaving(true)

        const customerName = `${activeCustomer.firstName ?? ''} ${activeCustomer.lastName ?? ''}`.trim() || 'Customer'
        const customerId = activeCustomer.id
        const planNames = (cart ?? [])
            .map((item) => {
                const name = String(item?.name ?? item?.planName ?? '').trim()
                if (!name) {
                    return ''
                }

                const lines = Number(item?.lines ?? item?.lineCount ?? 1) || 1
                return lines > 1 ? `${name} x${lines}` : name
            })
            .filter(Boolean)

        // Save cart to storage if possible. If storage fails, continue with a local fallback
        // so the checkout task can still be created and the user gets feedback.
        const { success: cartSaved, error: cartError, cartId } = await cartStorage.saveCheckoutCart(customerId, cart)

        if (!cartSaved) {
            console.warn('Falling back to checkout save flow after cart save error:', cartError)
        }

        const fallbackCartId = cartId ?? `local-${customerId}-${Date.now()}`

        // Create or update the checkout todo with the saved cart reference
        const result = await createTodoFromCheckout({ 
            customerName, 
            cart: { id: fallbackCartId }, 
            customerId, 
            planNames 
        })

        if (!result?.success) {
            console.error('Failed to create checkout todo:', result)
            showNotification({ message: 'Failed to save checkout task. Please try again.' })
            setIsSaving(false)
            return
        }
        
        setSavedCheckoutTaskId(result.taskId)
        setIsSaving(false)

        const message = result.found
            ? (cartSaved ? 'Checkout saved and todo updated!' : 'Checkout saved locally and todo updated!')
            : (cartSaved ? 'Checkout saved and todo created!' : 'Checkout saved locally and todo created!')

        showNotification({
            message,
            duration: 8000,
            actionLabel: 'Set due date?',
            onAction: handleNotificationAction,
        })
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
        </>
    )
}

export default SaveCheckoutButton;