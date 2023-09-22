import {Button, Dimmer, Header} from "semantic-ui-react";
import {useEffect, useState} from "react";
import packageJson from "../../package.json"
import {IsNewRelease, NewReleaseDetails} from "../util/APIUtil";

export function NewVersionChecker() {

    let [dimmerOpen, setDimmerOpen] = useState(false)

    let [newReleaseDetails, setNewReleaseDetails]
        = useState<NewReleaseDetails>( {isNew: false, body:"", value:packageJson.version})

    useEffect(() => {

        IsNewRelease(packageJson.version).then((value) => {
            setNewReleaseDetails(value)
            setDimmerOpen(value.isNew)
        })
    }, []);

    return <Dimmer active={dimmerOpen} onClickOutside={() => setDimmerOpen(false)}>
        <Header inverted>New Version Available: {newReleaseDetails.value}! (You are running {packageJson.version})</Header>
        <Header inverted>Changes in this release: </Header>
        <p>
            {newReleaseDetails.body}
        </p>
        <Button color={"green"} onClick={() => {
            window.open("https://github.com/CCShambots/ShamScout/releases/latest")
        }}>Download Here</Button>
    </Dimmer>
}