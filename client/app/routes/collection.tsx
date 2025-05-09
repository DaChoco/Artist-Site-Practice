import type { Route } from "./+types/collection";
import { useSearchParams, Link } from "react-router";
import { useState, useEffect } from "react";

import type { productType } from "./item";

import ArtBox from "~/components/artbox";
import Navbar from "~/components/navbar";
import { FooterPage } from "~/components/footer";


export default function Collection(){
    const [artdata, setArtdata] = useState<productType[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalPages, setTotalPages] = useState<number>(1)

    const currentPage = searchParams.get("page")
   
    const handleNextPage = ()=>{
        if (!currentPage){
            return
        }
        setSearchParams({page: String(parseInt(currentPage) + 1)})
    }

    

    useEffect(()=>{
        const handleRetrieveArt = async()=> {
            let url
            if (!currentPage){
                 url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/all`
            }
            else{
                 url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/all?page=${currentPage}`
            }
            
            try{
                const response = await fetch(url, {method: "GET"})
                const data = await response.json()
    
                setArtdata(data["reply"])
                setTotalPages(data["pages"])
                console.log(data)
               
            }
            catch (error){
                console.log(error)
            }
        }
        handleRetrieveArt()
        
    }, [totalPages])

    const  handleToggleInStock = async(toggleBool: string)=>{
        const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/filter/stock?instock=${toggleBool}`

        if (toggleBool == "Neither"){
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()
            setArtdata(data["reply"])
            setTotalPages(data["pages"])
            return
        }
        try{
            const response = await fetch(url, {method: "GET"})
            const data = await response.json()
            setArtdata(data["reply"])
            setTotalPages(data["pages"])
        }
        catch (error){
            console.log(error)
        }
    }
    return (<>
        <Navbar></Navbar>
        <main className="w-full max-w-[1000px] w-6/12 mx-auto">

            <section id="info">
                <h1 className="font-mono text-5xl">Artworks</h1>
                <p className="font-mono text-slate-900 dark:text-stone-400">These are some of our new artworks that have been produced by Jacko, perhaps take a look, you may find something you like</p>

                <div className="filter-section flex flex-row justify-around">

                    <span className="flex flex-row space-x-1">
                    <p>Filter:</p> 
                    <select title="filterbox"name="stock" id="instock" onChange={(e) =>handleToggleInStock(e.target.value)}>
                        <option value="True">In Stock</option>
                        <option value="False">Out of stock</option>
                        <option value={"Neither"}>Both</option>
                    </select>
                    </span>

                    <p>Price:</p>

                    <p>Most Recent:</p>
                </div>
            </section>
            <section id="art-products" className="artwork-grid grid grid-cols-3 grid-rows-3 my-5 gap-3">
                {artdata.map((artdata, index) => (<ArtBox key={index} artwork={artdata}></ArtBox>))}
            </section>

            <section id="page-pagination-boxes" className="flex flex-row justify-center items-center space-x-5 my-5">
                {Array.from({length: totalPages}, (_, index) => (
                    <Link key={index} to={`/collection/all?page=${index + 1}`}>
                        <div className="page-pagination-box text-center p-[1.5rem] border-black dark:border-white border-3 hover:bg-[var(--accent-col)] hover:text-white">
                            {index + 1}
                        </div>
                    </Link>
                ))}

            </section>

            
            

        </main>
        <FooterPage></FooterPage>
        </>)
}