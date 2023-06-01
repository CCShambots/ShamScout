import React from "react";
import "./GridEntry.css"
import {DropDownOptions, Schedule} from "./ScheduleData";
import {Dropdown, Popup} from "semantic-ui-react";

type entryOptions = {
    match:number, //index of match number
    station:number, //index of alliance station,
    schedule:Schedule,
    setSchedule:(e:Schedule) => void

}

function GridEntry({match, station, schedule, setSchedule} :entryOptions) {

    let activeShift = schedule.shifts
        .map((e) => e.includes(match, station)) //get information about whether something is active for a given shift
        .filter(e => e.active)[0]

    let scoutOptions = schedule.scouters.map(e =>
         new DropDownOptions(e.name)
    )

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
            className={
                (active ? "active " : " ") + (top ? "top " : " ") + (bottom ? "bottom" : "") + " grid-entry"
            }>
            <Popup
                on={"click"}
                pinned
                trigger={
                    <div className={"content"}>
                        {
                            !active ? <div className={"add"}><b>+</b></div> : <div/>
                        }
                    </div>
                }
            >
            <Dropdown
                placeholder={"Select Scouter"}
                fluid
                selection
                options={scoutOptions}
                onChange={(e, data) => {
                    setSchedule(schedule.createShift(data.value, station, match))}

                }
            />

            </Popup>
            {active ? <b>{name}</b> : ""}

        </td>
    )
}

export default GridEntry