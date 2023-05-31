import React, {useState} from "react";
import Header from "../components/header/Header";
import MatchSchedulingDisplay from "../components/scheduling/matchDisplay/MatchSchedulingDisplay";
import {Schedule} from "../components/scheduling/matchDisplay/ScheduleData";
import ScouterDisplay from "../components/scheduling/scouterDisplay/ScouterDisplay";

function SchedulingPage() {

    let [schedule, setSchedule] = useState(new Schedule(
        [
            "Quals 1",
            "Quals 2",
            "Quals 3",
            "Quals 4",
            "Quals 5"
        ],
        [],
        []
    ));



    schedule.addScouters(
        [
            "Barta",
            "Voth",
            "Wolfe",
            "Harrison",
            "Brodzinski",
            "Dobson"
        ]
    )

    return(
        <div>
            <Header/>

            <MatchSchedulingDisplay schedule={schedule}/>
            <ScouterDisplay scouters={schedule.scouters}/>

        </div>
    )

}

export default SchedulingPage;