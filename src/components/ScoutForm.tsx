
type HeaderType = {
    label: string,
    key: string
}

class ScoutForm {
    constructor(
        public scouter:string,
        public team:number,
        public match_number:number,
        public event:string,
        public fields:Field[]
    ) {
    }

    public static fromJson(data:any):ScoutForm {
        return new ScoutForm(
            data.scouter,
            data.team,
            data.match_number,
            data.event_key,
            Object.keys(data.fields).map(e => Field.fromJson(e, data.fields[e]))
        )
    }

    public generateHeader():HeaderType[] {

        return [
            {label: "Team", key: "team"},
            {label: "Match", key: "match_number"},
            {label: "Event", key: "event"},
            {label: "Scouter", key: "scouter"},
            ...this.fields.map(e =>
                {
                    console.log(this.fields[this.fields.indexOf(e)].value)
                    return {label: e.label, key: `fields[${this.fields.indexOf(e)}].value`}
                }
            )
        ]
    }

    public getData() {
        return {
            team: this.team,
            match_number: this.match_number,
            event: this.event,
            scouter: this.scouter,
        }
    }

    public static getDisplayNameForPopup(forms:ScoutForm[]):string {

        type output = {
            name:string,
            multiples:number
        }

        let results:output[] = []

        forms.forEach(e => {
            let filterForName = results.filter(ele => ele.name === e.scouter)

            if(filterForName.length > 0) {
                filterForName[0].multiples += 1
            } else {
                results.push({name:e.scouter, multiples: 1})
            }

        })

        return results.reduce((acc, ele) => {
            let shouldComma = results.indexOf(ele) !== results.length - 1

            return acc + ele.name + (ele.multiples > 1 ? " (x" + ele.multiples + ")" : "") + (shouldComma ? ", " : "")
        }, "")
    }
}

class Field {

    public value;
    constructor(
        public label:string,

        public type:string,

        public Title:string,
        public CheckBox:boolean,
        public Rating:number,
        public Number:number,
        public short_text:string,
        public long_text:string
    ) {
        this.value = this.getValue()
    }

    public getValue() {
        switch(this.type) {
            case "Title": return this.Title
            case "CheckBox": return this.CheckBox
            case "Rating": return this.Rating
            case "Number": return this.Number
            case "short_text": return this.short_text
            case "long_text": return this.long_text
            default: return "Failed to Load"
        }
    }

    public static fromJson(key:string, data:any):Field {
        return new Field(
            key,
            Object.keys(data)[0],
            data.Title ?? "",
            data.CheckBox ?? false,
            data.Rating ?? 0,
            data.Number ?? 0,
            data["short_text"] ?? "",
            data["long_text"] ?? "",
        )
    }
}

export {ScoutForm}