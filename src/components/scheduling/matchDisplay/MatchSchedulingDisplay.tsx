import React, {useState} from "react";
import "./MatchSchedulingDisplay.css"
import GridEntry from "./GridEntry";
import {Schedule} from "./ScheduleData";

type MatchSchedulingDisplayOptions = {
    schedule:Schedule
}

function MatchSchedulingDisplay({schedule}: MatchSchedulingDisplayOptions) {


    return(
        <div className={"container"}>
            <h1 className={"header"}>Matches</h1>
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

                           return  <tr className={"table-entry"}>
                                <td>{e}</td>
                                <GridEntry match={index} station={0} shifts={schedule.shifts}/>
                                <GridEntry match={index} station={1} shifts={schedule.shifts}/>
                                <GridEntry match={index} station={2} shifts={schedule.shifts}/>
                                <GridEntry match={index} station={3} shifts={schedule.shifts}/>
                                <GridEntry match={index} station={4} shifts={schedule.shifts}/>
                                <GridEntry match={index} station={5} shifts={schedule.shifts}/>
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