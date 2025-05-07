import type { productType } from "~/routes/item";

export default function ArtBox({artwork}: {artwork: productType}){

    return(
    <div className="art-container">
        <div className="art-wrapper">
            <img src={artwork["url"] ?? undefined} alt={`Art of ${artwork["title"]}`} className="artwork" />
            <div className="is-sale">
                <p>Sale</p>
            </div>
        </div>
        
        <div className="art-info">
            <h3 className="art-title">{artwork["title"]}</h3>
            <h4 className="art-price">{String(artwork["price"])}</h4>
        </div>

    </div>)
}