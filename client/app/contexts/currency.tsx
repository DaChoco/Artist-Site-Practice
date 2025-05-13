//this context handles which currency has been selected
import React, { useContext, createContext, useState, useEffect } from "react";

import Item from "~/routes/item";
import findCountry from "~/helpers/findLocale";


type countryDropdownTyping = {
    url: string
    name: string
}

type statesType = {
    url: string
    name: string

}

type CountryData = {
  name: string;
  currency: string;
  countrycode: string;
  symbol: string;
  url: string;
  states: Array<statesType>
};

type currencyContextType = {
    currentCurrency: string,
    setCurrentCurrency: React.Dispatch<React.SetStateAction<string>>,
    countryCode: string,
    setCountryCode: React.Dispatch<React.SetStateAction<string>>,
    currencySymbol: string,
    setCurrencySymbol: React.Dispatch<React.SetStateAction<string>>,
    countrydropdown: countryDropdownTyping[],
    setCountrydropdown: React.Dispatch<React.SetStateAction<countryDropdownTyping[]>>,
}


export const currencyContext = createContext<currencyContextType| undefined>(undefined)

export default function CurrencySelector({children}: {children: React.ReactNode}){
    const [currentCurrency, setCurrentCurrency] = useState<string>("ZAR")
    const [countryCode, setCountryCode] = useState<string>("ZA")
    const [currencySymbol, setCurrencySymbol] = useState<string>("R")
    const [countrydropdown, setCountrydropdown] = useState<countryDropdownTyping[]>([])

    useEffect(()=>{
        const handlesetDefaultCurrency = async ()=>{
            const response = await fetch("../../countrymap.json")
            const data: CountryData[] = await response.json()
            console.log("Currency Context: ", data)

            let arrDropData = []
            for (let i = 0; i<data.length; i++){
                arrDropData.push({name: data[i].name, url: data[i].url})
                if (data[i].name === "European Union"){
                    for (let j = 0; j<data[i].states.length; j++){
                        arrDropData.push({name: data[i].states[j]["name"], url: data[i].states[j]["url"]})
                    }
                
            }
            }
            console.log("DROPDOWN: ", arrDropData)
            setCountrydropdown(arrDropData)

            const userCountry: string = await findCountry()

            console.log("User Country: ", userCountry)

            function handleSetStates(num: number){
                setCurrentCurrency(data[num].currency)
                setCountryCode(data[num].countrycode)
                setCurrencySymbol(data[num].symbol)
                console.log(data[num].symbol)

            }

            if (userCountry === "South Africa" || 
                (data.findIndex((item) => item.name === userCountry) === -1 && !["France", "Spain", "Germany", "Italy", "Portugal", "Ireland"].includes(userCountry)) 
                || !userCountry ){
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
        <currencyContext.Provider value={{currentCurrency, setCurrentCurrency, countryCode, setCountryCode, currencySymbol, setCurrencySymbol, countrydropdown, setCountrydropdown}}>
            {children}
        </currencyContext.Provider>
    )
}

export function useCurrencyContext(){
    const context = useContext(currencyContext)

    if (!context){
        throw new Error("Currency context not found")
    }

    return context
}
