import React, {useEffect, useState} from "react";
import "./ConfigPage.css"
import GameConfigsDisplay from "../components/config/GameConfigsDisplay";
import {GameConfig} from "../components/config/GameConfig";
import {AddTemplate, ModifyTemplate, Pull, RemoveTemplate} from "../util/APIUtil";
import GameConfigEditor from "../components/config/GameConfigEditor";
import {Button, Dimmer, Header, Input} from "semantic-ui-react";
import {useLocalStorage} from "usehooks-ts";
import TeamsInEventDisplay from "../components/config/TeamsInEventDisplay";
import QRCode from "react-qr-code";
import AppHeader from "../components/header/AppHeader";

function ConfigPage() {

    let [activeTemplateKey, setActiveTemplateKey] = useLocalStorage("active-template", "")

    let [templates, setTemplates] = useState<GameConfig[]>([]);
    let [activeTemplate, updateActiveTemplate] = useState<GameConfig>(new GameConfig("", 0, []));

    let [event, setEvent] = useLocalStorage("current-event", "");
    let [TBAKey, setTBAKey] = useLocalStorage("tba-key", "");
    let [remoteAPIAddress, setRemoteAPIAddress] = useLocalStorage("api-address", "");

    let [eventCodeDimmerActive, setEventCodeDimmerActive] = useState(false)
    let [apiAddressDimmerActive, setApiAddressDimmerActive] = useState(false)

    let [clearDataDimmerActive, setClearDataDimmerActive] = useState(false)

    let [clearDataAllowed, setClearDataAllowed] = useState(false)

    const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("")
    const deleteString = "I'm sure I know what I'm doing"

    useEffect(() => {
        if(!clearDataDimmerActive) {
            setDeleteConfirmationValue("")
            setClearDataAllowed(false)
        }
    }, [clearDataDimmerActive])

    useEffect(() => {
        if(deleteConfirmationValue === deleteString) setClearDataAllowed(true)
    }, [deleteConfirmationValue]);

    let setActiveTemplate = (newItem:GameConfig) => {
        updateActiveTemplate(newItem)
        setActiveTemplateKey(newItem.name)
    }

    let handleNewActiveTemplate = (newItem:GameConfig) => {

        newItem.setEdited()

        templates[templates.indexOf(activeTemplate)] = newItem

        setTemplates(Object.create(templates))

        setActiveTemplate(newItem)
    }

    useEffect(() => {
        Pull("templates/get", async (e) => {

            let newTemplates:GameConfig[] = []

            await Promise.all(e.map(async (element:any) =>
                await Pull(`templates/get/name/${element}`,
                    (info) => {
                        newTemplates.push(GameConfig.fromJson(info))
                    }
                )
            ))

            setTemplates(newTemplates)

            let activeTemplates = newTemplates.filter(e => e.name === activeTemplateKey)

            if(activeTemplates.length > 0) {
                setActiveTemplate(activeTemplates[0])
            }

        }).then(() => {
        })
    }, [])

    return(
        <div>
            <AppHeader/>

            <div className={"config-content"}>
                <div className={"left-column"}>
                    <div className={"inline-qr-code"}>
                        <Button icon={"qrcode"} color={"blue"} onClick={() => setEventCodeDimmerActive(true)}/>
                        <div className={"full-length-form"}>
                            <Input placeholder={'Set Event'} value={event} onChange={(e) => setEvent(e.target.value)}/>
                            <Input placeholder={'Set TBA API Key'} value={TBAKey} onChange={(e) => setTBAKey(e.target.value)}/>
                        </div>
                    </div>
                    <div className={"inline-qr-code"}>
                        <Button icon={"qrcode"} color={"blue"} onClick={() => setApiAddressDimmerActive(true)}/>
                        <div className={"full-length-form"}>
                            <Input placeholder={'Set API Host'} value={remoteAPIAddress} onChange={(e) => setRemoteAPIAddress(e.target.value)}/>
                        </div>
                    </div>
                    <GameConfigsDisplay
                        templates={templates}
                        addNewTemplate={(temp) => {
                            templates.push(temp)
                            setTemplates([...templates])

                            AddTemplate(temp).then(() => {})
                        }}
                        modifyTemplate={async (temp) => {

                            try {
                                let success = await ModifyTemplate(temp)
                                
                                if(success) {
                                    temp.setUploaded()
                                    setTemplates([...templates])
                                } else {
                                    temp.setErrored()
                                    setTemplates([...templates])
                                }
                            } catch (e) {
                                temp.setErrored()
                            }
                        }}
                        removeTemplate={(name:string) => {
                            setTemplates(templates.filter((e) => name !== e.name))

                            RemoveTemplate(name).then(() => {})
                        }}
                        activeTemplate={activeTemplate}
                        setActiveTemplate={setActiveTemplate}
                    />

                    <Button color={"red"} onClick={() => setClearDataDimmerActive(true)}>
                        Clear Mobile Data
                    </Button>
                </div>
                <div className={"middle-column"}>
                    <TeamsInEventDisplay/>
                </div>
                <div className={"right-column"}>
                    <GameConfigEditor template={activeTemplate} setTemplate={handleNewActiveTemplate}/>
                </div>
            </div>

            <Dimmer
                page
                active={eventCodeDimmerActive}
                onClickOutside={() => setEventCodeDimmerActive(false)}
            >
                <div className={"config-qr-code-window"}>
                    <div className={"qr-code-header"}>
                        <h1 className={"config-qr-code-header-text"}>Even Setup QR Code</h1>
                        <Button
                            className={"qr-code-close-button"}
                            icon={"x"}
                            color={"red"}
                            onClick={() => setEventCodeDimmerActive(false)}
                        />
                    </div>

                    <QRCode value={`eve:${event},${TBAKey},${activeTemplate.name}`}/>
                    <p>eve:{event},{TBAKey},{activeTemplate.name}</p>

                </div>

            </Dimmer>

            <Dimmer
                page
                active={apiAddressDimmerActive}
                onClickOutside={() => setApiAddressDimmerActive(false)}
            >
                <div className={"config-qr-code-window"}>
                    <div className={"qr-code-header"}>
                        <h1 className={"config-qr-code-header-text"}>Config QR Code</h1>
                        <Button
                            className={"qr-code-close-button"}
                            icon={"x"}
                            color={"red"}
                            onClick={() => setApiAddressDimmerActive(false)}
                        />
                    </div>

                    <QRCode value={`api:${getCorrectRemoteAddress(remoteAPIAddress)}`}/>
                    <p>api:{getCorrectRemoteAddress(remoteAPIAddress)}</p>

                </div>

            </Dimmer>

            <Dimmer
                page
                active={clearDataDimmerActive}
                onClickOutside={() => setClearDataDimmerActive(false)}
            >
                {
                    clearDataAllowed ?
                    <div className={"config-qr-code-window"}>

                            <div className={"qr-code-header"}>
                                <h1 className={"config-qr-code-header-text"}>Clear Mobile Data QR Code</h1>
                                <Button
                                    className={"qr-code-close-button"}
                                    icon={"x"}
                                    color={"red"}
                                    onClick={() => setClearDataDimmerActive(false)}
                                />
                            </div>
                            <QRCode value={`cle:`}/>

                    </div>
                        :
                    <div>
                        <Header inverted>
                            Warning! You could delete unsaved scouting reports!
                            <br/>
                            Type '{deleteString}' into the input to continue...
                        </Header>

                        <Input
                            placeholder={"Confirmation"}
                            value={deleteConfirmationValue}
                            onChange={(e) => setDeleteConfirmationValue(e.target.value)}/>
                    </div>
                }


            </Dimmer>
        </div>
    )
}

function getCorrectRemoteAddress(remoteAdress:string)  {
    if(remoteAdress[remoteAdress.length-1] !== "/") return remoteAdress + "/"
    return remoteAdress;
}

export default ConfigPage

