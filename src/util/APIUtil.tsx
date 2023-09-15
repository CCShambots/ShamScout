import {GameConfig} from "../components/config/GameConfig";

export let apiHost = "http://localhost:8080/";

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

    console.log(response)
    if(!response.ok) {
        console.log("failure: WOMP WOMP")
        console.log(response.status)
        console.log(response.body)
    }

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

    const response = await fetch(apiHost + "templates/submit", {
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

    const response = await fetch(apiHost + "templates/edit", {
            method: 'PUT',
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

export async function doesTeamHaveImage(teamNum:number) {
    try {
        let response = await fetch(apiHost + "bytes/get")

        let outputString:string[] = await response.json()

        let key = `${teamNum}-img`

    return outputString.includes(key);

    }catch {
        return false
    }
}

export function getImagePath(teamNum:number) {
    return `${apiHost}bytes/get/key/${teamNum}-img`
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