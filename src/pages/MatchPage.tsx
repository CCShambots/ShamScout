import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import {Button, Popup, Table} from "semantic-ui-react";
import {Pull, PullTBA} from "../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import "./MatchPage.css"
import {Link} from "react-router-dom";
import {ScoutForm} from "../components/ScoutForm";
import Match from "../components/scheduling/matchDisplay/Match";

function MatchPage() {
    
    let [currentEvent] = useLocalStorage("current-event", "")
    
    let [matches, setMatches] = useLocalStorage<Match[]>(`matches-${currentEvent}`, [])
    let [submittedForms, setSubmittedForms] = useState<ScoutForm[]>([])
    
    const syncMatches = () => PullTBA(`event/${currentEvent}/matches/simple`, (data) => {
        setMatches(data.filter((e:any) => e.key.indexOf(currentEvent+"_qm") !== -1).map((e:any):Match => {

            let redAllianceKeys = e.alliances.red.team_keys;
            let blueAllianceKeys = e.alliances.blue.team_keys;

            let redAllianceNumbers = redAllianceKeys.map((e:any) => parseInt(e.substring(3)));
            let blueAllianceNumbers = blueAllianceKeys.map((e:any) => parseInt(e.substring(3)));

            return new Match(parseInt(e.key.substring(e.key.lastIndexOf("_qm")+3)), redAllianceNumbers, blueAllianceNumbers)
        }).sort((e1:Match, e2:Match) => e1.match_number-e2.match_number))
    })

    useEffect(() => {

        Pull(`template/test/get?event=${currentEvent}`, (data) => {
            setSubmittedForms(data.map((e:any) =>
                ScoutForm.fromJson(e)
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
                        <Table.Row className={"match-display"} key={e.match_number}>
                            <Table.Cell>Quals {e.match_number}</Table.Cell>
                            <TeamDisplay match={e.match_number} teamNum={e.red1} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.red2} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.red3} redAlliance={true} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.blue1} redAlliance={false} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.blue2} redAlliance={false} submittedForms={submittedForms}/>
                            <TeamDisplay match={e.match_number} teamNum={e.blue3} redAlliance={false} submittedForms={submittedForms}/>
                        </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>

            <Popup content={"Sync matches from TBA"} size={"huge"} inverted trigger={
                <Button
                    className={"sync-matches"}
                    size={"massive"} icon={"sync"} color={"blue"}
                    onClick={syncMatches}
                />
            }/>

        </div>
    )
}

function TeamDisplay(props: {teamNum:number, match:number, redAlliance:boolean, submittedForms:ScoutForm[]}) {

    let thisTeamForms = props.submittedForms
        .filter(e => e.team === props.teamNum && e.match_number === props.match)

    let isMissing = ScoutForm.isMissing(props.teamNum, props.match, props.submittedForms);

    return(
        <Table.Cell className={(props.redAlliance ? "red-team " : "blue-team ") + (isMissing ? "error-team" : "")}>
            <Link to={`/team?number=${props.teamNum}`}>
                <Popup
                    header="Forms"
                    content={ScoutForm.getDisplayNameForPopup(thisTeamForms)}
                    trigger={<p className={"team-link"}>{props.teamNum} {thisTeamForms.length > 0 ? `(${thisTeamForms.length})` : ""}</p>}
                    inverted
                />
            </Link>
        </Table.Cell>
    )
}

export default MatchPage

