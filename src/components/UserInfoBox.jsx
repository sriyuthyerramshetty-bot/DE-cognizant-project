import TextAsset from '../assets/TextAssets.json'

function UserInfoBox () {
    return (
        <div className="flex-1 border rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{TextAsset.UserInfoBox.title}</h2>
            <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.name}</label>
                    <input type="text" placeholder="John Doe" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.email}</label>
                    <input type="email" placeholder="john@example.com" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.phone}</label>
                    <input type="tel" placeholder="xxx-xxx-xxxx" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">{TextAsset.UserInfoBox.address}</label>
                    <input type="text" placeholder="123 Main St" className="border rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400" />
                </div>
                <button type="submit" className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                    {TextAsset.UserInfoBox.submitButton}
                </button>
            </form>
        </div>
    )
}

export default UserInfoBox;