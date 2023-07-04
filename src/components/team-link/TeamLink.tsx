import React from "react";
import {Link} from "react-router-dom";
import "./TeamLink.css"

function TeamLink(props: {number:number, displayText:string|number}) {
    return (
        <Link className={"team-link"} to={`/team?number=${props.number}`}>{props.displayText}</Link>
    )
}

export default TeamLink;