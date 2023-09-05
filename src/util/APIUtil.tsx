import {GameConfig} from "../components/config/GameConfig";

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

export async function RemoveTemplate(templateName:string) {
    const response = await fetch(apiHost + `template/delete/${templateName}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })

    return response.ok;
}

export async function AddTemplate(config:GameConfig) {

    const response = await fetch(apiHost + "template/add", {
            method: 'POST',
            body: config.generateJson(),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }
        }
    )

    return response.ok;
}

export async function ModifyTemplate(config:GameConfig) {

    const response = await fetch(apiHost + "template/modify", {
            method: 'POST',
            body: config.generateJson(),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            }
        }
    )

    return response.ok;
}

export async function IsApiAlive() {

    try {
        const response = await fetch(apiHost + "status")

        return response.ok;

    } catch {
        return false
    }
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