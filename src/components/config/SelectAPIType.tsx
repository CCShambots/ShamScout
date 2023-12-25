import {Button, Icon, Input} from "semantic-ui-react";
import React from "react";
import {useLocalStorage} from "usehooks-ts";
import {defaultRemoteAPIAddress, remoteAPIAddress} from "../../util/APIUtil";
import {API_HOST_ADDRESS, USE_LOCAL_API} from "../../util/LocalStorageConstants";

export default function SelectAPIType() {
    const [useLocalAPI, setUseLocalAPI] = useLocalStorage(USE_LOCAL_API, true)
    const [apiHostAddress, setApiHostAddress] = useLocalStorage(API_HOST_ADDRESS, remoteAPIAddress)

    return (
        <div>
            <Button.Group fluid>
                <Button color={"blue"} disabled={useLocalAPI} onClick={() => {
                    setUseLocalAPI(true)
                }}>

                    <Icon name={"laptop"}/> Local {useLocalAPI ? "(Active)" : ""}
                </Button>
                <Button.Or/>
                <Button color={"purple"} disabled={!useLocalAPI} onClick={() => {
                    setUseLocalAPI(false)
                }}>
                    <Icon name={"cloud"}/> Remote {useLocalAPI ? "" : "(Active)"}
                </Button>
            </Button.Group>
            <Input fluid placeholer={"Set API Host Address"} value={apiHostAddress} onChange={(e) => {
                let value = e.target.value
                if(value[value.length - 1] !== "/") {
                    value+= "/"
                }
                setApiHostAddress(value)
            }}/>
            <Button fluid color={"red"} onClick={() => {
                setApiHostAddress(defaultRemoteAPIAddress)
            }}>
                <Icon name={"redo"}/>Reset to Default Host
            </Button>
        </div>
    )
}