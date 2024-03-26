import React, {useEffect, useState} from "react";
import "./GridEntry.css"
import {DropDownOptions, Schedule} from "./ScheduleData";
import {Button, Checkbox, Dropdown, Popup} from "semantic-ui-react";
import {Rectangle, RowCol} from "./MultiSelect";
import {getTeamNumberFromStation} from "./Match";

type entryOptions = {
    match:number, //index of match number
    station:number, //index of alliance station
    
    schedule:Schedule,
    setSchedule:(e:Schedule) => void,

    multiSelectRect:Rectangle,
    setMultiSelectRect:(e:Rectangle) => void,

    multiSelect:boolean,
    setMultiSelect:(e:boolean) => void,

    multiSelectName:string,
    setMultiSelectName:(e:string) => void,

}

function GridEntry({match, station, schedule, setSchedule,
                       multiSelectRect, setMultiSelectRect,
                       multiSelect, setMultiSelect, multiSelectName, setMultiSelectName
                    } :entryOptions) {

    let activeShift = schedule.shifts
        .map((e) => e.includes(match, station)) //get information about whether something is active for a given shift
        .filter(e => e.active)[0]

    let scoutOptions = schedule.scouters.map(e =>
         new DropDownOptions(e.name)
    )
    
    let [hovering, setHovering] = useState(false)

    let [isMultiSelectOrigin, setIsMultiSelectOrigin] = useState(false)
    
    let [mounted, setMounted] = useState(false)

    let [switchNameSelection, setSwitchNameSelection] = useState("")
    let [wholeShift, setWholeShift] = useState(true)
    
    useEffect(() => {

        let topLeftCorner = multiSelectRect.getTopLeft()
        let bottomRightCorner = multiSelectRect.getBottomRight()

        if( multiSelect &&
            station >= topLeftCorner.col &&
            station <= bottomRightCorner.col &&
            match >= topLeftCorner.row &&
            match <= bottomRightCorner.row
        ) setHovering(true)
        else if(multiSelect) setHovering(false)
    }, [multiSelectRect, station, multiSelect, match])

    useEffect(() => {


        let topLeftCorner = multiSelectRect.getTopLeft()
        let bottomRightCorner = multiSelectRect.getBottomRight()

        if(!multiSelect && mounted &&
        station >= topLeftCorner.col &&
        station <= bottomRightCorner.col &&
        match >= topLeftCorner.row &&
        match <= bottomRightCorner.row) {

            setSchedule(schedule.modifyShift(multiSelectName, station, match))

            setIsMultiSelectOrigin(false)
            setHovering(false)
        }
        if(!multiSelect) {
            setIsMultiSelectOrigin(false)

            setHovering(false)
        }

    }, [multiSelect])

    useEffect(() => {
        setMounted(true)
    }, [])

    let active = false;
    let top = false;
    let bottom=  false;
    let name = "";
    let color = "";
    //Whether the same person is scouting twice in one match
    let doubleScouted = false


    if(activeShift) {
        active =  activeShift.active
        top = activeShift.top
        bottom = activeShift.bottom
        name = activeShift.scouter!.name ?? "unknown"
        color = activeShift.scouter!.color ?? "ffffff"

        doubleScouted = schedule.isDoubleScouted(name, match, station)
    }

    return(
        <td
            style={{backgroundColor: active ? color : ""}}
            className={
                (active ? "active " : " ") + (top ? "top " : " ") + (bottom ? "bottom" : "")
                + " grid-entry " + (isMultiSelectOrigin ? " multi-select-origin " : "") + (doubleScouted ? " double-scouted " : "")
            }
            
            onMouseEnter={() => {
                    setHovering(true)

                    setMultiSelectRect(multiSelectRect.update(new RowCol(match, station)))
                }
            }
            onMouseLeave={() => {
                if(!multiSelect) setHovering(false)
            }}

            onContextMenu={(e) => {
                e.preventDefault()

                if(!multiSelect && active) {
                    setIsMultiSelectOrigin(true)
                    setMultiSelect(true)
                    setMultiSelectName(name)

                    setMultiSelectRect(new Rectangle(new RowCol(match, station), 0, 0))

                }
            }}
            >
            <Popup
                on={"click"}
                hoverable
                trigger={
                    <div className={"content"}>
                        {
                            !active ? <div className={"add-cell " + (hovering ? "add-hovering" : "")}><b>+</b></div> : <div/>
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
            {active ?
                <Popup
                    on={"click"}
                    hoverable
                    trigger={
                        <b>{name}</b>
                    }
                >
                    <Dropdown
                        placeholder={"Switch Scouter"}
                        fluid
                        selection
                        options={scoutOptions}
                        onChange={(e, data) => setSwitchNameSelection(data.value as string)}
                    />

                    <div className={"inline"}>
                        <Checkbox
                            onChange={(e, data) => setWholeShift(data.checked?data.checked : false)}
                            checked={wholeShift}
                        />
                        <p>Whole shift?</p>
                    </div>

                    <Button
                        disabled={schedule.scouters.map(e => e.name).indexOf(switchNameSelection) === -1}
                        onClick={(e, data) => {
                        if(schedule.scouters.map(e => e.name).indexOf(switchNameSelection) !== -1) {
                            if(wholeShift) setSchedule(schedule.swapShiftScouter(switchNameSelection, station, match))
                            else setSchedule(schedule.modifyShift(switchNameSelection, station, match))
                        }

                    }
                    }>Apply Change</Button>

                </Popup>
            : <div/>}

        </td>
    )
}

export default GridEntry