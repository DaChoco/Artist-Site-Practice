export default async function handleRetrieveArtSelected(itemID: string | null | undefined){
    if (!itemID){
        itemID = ""
    }

            try{
                const url = `http://${import.meta.env.VITE_BACKEND_DOMAIN}:8000/api/Products/${itemID}`
                const response = await fetch(url, {method: "GET"})
    
                if (!response.ok){
                    throw new Error("The API fetch request has failed")
                }
    
                const data = await response.json()
                return data
    

                
            }
            catch (error){
                console.log("An error has occured: ", error)
                
            }

            
            
        }
