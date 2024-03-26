import React, {useState} from "react";
import "./MatchSchedulingDisplay.css"
import GridEntry from "./GridEntry";
import {Schedule} from "./ScheduleData";
import {Rectangle, RowCol} from "./MultiSelect";
import {Button, Dimmer, Header, Input, Popup} from "semantic-ui-react";
import {team} from "../../../pages/TeamsPage";

type MatchSchedulingDisplayOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function MatchSchedulingDisplay({schedule, setSchedule}: MatchSchedulingDisplayOptions) {

    let [multiSelectRect, setMultiSelectRect] = useState(new Rectangle(new RowCol(0, 0), 0, 0))

    let [multiSelect, setMultiSelect] = useState(false)
    let [multiSelectName, setMultiSelectName] = useState("")

    let [newMatchNum, setNewMatchNum] = useState(-1)

    const generateGridEntry = (match:number, station:number) => {
        return <GridEntry match={match} station={station} schedule={schedule} setSchedule={setSchedule}
                   multiSelectRect={multiSelectRect} setMultiSelectRect={setMultiSelectRect}
                   multiSelect={multiSelect} setMultiSelect={setMultiSelect}
                  multiSelectName={multiSelectName} setMultiSelectName={setMultiSelectName}
        />
    }

    return(
        <div className={"scheduling-container"}>
            <div className={"scheduling-header"}>
                <h1>Matches</h1>

                <div className={"match-number-button"}>
                    <Popup
                        trigger={
                            <Button icon={"setting"}
                                    onClick={() => {
                                    }}
                            />
                        }
                        hoverable
                    >
                        <Input
                            value={newMatchNum !== -1 ? newMatchNum : ""}
                            placeholder={"Set number of matches"}
                            onChange={(e) => {
                                if(parseInt(e.target.value)) {
                                    setNewMatchNum(parseInt(e.target.value))
                                } else if(e.target.value === "") {
                                    setNewMatchNum(-1)
                                }
                            }}
                        />
                        <Button color={"green"} disabled={newMatchNum === -1} onClick={() => {

                            schedule.setNumMatches(newMatchNum)

                            setSchedule(Object.create(schedule))

                            setNewMatchNum(-1)
                        }}>
                            Change
                        </Button>

                    </Popup>
                </div>

            </div>
            <table className={"table"}
                onMouseUp={() => {
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
                                <td className={"match-number"}>{e}</td>
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