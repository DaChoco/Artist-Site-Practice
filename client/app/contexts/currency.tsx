//this context handles which currency has been selected
import React, { useContext, createContext, useState, useEffect } from "react";

import Item from "~/routes/item";
import findCountry from "~/helpers/findLocale";

type currencyContextType = {
    currentCurrency: string,
    setCurrentCurrency: React.Dispatch<React.SetStateAction<string>>,
    countryCode: string,
    setCountryCode: React.Dispatch<React.SetStateAction<string>>,
    currencySymbol: string,
    setCurrencySymbol: React.Dispatch<React.SetStateAction<string>>
}

type CountryData = {
  name: string;
  currency: string;
  countrycode: string;
  symbol: string;
};
export const currencyContext = createContext<currencyContextType| undefined>(undefined)

export default function CurrencySelector({children}: {children: React.ReactNode}){
    const [currentCurrency, setCurrentCurrency] = useState<string>("ZAR")
    const [countryCode, setCountryCode] = useState<string>("ZA")
    const [currencySymbol, setCurrencySymbol] = useState<string>("R")

    useEffect(()=>{
        const handlesetDefaultCurrency = async ()=>{
            const response = await fetch("../../countrymap.json")
            const data: CountryData[] = await response.json()
            console.log("Currency Context: ", data)

            const userCountry: string = await findCountry()

            console.log("User Country: ", userCountry)

            function handleSetStates(num: number){
                setCurrentCurrency(data[num].currency)
                setCountryCode(data[num].countrycode)
                setCurrencySymbol(data[num].symbol)

            }

            if (userCountry === "South Africa" || data.findIndex((item) => {item.name === userCountry}) === -1 || !userCountry ){
                handleSetStates(0)
                return
            }
            else if (userCountry === "United States of America" || userCountry === "United States"){
                handleSetStates(1)
                return

            }
            else if (userCountry === "United Kingdom"){
                handleSetStates(2)
                return
            }
            else if (["France", "Spain", "Germany", "Italy", "Portugal", "Ireland"].includes(userCountry)){
                handleSetStates(3)
                return
            
            }
            else if (userCountry === "Japan"){
                handleSetStates(4)
                return
            }
            
            
            
        }

        handlesetDefaultCurrency()
    },[])

    return(
        <currencyContext.Provider value={{currentCurrency, setCurrentCurrency, countryCode, setCountryCode, currencySymbol, setCurrencySymbol}}>
            {children}
        </currencyContext.Provider>
    )
}
