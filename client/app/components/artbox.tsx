import type { productType } from "~/routes/item";

export default function ArtBox({artwork}: {artwork: productType}){

    return(
    <div className="art-container">
        <div className="art-wrapper overflow-hidden relative w-full object-contain">
            <img src={artwork["url"] ?? undefined} alt={`Art of ${artwork["title"]}`} className="artwork" />
            <p className="is-sale absolute z-500 bottom-1 left-1 bg-black p-2 rounded-3xl ">Sale!</p>
        </div>
        
        <div className="art-info">
            <h3 className="art-title">{artwork["title"]}</h3>
            <h4 className="art-price">{String(artwork["price"])}</h4>
        </div>

    </div>)
}