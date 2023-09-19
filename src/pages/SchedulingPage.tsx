import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import MatchSchedulingDisplay from "../components/scheduling/matchDisplay/MatchSchedulingDisplay";
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";
import ScouterDisplay from "../components/scheduling/scouterDisplay/ScouterDisplay";

import "./SchedulingPage.css"
import ScheduleOverview from "../components/scheduling/overview/ScheduleOverview";
import {useLocalStorage} from "usehooks-ts";
import {Pull, PullTBA} from "../util/APIUtil";

function SchedulingPage() {

    let [currentEvent] = useLocalStorage("current-event", "");

    let [schedule, setSchedule] = useState(new Schedule(["Quals 1"], ["test"], []));

    let [savedToDatabase, setSavedToDatabase] = useState(false)

    //Load whatever schedule is currently saved to the API
    useEffect(() => {
        PullTBA(`event/${currentEvent}/matches/keys`, (tbaData) => {

            let numQuals = tbaData.filter((ele:any) => ele.indexOf(currentEvent+"_qm") !== -1).length;

            schedule.setNumMatches(numQuals)
            setSchedule(schedule)

            Pull(`schedules/get/event/${currentEvent}`, (data) => {
                let loadedSchedule = Schedule.fromJson(data, numQuals)
                if(loadedSchedule.shifts.length > 0) setSavedToDatabase(true)
                setSchedule(loadedSchedule);
            }).then(() => {})
        })
    }, [currentEvent])


    return(
        <div>
            <Header/>
            <div className={"scheduling-page-container"}>
                <MatchSchedulingDisplay schedule={schedule} setSchedule={setSchedule}/>
                <ScouterDisplay schedule={schedule} setSchedule={setSchedule}/>
                <ScheduleOverview schedule={schedule} setSchedule={setSchedule} savedToDatabase={savedToDatabase}/>
            </div>

        </div>
    )

}

export default SchedulingPage;