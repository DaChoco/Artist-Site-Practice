export default async function findCountry(): Promise<string>{
    const default_country = localStorage.getItem("user-country")

    if (!default_country){
    const url = "http://ip-api.com/json/"
    const response = await fetch(url)
    const data = await response.json()

    localStorage.setItem("user-country", data["country"])

    return data["country"]
    }
    else{
        return default_country
    }
    

}