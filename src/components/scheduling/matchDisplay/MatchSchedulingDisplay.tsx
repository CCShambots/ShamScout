import React, {useState} from "react";
import "./MatchSchedulingDisplay.css"
import GridEntry from "./GridEntry";
import {RowCol, Schedule} from "./ScheduleData";

type MatchSchedulingDisplayOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function MatchSchedulingDisplay({schedule, setSchedule}: MatchSchedulingDisplayOptions) {

    let [topLeftCorner, setTopLeftCorner] = useState(new RowCol(0,0))
    let [bottomRightCorner, setBottomRightCorner] = useState(new RowCol(0,0))
    let [multiSelectOrigin, setMultiSelectOrigin] = useState(new RowCol(0, 0))

    let [multiSelect, setMultiSelect] = useState(false)
    let [multiSelectName, setMultiSelectName] = useState("")

    const generateGridEntry = (match:number, station:number) => {
        return <GridEntry match={match} station={station} schedule={schedule} setSchedule={setSchedule}
                   topLeftCorner={topLeftCorner} setTopLeftCorner={setTopLeftCorner}
                   bottomRightCorner={bottomRightCorner} setBottomRightCorner={setBottomRightCorner}
                   multiSelect={multiSelect} setMultiSelect={setMultiSelect}
                  multiSelectName={multiSelectName} setMultiSelectName={setMultiSelectName}
                    multiSelectOrigin={multiSelectOrigin} setMultiSelectOrigin={setMultiSelectOrigin}
        />
    }

    return(
        <div className={"scheduling-container"}>
            <h1 className={"scheduling-header"}>Matches</h1>
            <table className={"table"}
                onMouseUp={() => {

                    setMultiSelect(false)
                    // setTopLeftCorner(new RowCol(0,0))
                    // setBottomRightCorner(new RowCol(0,0))
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