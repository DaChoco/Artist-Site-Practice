export default async function findCountry(){
    const url = "http://ip-api.com/json/"
    const response = await fetch(url)
    const data = await response.json()

    return data["country"]

}