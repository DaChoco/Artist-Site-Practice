import type { productType } from "~/routes/item";
import { useNavigate, Link } from "react-router";
import ConvertCurrency from "~/helpers/convert";
import { currencyContext } from "~/contexts/currency";
import { useEffect, useContext, useState, use } from "react";
import { Image } from '@imagekit/react';

export default function ArtBox({artwork}: {artwork: productType}){
    const Navigator = useNavigate()
    const [prices, setPrices] = useState<number>(0)

    function handleCurrency(price: number, ratio: number){ //this is the one for normal ZAR or if API is down
        const new_price = (price * ratio).toFixed(2)

        return new_price
    }
    const selectedCurrencies = useContext(currencyContext)

    if (!selectedCurrencies){
        throw new Error("No currency context found")
    }

    
    useEffect(()=>{
        const retrieveConvertedValues = async()=>{

            const data = await ConvertCurrency(artwork["price"], selectedCurrencies.currentCurrency)
            if (data){
                setPrices(Number(data))
            }

        }

        retrieveConvertedValues()
    },[selectedCurrencies.currentCurrency])

    //className="artwork w-full h-full object-contain"

    return(

<Link to={`/collection/${artwork["_id"]}`}>
    <div className="art-container">
        <div className="art-wrapper overflow-hidden relative w-full h-[300px] bg-gray-300 dark:bg-slate-500">
            <Image src={artwork["key"] ?? undefined} urlEndpoint="https://ik.imagekit.io/gp2sqgkfsChocoChoco" alt={`Art of ${artwork["title"]}`} className="artwork w-full h-full object-contain" />
            
            {artwork["sale"] && (<p className="is-sale text-white absolute z-500 bottom-1 left-1 bg-black p-2 rounded-3xl ">Sale!</p>)}
            
        </div>
        
        <div className="art-info">
            <h3 className="art-title font-bold text-sm md:text-xl text-slate-400 dark:text-slate-700">{artwork["title"]}</h3>

            {artwork["sale"] == false || artwork["sale"] == undefined ? ( 
                <h4 className="art-price text-2xl">{selectedCurrencies.currencySymbol + handleCurrency(prices, 1)}</h4>):(<><h4 className="line-through text-2xl">{selectedCurrencies.currencySymbol + handleCurrency(prices, 1)}</h4><h4 className="art-price text-2xl">{selectedCurrencies.currencySymbol + handleCurrency(prices, 0.7)}</h4></>)}
           
        </div>

    </div>
</Link>
    
)
}