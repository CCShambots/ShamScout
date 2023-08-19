enum ItemType {
    Title,
    CheckBox,
    Rating,
    Number,
    short_text,
    long_text
}

class GameConfig {
    constructor(
        public name:string,
        public year:number,
        public items:ConfigItem[]
    ) {
    }

    public static fromJson(json:any):GameConfig {


        return new GameConfig(
            json.name,
            json.year,
            json.fields.map((e:any) => {
                let rawDataType = e["data_type"];

                let useRawDataType = typeof rawDataType === "string"

                let dataType = useRawDataType ? rawDataType : Object.keys(rawDataType)[0]
                let min = useRawDataType ? -1 : rawDataType[Object.keys(rawDataType)[0]].min
                let max = useRawDataType ? -1 : rawDataType[Object.keys(rawDataType)[0]].max

                return new ConfigItem(dataType, e.name, min, max)
            }

            )
        )
    }

    public generateJSON():string {
        return `cfg:{"name":"${this.name}","year": ${this.year},"fields": [
            ${this.items.reduce((acc, val) => 
                    acc + val.generateJSON() + (this.items.indexOf(val) !== this.items.length-1 ? "," : ""), "")}
                ]}`
    }

    removeItem(item:ConfigItem):GameConfig {
        this.items = this.items.filter(e => e !== item);

        return Object.create(this)
    }

    swap(item:ConfigItem, up:boolean):GameConfig {

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

    generateJSON():string {

        //Return a different value if we need a min or max value
        if(this.type === ItemType.Rating) {
            return `{
                "data_type":{"${ItemType[this.type]}": {"min": ${this.min}, "max": ${this.max}}},
                "name":"${this.label}"
            }`
        }

        return `{
            "data_type":"${ItemType[this.type].replace(" ", "_")}",
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
                this.type === ItemType.short_text ||
                this.type === ItemType.long_text
    }
}

export {
    GameConfig,
    ConfigItem,
    ItemType
};