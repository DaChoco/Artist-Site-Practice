import { useEffect, useState } from "react";

type countrymap = {
    countrycode: string,
    currency: string,
    symbol: string
}
export function FooterPage(){
    const [countries, setCountries] = useState<Array<countrymap>>()
    useEffect(()=>{
        const handlegetmappings = async ()=>{
            const response = await fetch("../../countrymap.json")
            const data = await response.json()
            console.log(data)
            setCountries(data)
        }

        handlegetmappings()
    },[])

    return (
    <footer className="bg-white dark:bg-black p-5" >

    <div className="flex flex-row">

    <div className="flex flex-col w-[400px]">
            <span>Jacko</span>
            <span className="flex flex-row items-center"><svg className="w-[25px] h-auto fill-slate-800 dark:fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z"/></svg> xxx-024-4013</span>
            <span className="flex flex-row items-center"><svg className="w-[25px] h-auto fill-slate-800 dark:fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg> Nahitisnotme@gmail.com</span>
        </div>

        <div className="currency-select w-[400px]">
            <label htmlFor="currency">Country/Currency</label>
            <select title="currency" name="currency" id="currency" className="w-full">
                {countries?.map((country, index)=>(
                    <option className="text-black" key={index} value={country.currency}>{country.symbol} | {country.countrycode}</option>
                ))}
            </select>
        </div>
    </div>

    <p className="bg-transparent text-stone-400">© Jacko 2025. Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis, omnis.</p>
        
    </footer>)
}