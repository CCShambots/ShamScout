import React, {useEffect, useState} from "react";
import {Schedule, Scouter} from "../matchDisplay/ScheduleData";
import "./ScouterDisplay.css"
import {Button, Dimmer, Grid, Icon, Input, Progress} from "semantic-ui-react";
import {HexColorPicker} from "react-colorful";

type displayOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function ScouterDisplay({schedule, setSchedule}: displayOptions) {

    let [names, setNames] = useState(schedule.scouters.map(e => e.name))

    let [adding, setAdding] = useState("")
    let [newColor, setNewColor] = useState("#aabbcc")

    let [dimmerActive, setDimmerActive] = useState(false)

    useEffect(() => {setNewColor(schedule.getNextColor())}, [adding, schedule])

    let handleCreationClick = () => {
        if(names.map(e => e.toLowerCase()).indexOf(adding.toLowerCase())  === -1) {
            let newSchedule = schedule.createScouter(adding, newColor)
            setSchedule(newSchedule)

            setNames(newSchedule.scouters.map(e => e.name))

            setAdding("")
        }
        //Only add to the scouter list if the current entry is not in the list of names

    }

    return(
        <div className={"scouter-container"} onKeyDown={(e) => {
            if(e.key === "Enter" && dimmerActive) handleCreationClick()
            else if(e.key ==="Escape" && dimmerActive) setDimmerActive(false)
        }}
        >
            <div className={"scouter-header"}>
                <h1>Scouters ({schedule.scouters.length})</h1>
                <Button animated={"vertical"} onClick={() => {
                    setDimmerActive(true)

                    setNewColor(schedule.getNextColor())
                }}>
                    <Button.Content visible><Icon name={"add"}/></Button.Content>
                    <Button.Content hidden>Create</Button.Content>
                </Button>
                <Dimmer page active={dimmerActive} onClickOutside={() => setDimmerActive(false)}>
                    <div className={"create-scout-dimmer"}>
                        <h1>Create new Scouter</h1>

                        <Input
                            placeholder={"Enter new Scout Name..."}
                            value={adding}
                            onChange={(e) => setAdding(e.target.value)}
                            error={names.indexOf(adding) !== -1 && adding !== ""}
                        />

                        <hr/>

                        <HexColorPicker
                            color={newColor}
                            onChange={setNewColor}
                        />

                        <hr/>

                        <Button.Group>
                            <Button primary onClick={() => {
                                handleCreationClick()
                                setDimmerActive(false)
                            }}>Create and Close</Button>
                            <Button.Or></Button.Or>
                            <Button color={"green"} onClick={handleCreationClick}>Create</Button>
                            <Button.Or></Button.Or>
                            <Button color={"red"} onClick={() => setDimmerActive(false)}>Cancel</Button>
                        </Button.Group>
                    </div>
                </Dimmer>

            </div>
            <Grid columns={3}>
                {
                    names.map(n => {
                            let scouter = schedule.scouters.filter(e => e.name === n)[0];
                            return  <ScouterEntry e={scouter} key={n}
                                                  numScheduled={schedule.getNumMatchesForScout(scouter)}
                                                  targetNumScheduled={Math.round(schedule.totalMatchesToScout() / names.length)}
                                                  removeSelf={() => {
                                if(schedule.scouters.length>1) {
                                    setSchedule(schedule.removeScouter(n))
                                    setNames(names.filter(e => e !== n))
                                }
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

        </Grid.Column>
        <Grid.Column>
            <Button animated={"vertical"} onClick={removeSelf}>
                <Button.Content visible>
                    <Icon name={"minus"}/>
                </Button.Content>
                <Button.Content hidden>
                    Remove
                </Button.Content>
            </Button>
        </Grid.Column>

    </Grid.Row>
}

export default ScouterDisplay;