//this context handles which currency has been selected
import React, { useContext, createContext, useState, useEffect } from "react";

type currencyContextType = {
    currentCurrency: string,
    setCurrentCurrency: React.Dispatch<React.SetStateAction<string>>,
    countryCode: string,
    setCountryCode: React.Dispatch<React.SetStateAction<string>>,
    currencySymbol: string,
    setCurrencySymbol: React.Dispatch<React.SetStateAction<string>>
}
export const currencyContext = createContext<currencyContextType| undefined>(undefined)

export default function CurrencySelector({children}: {children: React.ReactNode}){
    const [currentCurrency, setCurrentCurrency] = useState<string>("ZAR")
    const [countryCode, setCountryCode] = useState<string>("ZA")
    const [currencySymbol, setCurrencySymbol] = useState<string>("R")

    useEffect(()=>{
        const handlesetDefaultCurrency = async ()=>{
            const response = await fetch("../../countrymap.json")
            const data = await response.json()
            console.log("Currency Context: ", data)
            setCurrentCurrency(data[0].currency)
            setCountryCode(data[0].countrycode)
            setCurrencySymbol(data[0].symbol)
            
            
        }

        handlesetDefaultCurrency()
    },[])

    return(
        <currencyContext.Provider value={{currentCurrency, setCurrentCurrency, countryCode, setCountryCode, currencySymbol, setCurrencySymbol}}>
            {children}
        </currencyContext.Provider>
    )
}
