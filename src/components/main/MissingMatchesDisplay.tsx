import React, {useEffect, useState} from "react";
import {Table} from "semantic-ui-react";
import Match from "../scheduling/matchDisplay/Match";
import {MissingMatch, ScoutForm} from "../ScoutForm";
import TeamLink from "../team-link/TeamLink";
import {Schedule} from "../scheduling/matchDisplay/ScheduleData";
import "./MissingMatchesDisplay.css"

function MissingMatchesDisplay(props: {matches: Match[], submittedForms:ScoutForm[], schedule:Schedule}) {

    let [missing, setMissing] = useState<MissingMatch[]>([])

    useEffect(() => {
        setMissing(ScoutForm.getMissingMatches(props.matches, props.submittedForms, props.schedule))
    }, [props.matches, props.submittedForms, props.schedule])

    return(
        <div>
            <h1>Missing Matches</h1>
            <div className={"missing-matches-container"}>

                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Team</Table.HeaderCell>
                            <Table.HeaderCell>Match</Table.HeaderCell>
                            <Table.HeaderCell>Scouter</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {
                            missing.map(e =>
                                <Table.Row key={e.teamNum + " " + e.matchNum}>
                                    <Table.Cell><TeamLink number={e.teamNum} displayText={e.teamNum}/></Table.Cell>
                                    <Table.Cell>{e.matchNum}</Table.Cell>
                                    <Table.Cell>{e.scouter}</Table.Cell>
                                </Table.Row>
                            )
                        }
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
}

export default MissingMatchesDisplay