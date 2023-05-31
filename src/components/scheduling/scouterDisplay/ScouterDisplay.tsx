import React, {useState} from "react";
import {Scouter} from "../matchDisplay/ScheduleData";
import "./ScouterDisplay.css"
import RemoveIcon from "./RemoveIcon";

type displayOptions = {
    scouters:Scouter[]
}

function ScouterDisplay({scouters}: displayOptions) {


    return(
        <div className={"container"}>
            <h1 className={"header"}>Scouters</h1>
                {
                    scouters.map(e => {
                            return  <ScouterEntry e={e}/>
                        }
                    )
                }
        </div>
    )
}

type EntryOptions = {
    e:Scouter
}
function ScouterEntry({e}:EntryOptions) {
    let [highlighted, setHighlighted] = useState(false)

    return <div
        className={"scouter-entry-container"}
        style={{backgroundColor: e.color}} key={e.name}>
        <div className={"scouter-entry"}>
            <p className={"entry-text " + (highlighted ? "highlighted" : "")}>{e.name}</p>
            <RemoveIcon setActive={setHighlighted}/>
        </div>
    </div>
}

export default ScouterDisplay;