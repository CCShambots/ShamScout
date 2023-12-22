import {Button, Icon} from "semantic-ui-react";
import React from "react";
import {useLocalStorage} from "usehooks-ts";

export default function SelectAPIType() {
    const [useLocalAPI, setUseLocalAPI] = useLocalStorage("use-local-api", true)

    return (
        <Button.Group>
            <Button color={"blue"} disabled={useLocalAPI} onClick={() => {
                setUseLocalAPI(true)
            }}>

                <Icon name={"laptop"}/> Local API Host {useLocalAPI ? "(Active)" : "(Recommended)"}
            </Button>
            <Button.Or/>
            <Button color={"purple"} disabled={!useLocalAPI} onClick={() => {
                setUseLocalAPI(false)
            }}>
                <Icon name={"cloud"}/> Remote API Host {useLocalAPI ? "" : "(Active)"}
            </Button>
        </Button.Group>
    )
}