
import { useState, useEffect, useContext, use } from "react"
import { useSearchParams, useParams } from "react-router"
import { currencyContext } from "~/contexts/currency"
import { loadingcontext } from "~/contexts/loading"
import ConvertCurrency from "~/helpers/convert"
import Navbar from "~/components/navbar"
import { FooterPage } from "~/components/footer"

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
    sale: boolean | undefined,
    desc: string
}


export default function Item(){
    const [art, setArt] = useState<productType>()
    const [price, setPrice] = useState<number>(0)


    const [searchParams, setSearchParams] = useSearchParams()
    const {productid} = useParams()

    const selectedCurrencies = useContext(currencyContext)
    const loadingcircle = useContext(loadingcontext)

    if (!selectedCurrencies || !loadingcircle){
        throw new Error("No currency context found")
    }

    useEffect(()=>{
        const handleRetrieveArtSelected = async ()=>{
      
           
    
            try{
                if (!productid){
                    throw new Error("No art selected or loaded yet")
                }
                const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/${productid}`
                const response = await fetch(url, {method: "GET"})
    
                if (!response.ok){
                    throw new Error("The API fetch request has failed")
                }
    
                const data = await response.json()
                console.log(data)
                setArt(data)
    

                
            }
            catch (error){
                console.log("An error has occured: ", error)
                
            }
            
        }
        loadingcircle.setLoading(true)
        handleRetrieveArtSelected()
        loadingcircle.setLoading(false)


    },[])

    useEffect(()=>{
        const handleConvert = async()=>{
            
         
       
            if (!art){

                return
            }
            const result = await ConvertCurrency(art["price"], selectedCurrencies.currentCurrency)
            if (!result){
                return
            }
    
          
            
            setPrice(Number(result.toFixed(2)))
            
        

        
        }
        loadingcircle.setLoading(true)
        handleConvert()
        loadingcircle.setLoading(false)

    },[art, selectedCurrencies.currentCurrency])

    return (
    <>
    <Navbar></Navbar>

    <div id="loading-wrapper">
        {loadingcircle.loading && <div className="loading-circle"></div>}
    </div>

    <main className="h-full my-5">

    <section id="art-item" className="grid lg:grid-cols-2 lg:grid-rows-1 md:grid-cols-1 md:grid-rows-2 gap-1 h-[max-content] p-5 md:p-0 md:h-[90dvh]">
        <div id="img-wrapper" className="relative h-full mx-auto">
        <img className="w-auto h-full object-contain rounded-xl" src={art?.url} alt={art?.title} />
        </div>

        <div id="content-wrapper" className="flex flex-col lg:p-5 ">
    <div>
        <h1 className="font-semibold text-3xl">{ art?.title}</h1>
        <p className="text-3xl text-[var(--accent-col)]">{selectedCurrencies.currencySymbol + price}</p>
    </div>

    <div>
        <h3 className="font-medium text-3xl"> <p>Description</p></h3>
        <p>{art?.desc}</p>
    </div> 


        <div id="checkoutselect" className="flex flex-row items-center space-x-5">
            <p>Quantity</p> <input className="p-2 bg-slate-100 rounded-lg focus:outline-none border-2 border-slate-600 text-slate-800 dark:text-slate-950" type="number" placeholder="1" />
        </div>

        <div id="checkoutbtns" className="flex flex-col children-padding w-8/12 my-5 mx-auto space-y-5">
            <button type="button" className="bg-yellow-400 text-stone-800 border-2 border-stone-500 dark:border-none text-semibold">Pay with Paypal</button>
            <button type="button" className="bg-purple-800 text-slate-100 border-2 border-stone-400 dark:border-none">Pay with Stripe</button>
            <button type="button" className="border-1">Add to cart!</button>
        </div>

        </div>
        
    </section>

    </main>

    <FooterPage></FooterPage>
    </>
    )
}