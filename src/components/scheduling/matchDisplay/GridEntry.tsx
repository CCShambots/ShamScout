import React, {useEffect, useRef, useState} from "react";
import "./GridEntry.css"
import {DropDownOptions, RowCol, Schedule} from "./ScheduleData";
import {Button, Checkbox, Dropdown, Popup} from "semantic-ui-react";
import {stat} from "fs";

type entryOptions = {
    match:number, //index of match number
    station:number, //index of alliance station
    
    schedule:Schedule,
    setSchedule:(e:Schedule) => void,
    
    topLeftCorner:RowCol,
    setTopLeftCorner:(e:RowCol) => void,
    
    bottomRightCorner:RowCol,
    setBottomRightCorner:(e:RowCol) => void,

    multiSelectOrigin:RowCol,
    setMultiSelectOrigin: (e:RowCol) => void

    multiSelect:boolean,
    setMultiSelect:(e:boolean) => void,

    multiSelectName:string,
    setMultiSelectName:(e:string) => void,

}

function GridEntry({match, station, schedule, setSchedule,
                       topLeftCorner, setTopLeftCorner,
                       bottomRightCorner, setBottomRightCorner,
                       multiSelect, setMultiSelect, multiSelectName, setMultiSelectName,
                        multiSelectOrigin, setMultiSelectOrigin} :entryOptions) {

    let activeShift = schedule.shifts
        .map((e) => e.includes(match, station)) //get information about whether something is active for a given shift
        .filter(e => e.active)[0]

    let scoutOptions = schedule.scouters.map(e =>
         new DropDownOptions(e.name)
    )


    let [hovering, setHovering] = useState(false)

    let [isMultiSelectOrigin, setIsMultiSelectOrigin] = useState(false)
    
    let [mounted, setMounted] = useState(false)

    let [wholeShift, setWholeShift] = useState(true)
    
    useEffect(() => {
        if( multiSelect &&
            station >= topLeftCorner.col &&
            station <= bottomRightCorner.col &&
            match >= topLeftCorner.row &&
            match <= bottomRightCorner.row
        ) setHovering(true)
        else if(multiSelect) setHovering(false)
    }, [topLeftCorner, bottomRightCorner, station, multiSelect, match])

    useEffect(() => {

        if(!multiSelect && mounted &&
        station >= topLeftCorner.col &&
        station <= bottomRightCorner.col &&
        match >= topLeftCorner.row &&
        match <= bottomRightCorner.row) {

            setSchedule(schedule.createShift(multiSelectName, station, match))

            setIsMultiSelectOrigin(false)
            setHovering(false)
        } else if(!multiSelect) {

            setHovering(false)
            setIsMultiSelectOrigin(false)
        }
    }, [multiSelect])
    
    useEffect(() => {
        setMounted(true)
    }, [])

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
                (active ? "active " : " ") + (top ? "top " : " ") + (bottom ? "bottom" : "")
                + " grid-entry " + (isMultiSelectOrigin ? " multi-select-origin " : "")
            }
            
            onMouseEnter={() => {
                    setHovering(true)
                    
                    if(station < multiSelectOrigin.col) setTopLeftCorner(topLeftCorner.updateCol(station))
                    if(station > multiSelectOrigin.col) setBottomRightCorner(bottomRightCorner.updateCol(station))

                    if(match < multiSelectOrigin.row) setTopLeftCorner(topLeftCorner.updateRow(match))
                    if(match > multiSelectOrigin.row) setBottomRightCorner(bottomRightCorner.updateRow(match))

                    if(station === multiSelectOrigin.col &&
                        match === multiSelectOrigin.row) {
                        setTopLeftCorner(new RowCol(match, station))
                        setBottomRightCorner(new RowCol(match, station))
                    }
                }
            }
            onMouseLeave={() => {
                if(!multiSelect) setHovering(false)
            }}

            onMouseDown={() => {
                if(!multiSelect && active) {
                    setIsMultiSelectOrigin(true)
                    setMultiSelect(true)
                    setMultiSelectName(name)

                    setMultiSelectOrigin(new RowCol(match, station))
                    setTopLeftCorner(new RowCol(match, station))
                    setBottomRightCorner(new RowCol(match, station))

                    console.log("enabling multi-select")
                }
            }}
            >
            <Popup
                on={"click"}
                hoverable
                trigger={
                    <div className={"content"}>
                        {
                            !active ? <div className={"add " + (hovering ? "add-hovering" : "")}><b>+</b></div> : <div/>
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
                        onChange={(e, data) => {
                            setSchedule(schedule.createShift(data.value, station, match))}

                        }
                    />
                    <Checkbox defaultChecked
                        onChange={(e, data) => setWholeShift(data.checked?data.checked : false)}
                        checked={wholeShift}
                    />
                    <p>Whole shift?</p>

                    <Button></Button>

                </Popup>
            : <div/>}

        </td>
    )
}

export default GridEntry