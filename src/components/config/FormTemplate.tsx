import {Icon, Popup} from "semantic-ui-react";

enum ItemType {
    Title,
    CheckBox,
    Rating,
    Number,
    ShortText,
    LongText
}

enum Status {
    Uploaded,
    Edited,
    Failed
}

class FormTemplate {
    public status:Status;

    constructor(
        public name:string,
        public year:number,
        public items:ConfigItem[]
    ) {
        this.status = Status.Uploaded;
    }

    //Evaluate if the config is legal based on whether it has all unique names
    isLegal() {
        let set =  new Set<String>(this.items.map(e => e.label).filter(e => e !== ""))

        return set.size === this.items.length
    }

    public static fromJson(json:any):FormTemplate {


        return new FormTemplate(
            json.name,
            json.year,
            json.fields.map((e: any) => {
                    let rawDataType = e["data_type"];

                    let useRawDataType = typeof rawDataType === "string"

                    let dataType = useRawDataType ? rawDataType : Object.keys(rawDataType)[0]
                    let min = useRawDataType ? -1 : rawDataType[Object.keys(rawDataType)[0]].min
                    let max = useRawDataType ? -1 : rawDataType[Object.keys(rawDataType)[0]].max

                    return new ConfigItem(dataType, e.name, min, max)
                }
            )
        );
    }

    public generateQRCodeJson():string {
        return `cfg:${this.generateJson()}`
    }

    public generateJson():string {
        return `{"name":"${this.name}","year": ${this.year},"fields": [
            ${this.items.reduce((acc, val) =>
            acc + val.generateJSON() + (this.items.indexOf(val) !== this.items.length-1 ? "," : ""), "")}
                ]}`
    }

    removeItem(item:ConfigItem):FormTemplate {
        this.items = this.items.filter(e => e !== item);
        return Object.create(this)
    }

    setEdited() {
        this.status = Status.Edited
    }

    setErrored() {
        this.status = Status.Failed
    }

    setUploaded() {
        this.status = Status.Uploaded
    }

    getStatusIcon() {
        switch(this.status) {
            case Status.Uploaded:
                return <Popup
                trigger={<Icon name={"checkmark"} color={"green"}/>}
                content={"This template is saved!"}
            />
            case Status.Edited:
                return <Popup
                   trigger={<Icon name={"pencil"}/>}
                   content={"This template has unsaved changes!"}
                />
            case Status.Failed:
                return <Popup
                    trigger={<Icon name={"x"} color={"red"}/>}
                    content={"This template failed to upload!"}
                />
        }
    }

    swap(item:ConfigItem, up:boolean):FormTemplate {

        let index = this.items.indexOf(item)
        let swapIndex = index + (up ? -1 : 1)

        if(swapIndex > 0 && swapIndex < this.items.length) {
            let tmp = this.items[index]
            this.items[index] = this.items[swapIndex]
            this.items[swapIndex] = tmp

        }

        return Object.create(this)
    }

    getNumberInputFields():number {
        return this.items.reduce((acc, ele) => acc + (ele.isInput() ? 1 : 0), 0)
    }

}

class ConfigItem {

    public type: ItemType

    constructor(
        type: string,
        public label: string = "",
        public min: number = -1,
        public max: number = -1
    ) {
        this.setType(type)
    }

    isLegalName(config:FormTemplate) {
        return config.items.filter(e => e.label === this.label).length <= 1 && this.label !== ""
    }

    isNewNameLegal(config:FormTemplate, label:string) {
        return config.items.filter(e => e.label === label).length <= 1
    }

    generateJSON():string {

        //Return a different value if we need a min or max value
        if(this.type === ItemType.Rating) {
            return `{
                "data_type":{"${ItemType[this.type]}": {"min": ${this.min}, "max": ${this.max}}},
                "name":"${this.label}"
            }`
        }

        return `{
            "data_type":"${ItemType[this.type]}",
            "name":"${this.label}"
        }`
    }

    setType(type:string) {
        this.type = ItemType[type as keyof typeof ItemType]
    }

    isInput():boolean {
        return this.type === ItemType.CheckBox ||
                this.type === ItemType.Rating ||
                this.type === ItemType.Number ||
                this.type === ItemType.ShortText ||
                this.type === ItemType.LongText
    }
}

export {
    FormTemplate,
    ConfigItem,
    ItemType
};