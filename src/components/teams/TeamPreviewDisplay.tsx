import React from "react";
import Picture from "../../resources/2056.jpg"

import "./TeamPreviewDisplay.css"
import {Link} from "react-router-dom";

function TeamPreviewDisplay(props: {teamName:string, teamNum:number}) {
    return (
        <Link to={`/team?number=${props.teamNum}`}>
            <div className={"team-display-container"}>
                <img className={"team-display-image"} src={Picture} alt={props.teamNum.toString()}/>
                <div className={"team-display-info"}>
                    <h3 className={"team-display-text"}>{props.teamNum}</h3>
                    <h3 className={"team-display-text"}>{props.teamName}</h3>
                </div>
            </div>
        </Link>
    )
}

export default TeamPreviewDisplay;