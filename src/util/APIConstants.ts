
//Templates stuff
export let templatesList = "templates/"
export let templateCreateEdit = "template/"
export let templateDetails = (id:string) => `template/${id}`


//Bytes
export let bytesList = "bytes/"
export let byteDetails = (id:string) => `byte/${id}`

//Forms
export let formsList = (template:string) => `forms/${template}/`
export let formCreate = (template:string) => `form/${template}/`
export let formDetails = (template:string, id:string) => `form/${template}/${id}`
export let editFormPath = (template:string, id:string) => `${formDetails(template, id)}/edit`

//Schedules
export let schedulesList = "schedules/"
export let scheduleCreateEdit = "schedule/"
export let scheduleDetails = (event:string) => `schedule/${event}`