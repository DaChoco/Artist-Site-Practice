
import { useState, useEffect } from "react"

export type productType = {
    _id: string,
    itemID: string,
    productID: string,
    title: string,
    categories: Array<string>,
    url: string | undefined,
    stock: number,
    price: number
    createdAt: number | null
}
export default function Item(){
    const [art, setArt] = useState<productType | null>(null)

    useEffect(()=>{
        const handleRetrieveArtSelected = async ()=>{
    
            try{
                if (!art){
                    throw new Error("No art selected or loaded yet")
                }
                const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/${art["_id"]}`
                const response = await fetch(url, {method: "GET"})
    
                if (!response.ok){
                    throw new Error("The API fetch request has failed")
                }
    
                const data = await response.json()
                setArt(data)
    
    
                
            }
            catch (error){
                console.log("An error has occured: ", error)
                
            }
        }

    },[])

    return (
    <div>

    </div>
    )
}