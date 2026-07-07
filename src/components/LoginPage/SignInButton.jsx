import TextAsset from '../../assets/TextAssets.json'

function SignInButton({submitting}) {
    return (
        <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
            {submitting ? 'Signing in…' : TextAsset.LoginPage.signInButton}
        </button>
    )
}

export default SignInButton;