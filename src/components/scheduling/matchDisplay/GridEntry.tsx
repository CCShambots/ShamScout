import React from "react";
import "./GridEntry.css"
import {Shift} from "./ScheduleData";

type entryOptions = {
    match:number, //index of match number
    station:number, //index of alliance station,
    shifts:Shift[]

}

function GridEntry({match, station, shifts} :entryOptions) {

    let activeShift = shifts
        .map((e) => e.includes(match, station)) //get information about whether something is active for a given shift
        .filter(e => e.active)[0]

    let active = false;
    let top = false;
    let bottom=  false;
    let name = "";
    let color = ""

    if(activeShift) {
        active =  activeShift.active
        top = activeShift.top
        bottom = activeShift.bottom
        name = activeShift.scouter.name
        color = activeShift.scouter.color
    }

    return(
        <td
            style={{backgroundColor: active ? color : ""}}
            className={(active ? "active " : " ") + (top ? "top " : " ") + (bottom ? "bottom" : "") + " entry"}>
            {name}
        </td>
    )
}

export default GridEntry