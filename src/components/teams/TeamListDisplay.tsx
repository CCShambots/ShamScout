import React from "react";
import {Table} from "semantic-ui-react";
import {ScoutForm} from "../ScoutForm";
import {Link} from "react-router-dom";
import {useLocalStorage} from "usehooks-ts";
import {CURRENT_EVENT} from "../../util/LocalStorageConstants";

function TeamListDisplay(props: {teamNum:number, teamName:string, submittedForms:ScoutForm[]}) {
    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    //Forms for this team
    let thisTeamForms = props.submittedForms.filter(e => e.team === props.teamNum)

    //Forms for this team for this event
    let thisEventForms = thisTeamForms.filter(e => {
        return e.event === currentEvent
    })

    return(
        <Table.Row>
            <Table.Cell><Link to={`/team?number=${props.teamNum}`}>{props.teamNum}</Link></Table.Cell>
            <Table.Cell><Link to={`/team?number=${props.teamNum}`}>{props.teamName}</Link></Table.Cell>
            <Table.Cell>{thisTeamForms.length}</Table.Cell>
            <Table.Cell>{thisEventForms.length}</Table.Cell>
            <Table.Cell></Table.Cell>
        </Table.Row>
    )
}

export default TeamListDisplay