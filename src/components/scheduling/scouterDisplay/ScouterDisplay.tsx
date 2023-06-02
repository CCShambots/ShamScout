import React, {useRef, useState} from "react";
import {Schedule, Scouter} from "../matchDisplay/ScheduleData";
import "./ScouterDisplay.css"
import RemoveIcon from "./RemoveIcon";
import {Button, Grid, Icon, Input, Popup, Progress} from "semantic-ui-react";

type displayOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function ScouterDisplay({schedule, setSchedule}: displayOptions) {

    let [names, setNames] = useState(schedule.scouters.map(e => e.name))

    let [adding, setAdding] = useState("")

    let inputRef = useRef<Input>(null)
    let handleClick = () =>  {
        inputRef.current?.focus()
    }

    return(
        <div className={"scouter-container"}>
            <div className={"scouter-header"}>
                <h1>Scouters ({schedule.scouters.length})</h1>
                <Popup
                    trigger={
                        <Button onClick={handleClick}>
                            <Icon name={"add"}/>
                        </Button>
                    }
                   on={"click"}
                >
                    <Popup.Header>Create new Scouter</Popup.Header>
                    <Popup.Content>
                        <Input
                            ref={inputRef}
                            placeholder={"Enter new Scout Name..."}
                            value={adding}
                            onChange={(e) => setAdding(e.target.value)}
                            error={names.indexOf(adding) !== -1}
                        />
                        <Button onClick={() => {
                            if(names.map(e => e.toLowerCase()).indexOf(adding.toLowerCase())  === -1) {
                                let newSchedule = schedule.addScouter(adding)
                                setSchedule(newSchedule)

                                setNames(newSchedule.scouters.map(e => e.name))

                                setAdding("")
                            }
                            //Only add to the scouter list if the current entry is not in the list of names
                        }}>Create</Button>
                    </Popup.Content>
                </Popup>

            </div>
                <Grid columns={3}>
                    {
                        names.map(n => {
                                let scouter = schedule.scouters.filter(e => e.name === n)[0];
                                return  <ScouterEntry e={scouter} key={n}
                                                      numScheduled={schedule.getNumMatchesForScout(scouter)}
                                                      targetNumScheduled={Math.round(schedule.totalMatchesToScout() / names.length)}
                                                      removeSelf={() => {
                                    setSchedule(schedule.removeScouter(n))
                                    setNames(names.filter(e => e !== n))
                                }}
                                />
                            }
                        )
                    }
                </Grid>
        </div>
    )
}

type EntryOptions = {
    e:Scouter,
    removeSelf:() => void,
    numScheduled:number,
    targetNumScheduled:number
}
function ScouterEntry({e, removeSelf, numScheduled, targetNumScheduled}:EntryOptions) {
    let [highlighted, setHighlighted] = useState(false)

    return <Grid.Row
        className={"scouter-entry-container"}
        style={{backgroundColor: e.color}} key={e.name}>

        <Grid.Column>
            <p className={"entry-text " + (highlighted ? "highlighted" : "")}>{e.name}</p>
        </Grid.Column>
        <Grid.Column>
            <Progress value={numScheduled} total={targetNumScheduled} progress={'value'} indicating style={{marginBottom: "1vh"}}/>
            {numScheduled > targetNumScheduled ? <p className={"over-scheduled-warning"}>Overscheduled!</p> : <div/>}

        </Grid.Column>
        <Grid.Column>
            <RemoveIcon setActive={setHighlighted} triggerClick={removeSelf}/>
        </Grid.Column>

    </Grid.Row>
}

export default ScouterDisplay;