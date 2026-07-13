import { Grid2x2 } from "lucide-react"

function CardViewButton ({ cardView, setCardView }) {
    return (
        <button 
            onClick={() => {setCardView(!cardView)}}
            className="border p-2 rounded-lg"
        >
            <Grid2x2 size={20} />
        </button>
    )
}

export default CardViewButton;