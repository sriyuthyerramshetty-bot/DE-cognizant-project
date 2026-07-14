import { useContext, useEffect, useRef } from 'react'
import CheckoutButton from './CheckoutButton.jsx'
import SaveCheckoutButton from './SaveCheckoutButton.jsx';
import { useCart } from '../../context/CartContext.jsx'
import { useUserInfo } from '../../context/UserInfoContext.jsx'
import { CustomerContext } from '../../context/CustomerContext.jsx'
import TextAsset from '../../assets/TextAssets.json'

function UserInfoBox () {

    const { cart } = useCart();
    const { formData, handleChange, isFormValid, setFormData } = useUserInfo();
    const { activeCustomer, activeCustomerId, updateActiveCustomerField } = useContext(CustomerContext)
    const previousCustomerIdRef = useRef(null)

    useEffect(() => {
        if (previousCustomerIdRef.current === activeCustomerId) {
            return
        }

        previousCustomerIdRef.current = activeCustomerId

        if (!activeCustomer) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
            })
            return
        }

        const formattedName = `${activeCustomer.firstName ?? ''} ${activeCustomer.lastName ?? ''}`.trim()
        const formattedAddress = activeCustomer.address?.line1 ?? ''

        setFormData({
            name: formattedName,
            email: activeCustomer.email ?? '',
            phone: activeCustomer.phone ?? '',
            address: formattedAddress,
        })
    }, [activeCustomerId, activeCustomer, setFormData])

    const handleUserInfoChange = (event) => {
        handleChange(event)

        if (!activeCustomerId) {
            return
        }

        updateActiveCustomerField(event.target.name, event.target.value)
    }

    return (
        <div className="flex-1 border rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{TextAsset.UserInfoBox.title}</h2>
            <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.name}</label>
                    <input name="name" value={formData.name} onChange={handleUserInfoChange} type="text" placeholder={TextAsset.UserInfoBox.namePlaceholder} className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.email}</label>
                    <input name="email" value={formData.email} onChange={handleUserInfoChange} type="email" placeholder={TextAsset.UserInfoBox.emailPlaceholder} className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.phone}</label>
                    <input name="phone" value={formData.phone} onChange={handleUserInfoChange} type="tel" placeholder={TextAsset.UserInfoBox.phonePlaceholder} className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.address}</label>
                    <input name="address" value={formData.address} onChange={handleUserInfoChange} type="text" placeholder={TextAsset.UserInfoBox.addressPlaceholder} className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-0.1">
                    <CheckoutButton cart={cart} isFormValid={isFormValid} />
                    <SaveCheckoutButton cart={cart} isFormValid={isFormValid} />
                </div>
            </form>
        </div>
    )
}

export default UserInfoBox;