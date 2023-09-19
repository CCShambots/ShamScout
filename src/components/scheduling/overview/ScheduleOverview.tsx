import React, {useEffect, useState} from "react";
import "./ScheduleOverview.css"
import {DropDownOptions, Schedule, Scouter} from "../matchDisplay/ScheduleData";
import {Button, Dimmer, Dropdown, Icon, Progress, Statistic} from "semantic-ui-react";

import QRCode from "react-qr-code"
import {Post, Put} from "../../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";

type scheduleOverviewOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void,
    savedToDatabase:boolean
}

function ScheduleOverview({schedule, setSchedule, savedToDatabase}:scheduleOverviewOptions) {

    let [currentEvent] = useLocalStorage("current-event", "")

    let [warningDimmerActive, setWarningDimmerActive] = useState(false)

    let [qrCodeDimmerActive, setQRCodeDimmerActive] = useState(false)

    let [currentQRCodeIndex, setCurrentQRCodeIndex] = useState(0)

    let [saveScheduleDimmerActive, setSaveScheduleDimmerActive] = useState(false);
    let [saveSuccess, setSaveSuccess] = useState(true);

    let handleClick = () => {
        if(schedule.shifts.length > 0) setWarningDimmerActive(true)
        else setSchedule(schedule.generateSchedule())
    }

    let scoutOptions = schedule.scouters.map(e =>
        new DropDownOptions(e.name)
    )


    return(
        <div className={"overview-container"}>
            <h1 className={"overview-header"}>Overview</h1>

            <div className={"overview-content"}>
                <Progress
                    value={Math.round(100*schedule.totalMatchesInShifts()/schedule.totalMatchesToScout())}
                    total={100}
                    progress={"value"}
                    label={"Matches Scheduled (%)"}
                    indicating
                />

                <Statistic.Group className={"schedule-overview-stats"}>
                    <Statistic>
                        <Statistic.Value>{schedule.getTargetMatchesPerScout()}</Statistic.Value>
                        <Statistic.Label>Matches Per Scout</Statistic.Label>
                    </Statistic>
                    <Statistic>
                        <Statistic.Value>{schedule.getScoutsOverScouting()}</Statistic.Value>
                        <Statistic.Label>Scouts over-scouting</Statistic.Label>
                    </Statistic>
                    <Statistic>
                        <Statistic.Value>{Math.round(1000 *schedule.getTargetMatchesPerScout()/schedule.matches.length)/10.0}%</Statistic.Value>
                        <Statistic.Label>Uptime per Scout</Statistic.Label>
                    </Statistic>
                </Statistic.Group>
                <p/>

                <Button onClick={handleClick}><Icon name={"random"}/>Generate Schedule</Button>

                <Button color={"blue"} onClick={() => setQRCodeDimmerActive(true)}><Icon name={"qrcode"}/>Generate QR Codes</Button>

                <Button.Group>
                    <Button color={"green"} onClick={() => {

                        let scheduleJson = schedule.generateJson(currentEvent)

                        console.log(savedToDatabase)

                        savedToDatabase ?
                        //Post this schedule to the API
                        Put(`schedules/get/edit`, scheduleJson).then(r => {
                            setSaveScheduleDimmerActive(true);
                            setSaveSuccess(r);
                        }) :
                        Post(`schedules/submit`, scheduleJson).then(r => {
                            setSaveScheduleDimmerActive(true);
                            setSaveSuccess(r);
                        })
                    }}><Icon name={"save"}/>Save</Button>
                    <Button color={"red"}><Icon name={"x"}/>Cancel</Button>
                </Button.Group>

            </div>

            {/*Warning Dimmer*/}
            <Dimmer active={warningDimmerActive} onClickOutside={() => setWarningDimmerActive(false)} page>
                <h1>Warning! You have some shifts scheduled already! THEY WILL BE DELETED if you generate a new schedule!</h1>
                <Button.Group size={"big"}>
                    <Button onClick={() => {
                        setWarningDimmerActive(false)
                        setSchedule(schedule.generateSchedule())
                    }}
                        primary
                    >I understand, generate a new schedule</Button>
                    <Button.Or/>
                    <Button secondary onClick={() => setWarningDimmerActive(false)}>Cancel</Button>

                </Button.Group>
            </Dimmer>

            {/*QR Code dimmer */}
            <Dimmer active={qrCodeDimmerActive} onClickOutside={() => setQRCodeDimmerActive(false)}>
                <div className={"qr-code-window"}>
                    <div className={"qr-code-header"}>
                        <h1 className={"qr-code-header-text"}>Schedule QR Code</h1>
                        <Button className={"qr-code-close-button"} animated={"vertical"} onClick={() => setQRCodeDimmerActive(false)}>
                            <Button.Content hidden>Close</Button.Content>
                            <Button.Content visible><Icon name={"x"}/></Button.Content>
                        </Button>
                    </div>

                    <QRCodeDisplay scouter={schedule.scouters[currentQRCodeIndex]} schedule={schedule}/>

                    <div className={"bottom-qr-code-content"}>

                        <Button
                            onClick={() => setCurrentQRCodeIndex(currentQRCodeIndex-1)}
                            disabled={currentQRCodeIndex === 0}
                        ><Icon name={"arrow left"}/></Button>

                        <div className={"center-qr-info"}>
                            <Dropdown selection
                                      value={schedule.scouters[currentQRCodeIndex]?.name}
                                      options={scoutOptions}
                                      onChange={
                                (e, data) =>
                                    setCurrentQRCodeIndex(schedule.scouters.indexOf(schedule.getScouterFromName(data.value)))}
                            />
                        </div>

                        <Button
                            onClick={() => setCurrentQRCodeIndex(currentQRCodeIndex+1)}
                            disabled={currentQRCodeIndex === schedule.scouters.length-1}
                        ><Icon name={"arrow right"}/></Button>
                    </div>


                </div>
            </Dimmer>

            <Dimmer active={saveScheduleDimmerActive} onClickOutside={() => setSaveScheduleDimmerActive(false)} page>
                <div className={"vertical-center"}>
                    <div>
                        <Icon name={saveSuccess ? "check" : "delete"} color={saveSuccess ? "green" : "red"} size={"massive"}/>
                    </div>
                    <h1>{saveSuccess ? "Save success!" : "Save Failure! :("}</h1>
                </div>
            </Dimmer>

        </div>
    )
}

type qrCodeOptions = {
    scouter:Scouter,
    schedule:Schedule
}

function QRCodeDisplay({scouter, schedule}:qrCodeOptions) {
    let code = schedule.generateScouterCode(scouter)

    return(
        <div className={"qr-display"}>
            <h1>User: {scouter.name}</h1>
            <QRCode value={code} className={"qr-code"}/>
            {/*<p className={"wrap-code"}>{code}</p>*/}
            <Statistic.Group className={"qr-code-stats"}>
                <Statistic>
                    <Statistic.Value>{schedule.getNumMatchesForScout(scouter)}</Statistic.Value>
                    <Statistic.Label>Matches</Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>{schedule.getMostConsecutiveMatches(scouter)}</Statistic.Value>
                    <Statistic.Label>Most Matches in a Row</Statistic.Label>
                </Statistic>
                <Statistic>
                    <Statistic.Value>{schedule.getLongestBreak(scouter)}</Statistic.Value>
                    <Statistic.Label>Longest Break</Statistic.Label>
                </Statistic>
            </Statistic.Group>
        </div>
    )
}

export default ScheduleOverview