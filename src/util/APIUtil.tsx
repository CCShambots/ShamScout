import {GameConfig} from "../components/config/GameConfig";
import packageJson from "../../package.json";

export let localAPIAddress = "http://localhost:8080/";
export let defaultRemoteAPIAddress = "http://167.71.240.213:8080/";
export let remoteAPIAddress = defaultRemoteAPIAddress;

export let apiHost = localAPIAddress;

export function setApiHost(local:boolean) {
    apiHost = local ? localAPIAddress : remoteAPIAddress
}
export function setApiRemoteHost(newAddress:string) {
    remoteAPIAddress = newAddress
}

let year=  parseInt(packageJson.version.substring(0, 4));

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

export async function Put(endpoint:string, body:string):Promise<boolean> {
    const response = await fetch(apiHost + endpoint, {
            method: 'PUT',
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

export async function RemoveTemplate(templateName:string) {
    const response = await fetch(apiHost + `templates/remove/name/${templateName}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })

    return response.ok;
}

export async function RemoveImage(teamNum:number) {
    const response = await fetch(apiHost + `bytes/remove/key/${teamNum}-img-${year}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })

    return response.ok;
}

export async function RemoveForm(template:string, id:string) {
    const response = await fetch(apiHost + `forms/remove/template/${template}/id/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    })

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

        let key = `${teamNum}-img-${year}`

    return outputString.includes(key);

    }catch {
        return false
    }
}

export function getImagePath(teamNum:number, yearToUse?:string) {
    return `${apiHost}bytes/get/key/${teamNum}-img-${yearToUse ? yearToUse : year}`
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

export type NewReleaseDetails = {
    isNew:boolean,
    value:string,
    body:string
}

export function IsNewRelease(currentVersion:string) {
    try {
        return fetch("https://api.github.com/repos/CCShambots/ShamScout/releases/latest")
            .then(response => {return response.json()})
            .then((json):NewReleaseDetails => {
                return {
                    isNew: (json.name as string).indexOf(currentVersion) === -1,
                    value: json.name,
                    body: json.body
                }
            })
    } catch {
        return new Promise<NewReleaseDetails>((resolve, reject) => {
            resolve({isNew: false, value: currentVersion, body: ""})
        })
    }
}