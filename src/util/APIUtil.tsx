
export async function Pull(endpoint:string, callback:(e:any) => void):Promise<void> {
    try {
        await fetch("http://localhost:8080/" + endpoint)
            .then(response => { return response.json()})
            .then(callback)
            .catch(() => {})
    }catch (e) {
    }
}