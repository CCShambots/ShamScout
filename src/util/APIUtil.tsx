
export function Pull(api:string, endpoint:string, callback:(e:any) => void) {
    try {
        fetch(api + "/" + endpoint)
            .then(response => { return response.json()})
            .then(callback)
            .catch(() => {})
    }catch (e) {}
}