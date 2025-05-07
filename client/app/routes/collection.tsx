import type { Route } from "./+types/collection";
import { useState, useEffect } from "react";

import type { productType } from "./item";

import ArtBox from "~/components/artbox";
import Navbar from "~/components/navbar";


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
    return (<>
        <Navbar></Navbar>
        <main>
            <section className="artwork-grid grid grid-cols-3 grid-rows-3 mx-auto my-5 w-full max-w-[1000px] w-6/12">
                {artdata.map((artdata, index) => (<ArtBox key={index} artwork={artdata}></ArtBox>))}
            </section>

        </main>
        </>)
}