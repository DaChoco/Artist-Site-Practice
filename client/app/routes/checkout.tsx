import Navbar from "~/components/navbar";
import { FooterPage } from "~/components/footer";
import { useCartContext } from "~/contexts/cart";
import UserCartService from "~/helpers/cartHandle";
import { useCurrencyContext } from "~/contexts/currency";
import { useLoadingContext } from "~/contexts/loading";
import { useEffect, useState, useRef } from "react";
import ConvertCurrency from "~/helpers/convert";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
    const { currentCart, setCurrentCart } = useCartContext()
    const { currentCurrency, setCurrentCurrency, countryCode, setCountryCode, currencySymbol, setCurrencySymbol, countrydropdown } = useCurrencyContext()
    const [totalPrice, setTotalPrice] = useState<number>(0)
    const [showcountrydropdown, setShowcountrydropdown] = useState<boolean>(false)
    const [country, setCountry] = useState<string>("")
    const [tax, setTax] = useState<number>(1.15)
    const [days, setDays] = useState<string>("3 Days")
    const [arrofquantities, setArrofquantities] = useState<Array<number>>([])

    const { loading, setLoading } = useLoadingContext()


    useEffect(() => {
        //retrieve carts
        const handleRetrieveCart = async () => {
            const cart = new UserCartService(`http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api`, "681a59494d22f6c4e0b5d1e6")
            const output = await cart.getCart()
            console.log(output)
            setCurrentCart(output)

            let quantities = output.map((item) => item.stock)
            setArrofquantities(quantities)
        }

        handleRetrieveCart()
    }, [currentCurrency])

    function sumPrices(): number {

        if (!currentCart) {
            return 0
        }
        let pricesResult: number = 0;
        for (let i = 0; i < currentCart.length; i++) {
            let currentValue = currentCart[i].price
            pricesResult += currentValue * arrofquantities[i]

        }



        return pricesResult
    }

    useEffect(() => {
        const retrieveConvertedValues = async () => {

            const data = await ConvertCurrency(sumPrices(), currentCurrency)
            if (data) {
                if (currentCurrency === "JPY") {
                    setTotalPrice(Math.floor(Number(data)))
                }
                setTotalPrice(Number(data))
            }

        }

        retrieveConvertedValues()
    }, [currentCurrency, currentCart, arrofquantities])


    useEffect(() => {
        if (country.toLowerCase() === "Japan".toLowerCase()) {
            setTax(1.25)
            setDays("7 Business Days")
        }
        else if (["France", "Spain", "Germany", "Italy", "Portugal", "Ireland"].includes(country)) {
            setTax(1.17)
            setDays("3 Business Days")
        }
        else if (country.toLowerCase() === "United Kingdom".toLowerCase() || country.toLowerCase() === "UK".toLowerCase()) {
            setTax(1.15)
            setDays("2 Business Days")
        }
        else if (country.toLowerCase() === "United States of America".toLowerCase() || country.toLowerCase() === "USA".toLowerCase()) {
            setTax(1.8)
            setDays("15 Business Days")
        }
        else if (!country) {
            setTax(1.15)
            setDays("At least 16 Business Days")
        }
        else if (["China", "Australia", "Brazil", "New Zealand"].includes(country)) {
            setTax(1.6)
            setDays("9 Business Days")
        }

    }, [country])

    function numtoPercentage() {
        let remainder = tax - 1;
        let roundeddown = remainder.toFixed(2)

        const onlypercent = roundeddown.substring(2, roundeddown.length)
        return onlypercent

    }

    const handleStripePayment = async () => {
        setLoading(true)
        let desc
        if (!currentCart || !currentCurrency) {
            return
        }
        else if (currentCart.length > 2 && currentCart.length > 0) {
            desc = "Mutiple art prints and merchandise ordered from the Artist Site"
        }
        else if (currentCart.length === 1) {
            desc = "An Art Print/Merch ordered from the Artist Site"
        }

        const databody = {
            cart: currentCart,
            description: desc,
            currency: currentCurrency,
            quantity: 1,
            amount: totalPrice
        }
        try {
            const response = await fetch(
                `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/payments/Stripe/${'681a59494d22f6c4e0b5d1e6'}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(databody)
                });
            if (!response.ok) {
                setLoading(false)
                throw new Error("The response has failed from either the server or stripe")
            }
            const data = await response.json()
            setLoading(false)
            window.location.href = data.url
        }
        catch (error) {

            console.log("Everything failed")
            console.log(error)
        }
        finally {
            setLoading(false)
        }

    }






    return (

        <>

            <Navbar></Navbar>

            <div id="loading-wrapper">
                {loading && <div className="loading-circle"></div>}
            </div>

            <main className=" grid grid-cols-[55%_45%]">

                <div className="enterInfo p-5">
                    <h2 className="text-3xl">How would you like to get your order?</h2>

                    <form className="children-padding">

                        <div className="flex flex-col">
                            <label htmlFor="nameinput" className="text-sm">Enter name:</label>
                            <input className="outline-none border-2 border-current p-2" type="text" id="nameinput" />
                        </div>

                        <div className="countrylocale flex flex-col relative">
                            <label htmlFor="countryselect">Country</label>

                            <div className="border-2 border-current p-2 flex flex-row justify-between">

                                <input value={country} onChange={(e) => { setCountry(e.target.value) }} type="text" id="countryselect" className="outline-none w-[90%]" />
                                <svg onClick={() => setShowcountrydropdown(!showcountrydropdown)} className="fill-current w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" /></svg>

                                {countrydropdown.length && showcountrydropdown === true && (

                                    <ul className="absolute top-full left-0 w-full children-padding small z-50">
                                        {countrydropdown.map((country, index) => (<li className="dark:bg-[var(--dark-background-col)] dark:border-2 border-[var(--accent-col)] dark:text-[var(--accent-col)] bg-white flex flex-row space-x-5" key={index}><img className="w-5 h-5" src={country.url} alt="country-icon" /><p>{country.name}</p></li>))}


                                    </ul>
                                )
                                }
                            </div>
                        </div>

                        <div className="flex flex-row space-x-3 flex-wrap justify-between ">
                            <div className="flex flex-col max-w-[40%]">
                                <label htmlFor="street" className="text-sm">Street Address</label>
                                <input className="outline-none border-2 border-current p-2" type="text" id="street" />
                            </div>

                            <div className="flex flex-col max-w-[30%]">
                                <label htmlFor="city" className="text-sm">Town / City</label>
                                <input className="outline-none border-2 border-current p-2" type="text" id="city" />
                            </div>

                            <div className="flex flex-col max-w-[30%]">
                                <label htmlFor="state" className="text-sm whitespace-nowrap">State / Province</label>
                                <input className="outline-none border-2 border-current p-2" type="text" id="state" />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="postcode">Postcode</label>
                            <input className="outline-none border-2 border-current p-2" type="text" id="postcode" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="email">Email Address</label>
                            <input type="text" id="email" className="outline-none border-2 border-current p-2" />
                        </div>



                    </form>
                </div>
                {currentCart?.length > 0 && (
                    <div className="cartReview p-5">
                        <h2 className="text-3xl">Review your cart ({currentCart.length} items)</h2>
                        <ul>
                            {currentCart.map((cartitem, index) => (
                                <li key={index}>
                                    <div className="grid grid-cols-[150px_300px] grid-rows-1 p-5">

                                        <img id="left-grid-1" src={cartitem?.url} className="h-auto mx-auto" alt="Something is going wrong" />

                                        <div className="p-5">
                                            <p className="font-semibold font-['Inter']">{cartitem?.title}</p>
                                            <p>Quantity: {cartitem?.stock}</p>
                                            <p>{currencySymbol} {cartitem?.price} x {cartitem?.stock}</p>

                                            <div className="inputquant p-2 outline-none border-1 border-current flex flex-row justify-between ">
                                                <p className="text-xl">-</p>
                                                <input type="text" className="outline-none" placeholder={`${cartitem?.stock}`} />
                                                <p className="text-xl">+</p>
                                            </div>

                                        </div>
                                    </div>
                                </li>
                            ))}




                        </ul>

                        <p className="not-log-in text-center pt-2 pb-2 border-2 border-[var(--accent-col)] my-2">Don't miss out? Logging in can save your delivery address!</p>


                        <div className="final-costs space-y-2">
                            <span className="flex flex-row justify-between text-2xl"><h5>Subtotal:</h5> <p>{currencySymbol} {totalPrice.toFixed(2)}</p></span>
                            <span className="flex flex-row justify-between text-2xl"><h5>Taxes:</h5> <p>{numtoPercentage()}%</p></span>
                            <span className="flex flex-row justify-between text-2xl"><h5>Shipping:</h5> <p>{days}</p></span>
                            <span className="flex flex-row justify-between text-2xl"><h5>Total:</h5> <p>{currencySymbol} {(totalPrice * tax).toFixed(2)}</p></span>
                        </div>

                        <button className="bg-purple-600 hover:bg-purple-700 transition-[0.5s] mb-2 w-full text-white p-3" type="button" onClick={handleStripePayment}>Checkout with Stripe</button>
                        <div className="paypal-buttons-container">
                        <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_CLIENT_ID}}>
                            <PayPalButtons style={{ layout: "horizontal", shape: "rect"}} createOrder={(_, actions) => {
                                return actions.order.create({intent: "CAPTURE",
                                    purchase_units: [
                                        {
                                        amount: {
                                                value: String(totalPrice),
                                                currency_code: currencySymbol,
                                            },
                                            
                                        },
                                    ],
                                });
                            }} />
                        </PayPalScriptProvider>
                        </div>
                    </div>
                )}

            </main>
            <FooterPage></FooterPage>
        </>
    )

}