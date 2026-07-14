import { Grid2x2, Rows3 } from "lucide-react"
import TextAsset from "../../assets/TextAssets.json"

function CardViewButton ({ cardView, setCardView }) {
    return (
        <button 
            onClick={() => {setCardView(!cardView)}}
            title={cardView ? TextAsset.CardViewButton.list : TextAsset.CardViewButton.grid}
            className="border p-2 rounded-lg outline-none hover:border-gray-400 focus:border-gray-400"
        >
            {cardView ? <Rows3 size={20} /> : <Grid2x2 size={20} />}
        </button>
    )
}

export default CardViewButton;