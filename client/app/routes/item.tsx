
import { useState, useEffect, useContext, use } from "react"
import { useSearchParams, useParams } from "react-router"
import { currencyContext } from "~/contexts/currency"
import { loadingcontext } from "~/contexts/loading"
import ConvertCurrency from "~/helpers/convert"
import Navbar from "~/components/navbar"
import UserCartService from "~/helpers/cartHandle"
import { useCartContext } from "~/contexts/cart"
import { FooterPage } from "~/components/footer"

export type productType = {
    _id: string,
    itemID: string,
    productID: string,
    title: string,
    categories: Array<string>,
    url: string ,
    stock: number,
    price: number
    createdAt: number | null
    sale: boolean | undefined,
    desc: string,
    size: string,
    copyright: string,
    key: string
}

type commentType = {
    productID: string,
    comment: string,
    username: string,
    rating: string
}


export default function Item(){
    const [art, setArt] = useState<productType>()
    const [price, setPrice] = useState<number>(0)


    const [searchParams, setSearchParams] = useSearchParams()
    const {productid} = useParams()
    const [quantity, setQuantity] = useState<number>(0)

    const {currentCart, setCurrentCart} = useCartContext()
    const [comments, setComments] = useState<commentType[]>([])
    const [showComment, setShowComment] = useState<Boolean>(false)

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


    },[searchParams, productid])

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

    },[art, selectedCurrencies.currentCurrency, searchParams])

    
  useEffect(() => {
    console.log("Updated quantity:", quantity);
  }, [quantity]);

  useEffect(()=>{
    const handleRetrieveComment = async()=>{
        if (!art){
            return
        }
        const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/${art._id}/comments/view`
        console.log(url)
        const response = await fetch(url)
        console.log(response)
        if (!response.ok){
            setComments([])
            return
        }
        const data = await response.json()
        console.log("COMMENT:", data)
        setComments(data)
    }
    handleRetrieveComment()
  },[art])

    const handleAddtoCart = async()=>{
        const cart = new UserCartService(`http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api`, "681a59494d22f6c4e0b5d1e6")
        if (!art ){
            return
        }

        try{
        if (quantity < 1){
            alert("Type a correct quantity")
            return
        }
        const data = await cart.addToCart(art?.productID, art?.title, art?.price, art?.url, quantity)
        console.log(data)
        setCurrentCart(data)
        }
        catch (error){
            console.log("An error occured: ", error)
        }
        

    }

    

    return (
    <>
    <Navbar></Navbar>

    <div id="loading-wrapper">
        {loadingcircle.loading && <div className="loading-circle"></div>}
    </div>

    <main className="h-full my-5">

    <section id="art-item" className="grid lg:grid-cols-2 lg:grid-rows-1 md:grid-cols-1 md:grid-rows-2 gap-1 h-[max-content] p-5 md:p-0 md:h-[90dvh]">
        <div id="img-wrapper" className="relative h-full mx-auto p-5">
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
            <p>Quantity</p> <input value={quantity} onChange={(e) => {setQuantity(Number(e.target.value))}} className="p-2 bg-slate-100 rounded-lg focus:outline-none border-2 border-slate-600 text-slate-800 dark:text-slate-950" type="number" placeholder="1" />
        </div>

        <div id="checkoutbtns" className="flex flex-col children-padding w-8/12 my-5 mx-auto space-y-5">
            <button type="button" className="bg-yellow-400 text-stone-800 border-2 border-stone-500 dark:border-none text-semibold">Pay with Paypal</button>
            <button type="button" className="bg-purple-800 text-slate-100 border-2 border-stone-400 dark:border-none">Pay with Stripe</button>
            <button type="button" className="border-1" onClick={handleAddtoCart}>Add to cart!</button>
        </div>

        </div>
        
    </section>

    <section id="comment-section" className="w-8/12 h-auto mx-auto p-2 flex flex-col space-y-5 ">

    
    {comments.length > 1 && <h3 className="text-2xl">Comments and Reviews:</h3>}
    {comments.map((comment, index)=> (
        <div key={index} className="border-2 border-current p-5">
            <span className="flex justify-between"><p>{comment.username}</p> <p>Rating: {comment.rating}</p></span>
            <p>{comment.comment}</p>
        </div>
    ))}

    <button className="bg-[var(--accent-col)] border-4 p-2" type="button" onClick={()=> setShowComment(!showComment)}>Write a comment</button>


    {showComment && (
        <>
        <textarea className="p-5" name="commentwrite" id="commentoutput" placeholder="Write a comment"></textarea>
        <button className="bg-[var(--accent-col)] border-4 p-2 w-6/12 mx-auto">Publish Comment</button>
        </>
    )}


    </section>

    </main>

    <FooterPage></FooterPage>
    </>
    )
}