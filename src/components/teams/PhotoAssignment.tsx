import {Button, Dropdown, Input} from "semantic-ui-react";
import QRCode from "react-qr-code";
import React, {useEffect, useState} from "react";
import packageJson from "../../../package.json";
import {useLocalStorage} from "usehooks-ts";

type assignmentOptions = {
    allTeams:number[],
    teamsWithoutPhotos:number[],
    teamsWithOldPhotos:number[],
    setQRDimmerActive:(val:boolean) => void
}

const options = [
    {key: 'all', text:"Assign every team at the event", value: 'all'},
    {key: 'old', text:"Assign only teams with old images", value: 'old'},
    {key: 'new', text:"Assign only teams with no image", value: 'new'},
]

export default function PhotoAssignment({allTeams, teamsWithoutPhotos, teamsWithOldPhotos, setQRDimmerActive}: assignmentOptions) {

    const [numPitScouters, setNumPitScouters] = useState(1)

    console.log(teamsWithoutPhotos.length)

    const [teams, setTeams] = useState(allTeams)
    const [currentTeamOption, setCurrentTeamOption] = useState("all")

    let [pitScoutSchedules, setPitScoutSchedules] = useState<String[]>([])
    let [currentPitScout, setCurrentPitScout] = useState(0)

    let versionYear=  packageJson.version.substring(0, 4);

    let [currentEvent] = useLocalStorage("current-event", "")

    let [yearToUse, setYearToUse] = useState(versionYear)

    useEffect(() => {
        if(parseInt(currentEvent.substring(0, 4))) {
            setYearToUse(currentEvent.substring(0, 4))
        } else {
            setYearToUse(versionYear)
        }
    }, []);

    useEffect(() => {
        switch (currentTeamOption) {
            case "all":
                setTeams(allTeams)
                break;
            case "new":
                setTeams(teamsWithoutPhotos)
                break;
            case "old":
                setTeams(teamsWithOldPhotos)
                break;
        }

        console.log("did a thing")
    }, [currentTeamOption, allTeams, teamsWithoutPhotos, teamsWithOldPhotos]);

    useEffect(() => {
        console.log("regenerating")
        let pitScoutArray:String[]= Array(numPitScouters).fill("")

        let index = 0;

        teams.forEach(e => {
            pitScoutArray[index] += `${e},`

            index = index < pitScoutArray.length-1 ? index+1 : 0
        })

        let shortenedArray =pitScoutArray.map(e => e.substring(0, e.length-1))

        setPitScoutSchedules(shortenedArray)

    }, [numPitScouters, teams]);

    return(
        <div className={"config-qr-code-window"}>

            <div className={"qr-code-header"}>
                <h1 className={"config-qr-code-header-text"}>Team Photo QR Code</h1>
                <Button className={"qr-code-close-button"} icon={"close"} onClick={() => setQRDimmerActive(false)}>
                </Button>
            </div>

            <div className={"inline-input"}>
                <div className={"input-text-container"}>
                    <h3 className={"input-text"}>Number of Pit Scouters</h3>
                </div>
                <Input
                    value={numPitScouters}
                    onChange={(event) => {
                        let result = parseInt(event.target.value)
                        if(result && result < teams.length) {
                            setNumPitScouters(parseInt(event.target.value))
                        } else if (event.target.value === "") {
                            setNumPitScouters(0);
                        }
                    }
                    }/>
            </div>

            <Dropdown
                options={options}
                selection
                defaultValue={"all"}
                onChange={(event, data) => {
                    setCurrentTeamOption(data.value as string)
                }}
            />

            <br/>
            <br/>
            <QRCode value={`pho:${yearToUse};${pitScoutSchedules[currentPitScout]}`}/>

            <h3>Using Year: {yearToUse}</h3>

            <div className={"inline-arrows"}>
                <Button icon={"arrow left"} onClick={() => {
                    if(currentPitScout > 0) {
                        setCurrentPitScout(currentPitScout-1)
                    }
                }}/>
                <h3>{currentPitScout+1} of {numPitScouters}</h3>
                <Button icon={"arrow right"} onClick={() => {
                    if(currentPitScout < numPitScouters-1) {
                        setCurrentPitScout(currentPitScout+1)
                    }
                }}/>
            </div>
        </div>
    )
}