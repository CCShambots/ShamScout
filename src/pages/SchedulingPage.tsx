import React, {useEffect, useState} from "react";
import AppHeader from "../components/header/AppHeader";
import MatchSchedulingDisplay from "../components/scheduling/matchDisplay/MatchSchedulingDisplay";
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";
import ScouterDisplay from "../components/scheduling/scouterDisplay/ScouterDisplay";

import "./SchedulingPage.css"
import ScheduleOverview from "../components/scheduling/overview/ScheduleOverview";
import {useLocalStorage} from "usehooks-ts";
import {Pull} from "../util/APIUtil";
import {BLACKLIST, CURRENT_EVENT, MATCHES, TEAMS} from "../util/LocalStorageConstants";
import {FormPrompt} from "../components/FormPrompt";
import {scheduleDetails} from "../util/APIConstants";
import {team} from "./TeamsPage";
import Match from "../components/scheduling/matchDisplay/Match";

function SchedulingPage() {

    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "");

    let [teams] = useLocalStorage<team[]>(TEAMS(currentEvent), []);

    let [blackList, setBlackList] = useLocalStorage<team[]>(BLACKLIST(currentEvent),[])

    let [matches] = useLocalStorage<Match[]>(MATCHES(currentEvent), [])

    let [schedule, setSchedule] = useState(new Schedule(["Quals 1"], ["test"], [], matches, blackList));

    //If the schedule changes more than twice, it should have been edited
    let [timesScheduleChanged, setTimeScheduleChanged] = useState(0)
    
    useEffect(() => {
       setTimeScheduleChanged(timesScheduleChanged + 1)
    }, [schedule]);

    let [savedToDatabase, setSavedToDatabase] = useState(false)

    //Load whatever schedule is currently saved to the API
    useEffect(() => {

        schedule.setNumMatches(matches.length)
        setSchedule(schedule)

        Pull(scheduleDetails(currentEvent), (data) => {
            let loadedSchedule = Schedule.fromJson(data, matches, blackList)
            setSavedToDatabase(true)
            setSchedule(loadedSchedule);
        }).then(() => {})

    }, [currentEvent])


    return(
        <div>
            <AppHeader/>
            <FormPrompt hasUnsavedChanges={timesScheduleChanged > 2}/>
            <div className={"scheduling-page-container"}>
                <MatchSchedulingDisplay schedule={schedule} setSchedule={setSchedule}/>
                <ScouterDisplay schedule={schedule} setSchedule={setSchedule}/>
                <ScheduleOverview schedule={schedule}
                                  setSchedule={setSchedule}
                                  savedToDatabase={savedToDatabase}
                                  onSaveHook={() => setTimeScheduleChanged(0)}
                                  teams={teams}
                                  blacklist={blackList}
                                  setBlackList={setBlackList}
                />
            </div>

        </div>
    )

}

export default SchedulingPage;