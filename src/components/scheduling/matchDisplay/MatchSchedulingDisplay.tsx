import React, {useState} from "react";
import "./MatchSchedulingDisplay.css"
import GridEntry from "./GridEntry";
import {Schedule} from "./ScheduleData";

type MatchSchedulingDisplayOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function MatchSchedulingDisplay({schedule, setSchedule}: MatchSchedulingDisplayOptions) {


    return(
        <div className={"scheduling-container"}>
            <h1 className={"scheduling-header"}>Matches</h1>
            <table className={"table"}>
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
                                <GridEntry match={index} station={0} schedule={schedule} setSchedule={setSchedule}/>
                                <GridEntry match={index} station={1} schedule={schedule} setSchedule={setSchedule}/>
                                <GridEntry match={index} station={2} schedule={schedule} setSchedule={setSchedule}/>
                                <GridEntry match={index} station={3} schedule={schedule} setSchedule={setSchedule}/>
                                <GridEntry match={index} station={4} schedule={schedule} setSchedule={setSchedule}/>
                                <GridEntry match={index} station={5} schedule={schedule} setSchedule={setSchedule}/>
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