import type { productType } from "~/routes/item";
import { useNavigate, Link } from "react-router";

export default function ArtBox({artwork}: {artwork: productType}){
    const Navigator = useNavigate()

    function handleCurrency(price: number, ratio: number){
        const new_price = (price * ratio).toFixed(2)

        return new_price
    }


    return(

<Link to={`/collection/${artwork["_id"]}`}>
    <div className="art-container">
        <div className="art-wrapper overflow-hidden relative w-full h-[300px] bg-gray-300 dark:bg-slate-500">
            <img src={artwork["url"] ?? undefined} alt={`Art of ${artwork["title"]}`} className="artwork w-full h-full object-contain" />
            {artwork["sale"] && (<p className="is-sale text-white absolute z-500 bottom-1 left-1 bg-black p-2 rounded-3xl ">Sale!</p>)}
            
        </div>
        
        <div className="art-info">
            <h3 className="art-title">{artwork["title"]}</h3>

            {artwork["sale"] == false || artwork["sale"] == undefined ? ( 
                <h4 className="art-price">{"R" + handleCurrency(artwork["price"], 1)}</h4>):(<><h4 className="line-through">{"R" + handleCurrency(artwork["price"], 1)}</h4><h4 className="art-price">{"R" + handleCurrency(artwork["price"], 0.7)}</h4></>)}
           
        </div>

    </div>
</Link>
    
)
}