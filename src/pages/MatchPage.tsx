import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import {Popup, Table} from "semantic-ui-react";
import {Pull, PullTBA} from "../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import "./MatchPage.css"

function MatchPage() {
    
    let [currentEvent] = useLocalStorage("current-event", "")
    
    let [matches, setMatches] = useState<Match[]>([])
    let [submittedForms, setSubmittedForms] = useState<GenericForm[]>([])
    
    useEffect(() => {
        PullTBA(`event/${currentEvent}/matches/simple`, (data) => {
            setMatches(data.filter((e:any) => e.key.indexOf(currentEvent+"_qm") !== -1).map((e:any):Match => {

                let redAllianceKeys = e.alliances.red.team_keys;
                let blueAllianceKeys = e.alliances.blue.team_keys;

                let redAllianceNumbers = redAllianceKeys.map((e:any) => parseInt(e.substring(3)));
                let blueAllianceNumbers = blueAllianceKeys.map((e:any) => parseInt(e.substring(3)));

                return new Match(parseInt(e.key.substring(e.key.lastIndexOf("_qm")+3)), redAllianceNumbers, blueAllianceNumbers)
            }).sort((e1:Match, e2:Match) => e1.match-e2.match))
        })
    }, [currentEvent])

    useEffect(() => {

        Pull(`template/test/get?event=${currentEvent}`, (data) => {
            setSubmittedForms(data.map((e:any) =>
                GenericForm.fromJson(e)
            ))
        }).then(() => {})
    }, [matches, currentEvent])

    return(
        <div className={"page"}>
            <Header/>

            <div className={"match-table"}>

                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Match</Table.HeaderCell>
                            <Table.HeaderCell>Red 1</Table.HeaderCell>
                            <Table.HeaderCell>Red 2</Table.HeaderCell>
                            <Table.HeaderCell>Red 3</Table.HeaderCell>
                            <Table.HeaderCell>Blue 1</Table.HeaderCell>
                            <Table.HeaderCell>Blue 2</Table.HeaderCell>
                            <Table.HeaderCell>Blue 3</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {matches.map(e =>
                        <Table.Row className={"match-display"}>
                            <Table.Cell>Quals {e.match}</Table.Cell>
                            <TeamDisplay match={e.match} teamNum={e.red1} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match} teamNum={e.red2} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match} teamNum={e.red3} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match} teamNum={e.blue1} redAlliance={false} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match} teamNum={e.blue2} redAlliance={false} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match} teamNum={e.blue3} redAlliance={false} submittedForms={submittedForms}/>
                        </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
}

class GenericForm {
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
            data.event
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

function TeamDisplay(props: {teamNum:number, match:number, redAlliance:boolean, submittedForms:GenericForm[]}) {

    let thisTeamForms = props.submittedForms
        .filter(e => e.team === props.teamNum && e.match_number === props.match)

    let isMissing = thisTeamForms.length === 0 && props.submittedForms.filter(e => e.match_number > props.match + 1).length > 0

    return(
        <Table.Cell className={(props.redAlliance ? "red-team " : "blue-team ") + (isMissing ? "error-team" : "")}>
            <Popup
                header="Forms"
                content={GenericForm.getDisplayNameForPopup(thisTeamForms)}
                trigger={<p>{props.teamNum} {thisTeamForms.length > 0 ? `(${thisTeamForms.length})` : ""}</p>}
                inverted
            />
        </Table.Cell>
    )
}

class Match {
    public red1:number
    public red2:number
    public red3:number
    public blue1:number
    public blue2:number
    public blue3:number

    constructor(
        public match:number,
        redAlliance:number[],
        blueAlliance:number[]
    ) {
        this.red1 = redAlliance[0]
        this.red2 = redAlliance[1]
        this.red3 = redAlliance[2]

        this.blue1 = blueAlliance[0]
        this.blue2 = blueAlliance[1]
        this.blue3 = blueAlliance[2]
    }
}

export default MatchPage

