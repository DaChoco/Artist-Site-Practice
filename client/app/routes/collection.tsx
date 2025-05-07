import type { Route } from "./+types/collection";
import { useState, useEffect } from "react";

import type { productType } from "./item";
import ArtBox from "~/components/artbox";


export default function Collection(){
    const [artdata, setArtdata] = useState<productType[]>([])

    const handleRetrieveArt = async()=> {
        const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/all`

        try{
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()

            setArtdata(data["reply"])
            console.log(data["reply"])
           
        }
        catch (error){
            console.log(error)
        }
    }

    useEffect(()=>{
        handleRetrieveArt()
    }, [])
    return (
        <main>
            <section className="artwork-grid">
                {artdata.map((artdata, index) => (<ArtBox key={index} artwork={artdata}></ArtBox>))}
            </section>

        </main>)
}