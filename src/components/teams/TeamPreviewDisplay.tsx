import React, {useEffect, useState} from "react";
import Picture from "../../resources/team_placeholder.png"

import "./TeamPreviewDisplay.css"
import {Link} from "react-router-dom";
import {doesTeamHaveImage, getImagePath} from "../../util/APIUtil";

function TeamPreviewDisplay(props: {teamName:string, teamNum:number}) {

    let [imageInAPI, setImageInAPI] = useState(false)

    useEffect(() => {
        doesTeamHaveImage(props.teamNum).then((result) => {setImageInAPI(result)});
    }, [props.teamNum]);

    return (
        <Link to={`/team?number=${props.teamNum}`}>
            <div className={"team-display-container"}>
                <div className={"team-display-image-container"}>
                    {
                        imageInAPI ?
                        <img className={"team-display-image"} src={getImagePath(props.teamNum)} alt={props.teamNum.toString()}/> :
                        <img className={"team-display-image"} src={Picture} alt={props.teamNum.toString()}/>

                    }
                </div>
                <div className={"team-display-info"}>
                    <h3 className={"team-display-text"}>{props.teamNum}</h3>
                    <h3 className={"team-display-text"}>{props.teamName}</h3>
                </div>
            </div>
        </Link>
    )
}

export default TeamPreviewDisplay;