import type { Route } from "./+types/collection";
import "../app.css"
import { useSearchParams, Link, useNavigate, useParams } from "react-router";
import { useState, useEffect, useContext } from "react";

import type { productType } from "./item";



import ArtBox from "~/components/artbox";
import Navbar from "~/components/navbar";
import { FooterPage } from "~/components/footer";
import { loadingcontext } from "~/contexts/loading";


export default function Collection() {
    const [artdata, setArtdata] = useState<productType[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [totalPages, setTotalPages] = useState<number>(1)

    const currentPage = searchParams.get("page")

    const loadingcircle = useContext(loadingcontext)

    const navigator = useNavigate()

    const handleNextPage = () => {
        if (!currentPage) {
            return
        }
        setSearchParams({ page: String(parseInt(currentPage) + 1) })
    }



    useEffect(() => {
        const handleRetrieveArt = async () => {

            //----------------------SEARCH BAR: You did this to avoid making a context that would only be on few pages
            loadingcircle?.setLoading(true)
            const getQuery = searchParams.get("query")
            if (getQuery) {
                let url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/Search?query=${getQuery}&categories=${getQuery}`

                try {
                    const response = await fetch(url, { method: "GET" })
                    const data = await response.json()
                    console.log(data)
                    if (response.ok) {
                        setArtdata(data["reply"])
                        return
                    }
                }
                catch (error) {
                    console.log("Error:", error)
                }
            }

            //-------------------SEARCH BAR
            let url
            if (!currentPage) {
                url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/all`
            }
            else {
                url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/all?page=${currentPage}`
            }

            try {
                const response = await fetch(url, { method: "GET" })
                const data = await response.json()

                if (!data) {
                    throw new Error("The API fetch request has failed")
                }

                if (data.detail === "Request failed") {
                    return
                }

                setArtdata(data["reply"])
                setTotalPages(data["pages"])
                console.log(data)

            }
            catch (error) {
                console.log(error)
            }
            finally{
                loadingcircle?.setLoading(false)
            }
        }
     
        handleRetrieveArt()
        

    }, [totalPages, searchParams])

    const handleToggleInStock = async (toggleBool: string) => {
        const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/filter/stock?instock=${toggleBool}`

        if (toggleBool == "Neither") {
            const response = await fetch(url, { method: "GET" })
            const data = await response.json()
            setArtdata(data["reply"])
            setTotalPages(data["pages"])
            return
        }
        try {
            const response = await fetch(url, { method: "GET" })
            const data = await response.json()
            setArtdata(data["reply"])
            setTotalPages(data["pages"])
        }
        catch (error) {
            console.log(error)
        }
    }
    return (<>
        <Navbar></Navbar>

        <div id="loading-wrapper">
            {loadingcircle?.loading && <div className="loading-circle"></div>}
        </div>

        <main className="w-full max-w-[1000px] mx-auto">

            <section id="info" className="p-5 md:p-0">
                <h1 className="font-mono text-5xl">Artworks</h1>
                <p className="font-mono text-slate-900 dark:text-stone-400">These are some of our new artworks that have been produced by Jacko, perhaps take a look, you may find something you like</p>

                <div className="filter-section flex flex-row justify-around">

                    <span className="flex flex-row space-x-1">
                        <p>Filter:</p>
                        <select title="filterbox" name="stock" id="instock" onChange={(e) => handleToggleInStock(e.target.value)}>
                            <option className="text-slate-950" value="True">In Stock</option>
                            <option className="text-slate-950" value="False">Out of stock</option>
                            <option className="text-slate-950" value={"Neither"}>Both</option>
                        </select>
                    </span>

                    <p>Price:</p>

                    <p>Most Recent:</p>
                </div>
            </section>
            <section id="art-products" className="artwork-grid overflow-hidden grid grid-cols-2 auto-rows-[400px] max-h-[1920px] md:max-h-[300vh] p-5 md:p-0 md:grid-cols-3 md:auto-rows-[400px] my-5 gap-3">
                {artdata.map((artdata, index) => (<ArtBox key={index} artwork={artdata}></ArtBox>))}
            </section>

            <section id="page-pagination-boxes" className="flex flex-row justify-center items-center space-x-5 my-5">
                {Array.from({ length: totalPages }, (_, index) => (
                    <Link className="hover:bg-[var(--accent-col)] " key={index} to={`/collection/all?page=${index + 1}`}>
                        <div className="page-pagination-box text-center p-[1.5rem] border-black dark:border-white border-3  hover:text-white">
                            {index + 1}
                        </div>
                    </Link>
                ))}

            </section>




        </main>
        <FooterPage></FooterPage>
    </>)
}