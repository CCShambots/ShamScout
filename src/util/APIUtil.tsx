import {FormTemplate} from "../components/config/FormTemplate";
import packageJson from "../../package.json";
import {ScoutForm} from "../components/ScoutForm";
import axios from "axios";
import {byteAgeEndpoint, bytesList, formDetails, templateCreateEdit, templateDetails} from "./APIConstants";
import {JWT} from "./LocalStorageConstants";

export let localAPIAddress = "https://localhost:8080/";
export let defaultRemoteAPIAddress = "https://scout.voth.name:3000/protected/";
export let remoteAPIAddress = defaultRemoteAPIAddress;

export let apiHost = localAPIAddress;

export let jwt = (localStorage.getItem(JWT) || "").replaceAll('"', "");

let axiosHeaders = {
    headers: {
        'Authorization': jwt,
        'Content-Type': 'application/json',
    },
    withCredentials: false
}


export function updateJWTValue(newJWT:string) {
    jwt = newJWT;

    axiosHeaders = {
        headers: {
            'Authorization': jwt,
            'Content-Type': 'application/json',
        },
        withCredentials: false
    }
}


export function setApiHost(local:boolean) {
    apiHost = local ? localAPIAddress : remoteAPIAddress
}
export function setApiRemoteHost(newAddress:string) {
    remoteAPIAddress = newAddress
}

let year=  parseInt(packageJson.version.substring(0, 4));

export function CheckJWT() {
    //Post to the API without the end / at protected
    return axios.get(apiHost.substring(0, apiHost.length-1), axiosHeaders)
    .then((res) => {
        return res.status
    }).catch((e) => {
        //Likely means there's no connection at all?
        return 408
    })
}

export function Authorize(code:string, email:string) {
    let baseURL = apiHost.replace("protected/", "")
    return fetch(`${baseURL}auth/${code}/${email}`, {
        method: 'GET',
    })
        .then(response => response.text())
}

export async function Pull(endpoint:string, callback:(e:any) => void):Promise<void> {

    try {
        await axios.get(apiHost + endpoint, axiosHeaders)
            .then(response => { return response.data})
            .then(callback)
            .catch(() => {})
    }catch (e) {
        console.log(e)
        console.log(endpoint)
    }
}

export async function Post(endpoint:string, body:string):Promise<boolean> {
    const response = await axios.post(apiHost + endpoint, body, axiosHeaders)

    console.log(response)
    if(response.status !== 200) {
        console.log("failure: WOMP WOMP")
        console.log(response.status)
        console.log(response.data)
    }

    return response.status === 200;
}

export async function Patch(endpoint:string, body:string):Promise<boolean> {
    try {
        const response = await axios.patch(apiHost + endpoint, body, axiosHeaders)

        if(response.status !== 200) {
            console.log("failure: WOMP WOMP")
            console.log(response.status)
            console.log(response.data)
        }

        return response.status === 200;

    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function AddTemplate(config:FormTemplate) {

    try {
        const response =
            await axios.post(apiHost + templateCreateEdit, config.generateJson(), axiosHeaders)

        return response.status === 200;

    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function ModifyTemplate(config:FormTemplate) {
    try {
        const response =
            await axios.patch(apiHost + templateCreateEdit, config.generateJson(), axiosHeaders)

        return response.status === 200;

    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function RemoveTemplate(templateName:string) {
    try {
        const response = await axios.delete(apiHost + templateDetails(templateName), axiosHeaders)

        return response.status === 200;

    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function RemoveImage(teamNum:number, yearToUse?:string) {
    try {
        const response = await axios.delete(getImagePath(teamNum, yearToUse), axiosHeaders)

        return response.status === 200;

    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function RemoveForm(template:string, id:string) {
    try {
        const response = await axios.delete(apiHost + formDetails(template, id), axiosHeaders)

        return response.status === 200;

    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function EditForm(template:string, id:string, form:ScoutForm) {

    console.log(template)
    console.log(id)
    console.log(form.toJson())

    try {
        const response = await axios.patch(apiHost + formDetails(template, id), form.toJson(), axiosHeaders)

        return response.status === 200

    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function doesTeamHaveImage(teamNum:number, yearToUse?:string) {
    try {
        let response = await axios.get(apiHost + bytesList, axiosHeaders)

        let outputString:string[] = await response.data

        let key = `${teamNum}-img-${yearToUse ?? year}`

        return outputString.includes(key);

    }catch {
        return false
    }
}

export async function getImage(teamNum:number, yearToUse?:string) {
    const src = getImagePath(teamNum, yearToUse);

    return fetch(src, axiosHeaders)
        .then(res => res.blob())
        .then(blob => {
            return URL.createObjectURL(blob);
        }).catch(e => {
            console.log(e)
            return ""
        })
    ;
}

export async function getAgeOfImage(teamNum:number, year:string) {

    return axios.get(apiHost + byteAgeEndpoint(`${teamNum}-img-${year}`), axiosHeaders).then(res => {
        return res.data as number
    }).catch(e => {
        return Math.random() * 7
    })
}

export function getImagePath(teamNum:number, yearToUse?:string) {
    return `${apiHost}bytes/${teamNum}-img-${yearToUse ? yearToUse : year}`
}

//TBA Pulling
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


//Updating from GitHub

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