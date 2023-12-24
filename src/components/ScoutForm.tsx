import Match from "./scheduling/matchDisplay/Match";
import {Schedule} from "./scheduling/matchDisplay/ScheduleData";

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

    public static getMissingMatches(matches:Match[], forms:ScoutForm[], schedule:Schedule):MissingMatch[] {
        let missingArr:MissingMatch[] = []

        matches.forEach(e => {

            let teamNumbers = ScoutForm.getTeamNumbers(e)

            teamNumbers.forEach(teamNum => {
                    let missing = ScoutForm.isMissing(teamNum, e.match_number, forms)

                //TODO: Make schedule 1-indexed instead of zero indexed
                let scoutName = schedule.shifts
                    .map((shift) => shift.includes(e.match_number-1, teamNumbers.indexOf(teamNum))) //get information about whether something is active for a given shift
                    .filter(e => e.active)[0]?.scouter.name ?? "Someone"

                    if (missing) missingArr.push(new MissingMatch(e.match_number, teamNum, scoutName))
                })
            }
        )

        return missingArr
    }

    public static getTeamNumbers(match:Match):number[] {
        return [
            match.red1,
            match.red2,
            match.red3,
            match.blue1,
            match.blue2,
            match.blue3,
        ]
    }

    public static isMissing(teamNum:number, matchNum:number, forms:ScoutForm[]):boolean {

       return forms.filter(e => e.match_number === matchNum && e.team === teamNum).length === 0
            && forms.filter(e => e.match_number > matchNum + 1).length > 0
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

    public toString() {
        return `${this.scouter}${this.team}${this.match_number}${this.event}`
    }

    public generateHeader():HeaderType[] {

        return [
            {label: "Team", key: "team"},
            {label: "Match", key: "match_number"},
            {label: "Event", key: "event"},
            {label: "Scouter", key: "scouter"},
            ...this.fields.map(e =>
                {
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
        public ShortText:string,
        public LongText:string
    ) {
        this.value = this.getValue()
    }

    public getValue() {
        switch(this.type) {
            case "Title": return this.Title
            case "CheckBox": return this.CheckBox
            case "Rating": return this.Rating
            case "Number": return this.Number
            case "ShortText": return this.ShortText
            case "LongText": return this.LongText
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
            data["ShortText"] ?? "",
            data["LongText"] ?? "",
        )
    }
}

class MissingMatch {
    constructor(
        public matchNum:number,
        public teamNum:number,
        public scouter:string
    ) {
    }
}

export {ScoutForm, MissingMatch}
