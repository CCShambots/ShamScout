enum ItemType {
    title="Title",
    checkbox="Checkbox",
    rating="Rating",
    number="Number",
    short_text="Short Text",
    long_text="Long Text"
}

class GameConfig {
    constructor(
        public title:string,
        public year:number,
        public items:ConfigItem[]
    ) {
    }

    public static fromJson(json:any):GameConfig {
        return new GameConfig(
            json.title,
            json.year,
            json.items.map((e:any) =>

                new ConfigItem(e.type, e.label, e.min, e.max)
            )
        )
    }

    public generateJSON():string {
        return `cfg:{"title": "${this.title}", "year": ${this.year}, "items": [
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
        return `{
            "type": "${this.type.toLowerCase().replace(" ", "_")}",
            "label": "${this.label}"
            ${this.min !== -1 ? `, "min": ${this.min}` : ``}
            ${this.max !== -1 ? `, "max": ${this.max}`: ``}
        }`
    }

    setType(type:string) {
        this.type = ItemType[type as keyof typeof ItemType]
    }

    isInput():boolean {
        return this.type === ItemType.checkbox ||
                this.type === ItemType.rating ||
                this.type === ItemType.number ||
                this.type === ItemType.short_text ||
                this.type === ItemType.long_text
    }
}

export {
    GameConfig,
    ConfigItem,
    ItemType
};