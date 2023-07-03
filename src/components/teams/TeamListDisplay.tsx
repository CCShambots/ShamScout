import React from "react";
import {Table} from "semantic-ui-react";
import GenericForm from "../GenericForm";
import {Link} from "react-router-dom";
import {useLocalStorage} from "usehooks-ts";

function TeamListDisplay(props: {teamNum:number, teamName:string, submittedForms:GenericForm[]}) {
    let [currentEvent] = useLocalStorage("current-event", "")

    //Forms for this team
    let thisTeamForms = props.submittedForms.filter(e => e.team === props.teamNum)

    //Forms for this team for this event
    let thisEventForms = thisTeamForms.filter(e => {
        return e.event === currentEvent
    })

    return(
        <Table.Row>
            <Table.Cell><Link to={`/team?number=${props.teamNum}`}>{props.teamNum}</Link></Table.Cell>
            <Table.Cell>{props.teamName}</Table.Cell>
            <Table.Cell>{thisTeamForms.length}</Table.Cell>
            <Table.Cell>{thisEventForms.length}</Table.Cell>
            <Table.Cell></Table.Cell>
        </Table.Row>
    )
}

export default TeamListDisplay