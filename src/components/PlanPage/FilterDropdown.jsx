import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import TextAsset from '../../assets/TextAssets.json'

// The selectable filter/sort options, in display order. Kept in one place so
// the button label and the option list stay in sync.
const OPTION_VALUES = ['all', 'Home Internet', 'Mobile', '5G', 'Fiber', 'Price', 'Speed', 'Best Value']

// Custom dropdown used instead of a native <select>. A native select renders
// its option list in an OS-level popup whose behavior is environment specific;
// combined with this page re-rendering on every search keystroke, the popup
// could be dismissed before the first selection registered (the "first click
// after searching does nothing" bug). This implementation renders the list as
// normal DOM we fully control, so a selection is just an onClick — reliable and
// consistent everywhere.
function FilterDropdown({ filter, setFilter }) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)

    const label = TextAsset.PlanPage.options[filter] ?? TextAsset.PlanPage.options.all

    // Close the menu when clicking anywhere outside it, or pressing Escape.
    useEffect(() => {
        if (!open) return undefined

        const onPointerDown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    const handleSelect = (value) => {
        setFilter(value)
        setOpen(false)
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Filter and sort plans"
                className="flex min-w-[9rem] items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none hover:border-gray-400 focus:border-gray-400"
            >
                <span>{label}</span>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 z-40 mt-1 w-full min-w-[9rem] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                    {OPTION_VALUES.map((value) => {
                        const isSelected = value === filter
                        return (
                            <li key={value} role="option" aria-selected={isSelected}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(value)}
                                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                                        isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                                    }`}
                                >
                                    <span>{TextAsset.PlanPage.options[value]}</span>
                                    {isSelected && <Check size={16} className="shrink-0 text-gray-600" />}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default FilterDropdown;