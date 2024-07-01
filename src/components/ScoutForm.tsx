import Match from "./scheduling/matchDisplay/Match";
import {Schedule} from "./scheduling/matchDisplay/ScheduleData";
import {Checkbox, Header, Input, Popup, Table} from "semantic-ui-react";
import "./ScoutForm.css"
import React, {useEffect, useState} from "react";

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

    public toElement(label:string, setForm:(ScoutForm:ScoutForm) => void) {
        let field = this.fields.filter(e => e.label === label)[0]

        switch(field.type) {
            case "CheckBox": return <CheckBoxElement label={label} form={this} setForm={setForm}/>
            case "Rating": return <RatingElement label={label} form={this} setForm={setForm}/>
            case "Number": return <NumberElement label={label} form={this} setForm={setForm}/>
            case "ShortText": return <ShortTextElement label={label} form={this} setForm={setForm}/>
            default: return <Header>Error!</Header>
        }
    }

    public setFields(fields:Field[]) {
        this.fields = fields
    }

    public toJson() {

        let temp = "{" +
            `"match_number":${this.match_number},` +
            `"team":${this.team},` +
            `"scouter":"${this.scouter}",` +
            `"event_key":"${this.event}",` +
            `"fields":{${this.fields.map(e => e.toJson())}}}`

        // temp = temp.substring(0, temp.length - 1)+ '}}';

        return temp

    }

    public static takeAverages(forms:ScoutForm[]):CombinedForm[] {
        let byTeam:Map<number, ScoutForm[]> = new Map();

        forms.forEach(e => {
            if(byTeam.has(e.team)) {
                byTeam.get(e.team)?.push(e)
            } else {
                byTeam.set(e.team, [e])
            }
        })

        let values:CombinedForm[] = [];

        byTeam.forEach(e => {
            let theseFields:CombinedField[] = [];

            e[0]?.fields.map(field => {
                let result =  e.map(e => e.fields.filter(ele => ele.label === field.label)[0]);

                let [value, percent] = Field.takeAverage(result)

                theseFields.push(new CombinedField(field.label, value))

            })

            values.push(new CombinedForm(e[0]?.team, e.length, theseFields))
        })

        return values;

    }

}

export class CombinedForm {
    constructor(
        public team:number,
        public number_of_matches:number,
        public fields:CombinedField[]
    ) {
    }

    public generateHeader():HeaderType[] {

        return [
            {label: "Team", key: "team"},
            {label: "Matches Recorded", key: "number_of_matches"},
            ...this.fields.map(e =>
                {
                    return {label: e.label, key: `fields[${this.fields.indexOf(e)}].value`}
                }
            )
        ]
    }
}

class CombinedField {
    constructor(
        public label:string,
        public value:number
    ) {
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

    public setValue(value:any) {
        switch(this.type) {
            case "Title": this.Title = value; break;
            case "CheckBox": this.CheckBox = value; break;
            case "Rating": this.Rating = value; break;
            case "Number": this.Number = value; break;
            case "ShortText": this.ShortText = value; break;
            case "LongText": this.LongText = value; break;
        }

        this.value = this.getValue();
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

    public toJson() {
        let useQuotes = this.type === "Title" || this.type === "ShortText" || this.type === "LongText"
        let valueDisplay = useQuotes ? `"${this.value}"` : this.value

        return `"${this.label}":{"${this.type}":${valueDisplay}}`
    }

    public static takeAverage(result:Field[]): [value:number, percent:boolean] {

        let resultantVal = 0
        let percent = false

        switch (result[0].type) {
            case "CheckBox":
                //Calculate a percentage
                let total = 0
                let successes = 0

                percent = true

                result.forEach(e => {
                    if(e.getValue() as boolean) {
                        successes++
                    }
                    total++
                })

                resultantVal = Math.round((successes / total) * 100)
                break;
            case "Rating":
            case "Number":
                //Calculate an average value
                let elements = 0
                let totalValue = 0

                result.forEach(e => {
                    elements++
                    totalValue += e.getValue() as number
                })

                resultantVal = Math.round(100 * totalValue / elements) / 100

                break;
            default:
                resultantVal = -1
                break;
        }

        return [resultantVal, percent]

    }
}

function CheckBoxElement(props: {label:string, form:ScoutForm, setForm:(form:ScoutForm) => void}) {

    let [changed, setChanged] = useState(false)

    let [field, setField] = useState(props.form.fields.filter(e => e.label === props.label)[0])

    useEffect(() => {
        setField(props.form.fields.filter(e => e.label === props.label)[0])
    }, [props.form])

    return (
        <div className={"inline-form-item"}>
            <Header>
                {field.label}{changed ? "*" : ""}
            </Header>

            <Checkbox
                toggle
                checked={field.CheckBox}
                onChange={(e, data) => {
                    field.setValue(data.checked)

                    props.setForm(Object.create(props.form))
                    setChanged(true)
                }}
            />
        </div>
    )
}

function RatingElement(props: {label:string, form:ScoutForm, setForm:(form:ScoutForm) => void}) {

    let [changed, setChanged] = useState(false)

    let [field, setField] = useState(props.form.fields.filter(e => e.label === props.label)[0])

    useEffect(() => {
        setField(props.form.fields.filter(e => e.label === props.label)[0])
    }, [props.form])

    return (
        <div className={"inline-form-item"}>
            <Popup
                content={"Make sure this isn't above the minimum or below the maximum!"}
                trigger={
                    <Header color={"yellow"}>
                        {field.label}{changed ? "*" : ""}
                    </Header>
                }
            />

            <Input
                type={"number"}
                value={field.Rating}
                onChange={(e, data) => {
                    field.setValue(data.value)

                    props.setForm(Object.create(props.form))
                    setChanged(true)
                }}/>
        </div>
    )
}

function NumberElement(props: {label:string, form:ScoutForm, setForm:(form:ScoutForm) => void}) {

    let [changed, setChanged] = useState(false)

    let [field, setField] = useState(props.form.fields.filter(e => e.label === props.label)[0])

    useEffect(() => {
        setField(props.form.fields.filter(e => e.label === props.label)[0])
    }, [props.form])

    return (
        <div className={"inline-form-item"}>
            <Header>
                {field.label}{changed ? "*" : ""}
            </Header>

            <Input
                type={"number"}
                value={field.Number}
                onChange={(e, data) => {
                    field.setValue(data.value)

                    props.setForm(Object.create(props.form))
                    setChanged(true)
                }}/>
        </div>
    )
}

function ShortTextElement(props: {label:string, form:ScoutForm, setForm:(form:ScoutForm) => void}) {
    let [changed, setChanged] = useState(false)

    let [field, setField] = useState(props.form.fields.filter(e => e.label === props.label)[0])

    useEffect(() => {
        setField(props.form.fields.filter(e => e.label === props.label)[0])
    }, [props.form])

    return (
        <div className={"inline-form-item"}>
            <Header>
                {field.label}{changed ? "*" : ""}
            </Header>

            <Input
                value={field.ShortText}
                onChange={(e, data) => {
                    field.setValue(data.value)

                    props.setForm(Object.create(props.form))
                    setChanged(true)
                }}/>
        </div>
    )
}

class MissingMatch {
    constructor(
        public matchNum:number,
        public teamNum:number,
        public scouter:string
    ) {
    }
}

export {ScoutForm, Field, MissingMatch}
