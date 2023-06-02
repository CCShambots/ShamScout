import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import MatchSchedulingDisplay from "../components/scheduling/matchDisplay/MatchSchedulingDisplay";
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";
import ScouterDisplay from "../components/scheduling/scouterDisplay/ScouterDisplay";

import "./SchedulingPage.css"
import ScheduleOverview from "../components/scheduling/overview/ScheduleOverview";

function SchedulingPage() {

    let [schedule, setSchedule] = useState(new Schedule(
        [
            "Quals 1",
            "Quals 2",
            "Quals 3",
            "Quals 4",
            "Quals 5",
            "Quals 6",
            "Quals 7",
            "Quals 8",
            "Quals 9",
            "Quals 10",
            "Quals 11",
            "Quals 12",
            "Quals 13",
            "Quals 14",
            "Quals 15",
            "Quals 16",
            "Quals 17",
            "Quals 18",
            "Quals 19",
            "Quals 20",
            "Quals 21",
            "Quals 22",
        ],
        ["Barta",
            "Voth",
            "Wolfe",
            "Harrison",
            "Brodzinski",
            "Dobson",
            "Dankert",
            "Guo",
            "Harvey",
            "Ibegbu",
            "Naida",
            "Schenk",
            "Terhaar",
        ],
        []
    ));


    return(
        <div>
            <Header/>
            <div className={"scheduling-page-container"}>
                <MatchSchedulingDisplay schedule={schedule} setSchedule={setSchedule}/>
                <ScouterDisplay schedule={schedule} setSchedule={setSchedule}/>
                <ScheduleOverview schedule={schedule} setSchedule={setSchedule}/>
            </div>

        </div>
    )

}

export default SchedulingPage;