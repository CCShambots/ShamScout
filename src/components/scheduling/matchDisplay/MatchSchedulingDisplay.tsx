import React, {useState} from "react";
import "./MatchSchedulingDisplay.css"
import GridEntry from "./GridEntry";
import {Schedule} from "./ScheduleData";
import {Rectangle, RowCol} from "./MultiSelect";

type MatchSchedulingDisplayOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function MatchSchedulingDisplay({schedule, setSchedule}: MatchSchedulingDisplayOptions) {

    let [multiSelectRect, setMultiSelectRect] = useState(new Rectangle(new RowCol(0, 0), 0, 0))

    let [multiSelect, setMultiSelect] = useState(false)
    let [multiSelectName, setMultiSelectName] = useState("")

    const generateGridEntry = (match:number, station:number) => {
        return <GridEntry match={match} station={station} schedule={schedule} setSchedule={setSchedule}
                   multiSelectRect={multiSelectRect} setMultiSelectRect={setMultiSelectRect}
                   multiSelect={multiSelect} setMultiSelect={setMultiSelect}
                  multiSelectName={multiSelectName} setMultiSelectName={setMultiSelectName}
        />
    }

    return(
        <div className={"scheduling-container"}>
            <h1 className={"scheduling-header"}>Matches</h1>
            <table className={"table"}
                onMouseUp={() => {
                    console.log("Mouse up")
                    setMultiSelect(false)
                }}>
                <tbody>
                    <tr className={"table-header bottom-border"}>
                        <th>Match</th>
                        <th>Red 1</th>
                        <th>Red 2</th>
                        <th>Red 3</th>
                        <th>Blue 1</th>
                        <th>Blue 2</th>
                        <th>Blue 3</th>
                    </tr>
                    {
                        schedule.matches.map(e => {

                            let index = schedule.matches.indexOf(e);

                           return  <tr className={"table-entry"} key={e}>
                                <td>{e}</td>
                               {generateGridEntry(index, 0)}
                               {generateGridEntry(index, 1)}
                               {generateGridEntry(index, 2)}
                               {generateGridEntry(index, 3)}
                               {generateGridEntry(index, 4)}
                               {generateGridEntry(index, 5)}
                            </tr>
                            }
                        )
                    }
                </tbody>
            </table>
        </div>
    )

}

export default MatchSchedulingDisplay