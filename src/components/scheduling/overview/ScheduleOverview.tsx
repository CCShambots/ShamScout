import React, {useState} from "react";
import "./ScheduleOverview.css"
import {DropDownOptions, Schedule, Scouter} from "../matchDisplay/ScheduleData";
import {Button, Dimmer, Dropdown, Icon, Input, Progress, Statistic} from "semantic-ui-react";

import QRCode from "react-qr-code"
import TextTransition from "react-text-transition";

type scheduleOverviewOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void
}

function ScheduleOverview({schedule, setSchedule}:scheduleOverviewOptions) {

    let [sequentialPreference, setSequentialPreference] = useState(10)

    let [warningDimmerActive, setWarningDimmerActive] = useState(false)

    let [qrCodeDimmerActive, setQRCodeDimmerActive] = useState(false)

    let [currentQRCodeIndex, setCurrentQRCodeIndex] = useState(0)

    let handleClick = () => {
        if(schedule.shifts.length > 0) setWarningDimmerActive(true)
        else setSchedule(schedule.generateSchedule(sequentialPreference))
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

                <h4>Enter Preferred Maximum Number of Matches Scouted in a Row</h4>
                <Input
                    onChange={(e, data) => {setSequentialPreference(Number.parseInt(data.value))}}
                    value={sequentialPreference}
                />
                <Button onClick={handleClick}>Generate Schedule</Button>

                <hr/>

                <Button onClick={() => setQRCodeDimmerActive(true)}><Icon name={"qrcode"}/>Generate QR Codes</Button>
                <Button><Icon name={"save"}/>Save</Button>
                <Button><Icon name={"x"}/>Cancel</Button>

            </div>

            {/*Warning Dimmer*/}
            <Dimmer active={warningDimmerActive} onClickOutside={() => setWarningDimmerActive(false)} page>
                <h1>Warning! You have some shifts scheduled already! THEY WILL BE DELETED if you generate a new schedule!</h1>
                <Button.Group size={"big"}>
                    <Button onClick={() => {
                        setWarningDimmerActive(false)
                        setSchedule(schedule.generateSchedule(sequentialPreference))
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
                            <TextTransition className={"qr-options-text"}>{schedule.scouters[currentQRCodeIndex-1]?.name}</TextTransition>
                            <Dropdown selection
                                      value={schedule.scouters[currentQRCodeIndex]?.name}
                                      options={scoutOptions}
                                      onChange={
                                (e, data) =>
                                    setCurrentQRCodeIndex(schedule.scouters.indexOf(schedule.getScouterFromName(data.value)))}
                            />
                            <TextTransition className={"qr-options-text"}>{schedule.scouters[currentQRCodeIndex+1]?.name}</TextTransition>
                        </div>

                        <Button
                            onClick={() => setCurrentQRCodeIndex(currentQRCodeIndex+1)}
                            disabled={currentQRCodeIndex === schedule.scouters.length-1}
                        ><Icon name={"arrow right"}/></Button>
                    </div>


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
            <h1>{scouter.name}</h1>
            <QRCode value={code} className={"scout-qr-code"}/>
            <p>{code}</p>
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