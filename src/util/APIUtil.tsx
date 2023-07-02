import {useLocalStorage} from "usehooks-ts";
import {isRouteErrorResponse} from "react-router-dom";


let apiHost = "http://localhost:8080/";

export async function Pull(endpoint:string, callback:(e:any) => void):Promise<void> {
    try {
        await fetch(apiHost + endpoint)
            .then(response => { return response.json()})
            .then(callback)
            .catch(() => {})
    }catch (e) {
    }
}

export async function Post(endpoint:string, body:string):Promise<boolean> {
    const response = await fetch(apiHost + endpoint, {
        method: 'POST',
        body: body,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        }
        }
    )

    return response.ok;
}

export function PullTBA(endpoint:string, callback:(e:any) => void) {

    const key:string = localStorage.getItem("tba-key") || "none";

    let apiOptions = {
        "method" : "GET",
        "headers" : {
            "X-TBA-Auth-Key" : key.substring(1, key.length-1)
        }
    };

    try {
        fetch("https://www.thebluealliance.com/api/v3/" + endpoint, apiOptions)
            .then(response => {return response.json()})
            .then(callback)
            .catch(() => {})

    } catch (e) {}
}