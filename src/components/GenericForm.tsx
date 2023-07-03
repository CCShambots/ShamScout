export default class GenericForm {
    constructor(
        public scouter:string,
        public team:number,
        public match_number:number,
        public event:string
    ) {
    }

    public static fromJson(data:any):GenericForm {
        return new GenericForm(
            data.scouter,
            data.team,
            data.match_number,
            data.event_key
        )
    }

    public static getDisplayNameForPopup(forms:GenericForm[]):string {

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