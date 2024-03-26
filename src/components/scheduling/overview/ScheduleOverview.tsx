import React, {useState} from "react";
import "./ScheduleOverview.css"
import {DropDownOptions, Schedule, Scouter} from "../matchDisplay/ScheduleData";
import {Button, Dimmer, Dropdown, Header, Icon, Popup, Progress, Statistic} from "semantic-ui-react";

import QRCode from "react-qr-code"
import {Post, Patch} from "../../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import {CURRENT_EVENT} from "../../../util/LocalStorageConstants";
import {scheduleCreateEdit} from "../../../util/APIConstants";
import {team} from "../../../pages/TeamsPage";

type scheduleOverviewOptions = {
    schedule:Schedule,
    setSchedule:(e:Schedule) => void,
    savedToDatabase:boolean,
    onSaveHook:() => void,
    teams:team[],
    blacklist:team[],
    setBlackList:(teams:team[]) => void
}

function ScheduleOverview({schedule, setSchedule, savedToDatabase, onSaveHook,
                              teams, blacklist, setBlackList}:scheduleOverviewOptions) {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    let [warningDimmerActive, setWarningDimmerActive] = useState(false)

    let [qrCodeDimmerActive, setQRCodeDimmerActive] = useState(false)

    let [currentQRCodeIndex, setCurrentQRCodeIndex] = useState(0)

    let [saveScheduleDimmerActive, setSaveScheduleDimmerActive] = useState(false);
    let [saveSuccess, setSaveSuccess] = useState(true);


    let [blackListOpen, setBlackListOpen] = useState(false)

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
                </Statistic.Group>

                <Statistic>
                    <Statistic.Value>{Math.round(1000 *schedule.getTargetMatchesPerScout()/schedule.matches.length)/10.0}%</Statistic.Value>
                    <Statistic.Label>Uptime per Scout</Statistic.Label>
                </Statistic>

                <p/>


                <Button fluid onClick={() => setBlackListOpen(true)} color={"black"}>
                    <Icon name={"list"}/>Adjust Blacklist
                </Button>


                <Button fluid onClick={handleClick} color={"purple"} disabled={schedule.scouters.length <= 6}>
                    <Icon name={"random"}/>Generate Schedule
                </Button>

                <Button fluid color={"blue"} onClick={() => setQRCodeDimmerActive(true)}><Icon name={"qrcode"}/>Generate QR Codes</Button>

                <Button.Group>
                    <Button color={"green"} onClick={() => {

                        let scheduleJson = schedule.generateJson(currentEvent)

                        console.log(savedToDatabase)

                        savedToDatabase ?
                        //Post this schedule to the API
                        Patch(scheduleCreateEdit, scheduleJson).then(r => {
                            setSaveScheduleDimmerActive(true);

                            setSaveSuccess(r);

                            if(saveSuccess) onSaveHook();
                        }) :
                        Post(scheduleCreateEdit, scheduleJson).then(r => {
                            setSaveScheduleDimmerActive(true);
                            setSaveSuccess(r);

                            if(saveSuccess) onSaveHook();
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
                        primaryu
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

                        <Button onClick={() => setQRCodeDimmerActive(false)} icon={"x"}/>
                    </div>

                    {schedule.scouters.length > 1 ?
                    <QRCodeDisplay scouter={schedule.scouters[currentQRCodeIndex]} schedule={schedule}/> : <p>Not enough scouters in the schedule!!</p>
                    }

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

            <Dimmer
                page
                active={blackListOpen}
                onClickOutside={() => {
                    setBlackListOpen(false)
                }}
            >
                <div className={"blacklist-container"}>
                    <Header size={"huge"}>Team Blacklist</Header>
                    <Button
                        className={"header-button"}
                        color={"red"}
                        icon={"close"}
                        onClick={() => {
                            setBlackListOpen(false)
                        }}
                    />

                    <div className={"blacklist-teams"}>
                        {
                            teams.map((e) => <BlacklistItem team={e} blacklist={blacklist} setBlackList={setBlackList}/>)
                        }
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

function BlacklistItem(props: {team:team, blacklist:team[], setBlackList:(teams:team[]) => void}) {
    let [blacklisted, setBlacklisted] = useState(props.blacklist.filter(e => e.number === props.team.number).length>0)

    return <Popup
        hoverable
        trigger={
            <div
                className={"blacklist-team "  + (blacklisted ? "blacklisted" : "")}
                key={props.team.number}
                onClick={() => {

                    if (blacklisted) {
                        props.setBlackList(props.blacklist.filter((ele) => ele.number !== props.team.number))
                    } else {
                        props.setBlackList(props.blacklist.concat(props.team))
                    }

                    setBlacklisted(!blacklisted);
                }}
            >
                <h1>{props.team.number}</h1>
            </div>

        }
        inverted={blacklisted}
        content={props.team.name}

    />


}

export default ScheduleOverview