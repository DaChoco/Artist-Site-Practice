
//Leaving it commented out so I can choose which external API to use

export default async function ConvertCurrency(value: number, currency: string):Promise<number | undefined>{
 
try{
    //const url =`${import.meta.env.VITE_BASE_CURRENCY_URL}/fetch-one?from=ZAR&to=${currency}&api_key=${import.meta.env.VITE_CURRENCY_API_KEY}`
    if (currency === "ZAR"){
        //every thing is priced in ZAR in the db, so lets be economical with API calls
        return Math.round((value*100)/100)
    }
    const url = `${import.meta.env.VITE_OTHER_BASE_URL}/${currency}`
    console.log(url)
    const response = await fetch(url)
    if (!response.ok){
        console.warn("Request is having an issue:")
        //we are going to fool proof, so if the api fails, we just return the value we got and don't convert anything
        return value
    }

    const data = await response.json()

    console.log(data)
    //const currency_ratio = data["result"][currency]
    const currency_ratio = data["conversion_rate"]
    //every thing starts from being priced in ZAR
    const result = currency_ratio * value


    return result
}
catch (error){
    console.log("Error:", error)
}
    

}