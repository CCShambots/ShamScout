import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import "./ConfigPage.css"
import GameConfigsDisplay from "../components/config/GameConfigsDisplay";
import {GameConfig} from "../components/config/GameConfig";
import {AddTemplate, ModifyTemplate, Pull, RemoveTemplate} from "../util/APIUtil";
import GameConfigEditor from "../components/config/GameConfigEditor";
import {Button, Dimmer, Icon, Input} from "semantic-ui-react";
import {useLocalStorage} from "usehooks-ts";
import TeamsInEventDisplay from "../components/config/TeamsInEventDisplay";
import QRCode from "react-qr-code";

function ConfigPage() {

    let [activeTemplateKey, setActiveTemplateKey] = useLocalStorage("active-template", "")

    let [templates, setTemplates] = useState<GameConfig[]>([]);
    let [activeTemplate, updateActiveTemplate] = useState<GameConfig>(new GameConfig("", 0, []));

    let [event, setEvent] = useLocalStorage("current-event", "");
    let [TBAKey, setTBAKey] = useLocalStorage("tba-key", "");

    let [eventCodeDimmerActive, setEventCodeDimmerActive] = useState(false)

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
        Pull("templates", async (e) => {

            let newTemplates:GameConfig[] = []

            await Promise.all(e.map(async (element:any) =>
                await Pull(`templates/${element}`,
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
            <Header/>

            <div className={"config-content"}>
                <div className={"left-column"}>
                    <div className={"inline-qr-code"}>
                        <Button icon={"qrcode"} color={"blue"} onClick={() => setEventCodeDimmerActive(true)}/>
                        <div className={"full-length-form"}>
                            <Input placeholder={'Set Event'} value={event} onChange={(e) => setEvent(e.target.value)}/>
                            <Input placeholder={'Set TBA API Key'} value={TBAKey} onChange={(e) => setTBAKey(e.target.value)}/>
                        </div>
                    </div>
                    <GameConfigsDisplay
                        templates={templates}
                        addNewTemplate={(temp) => {
                            templates.push(temp)
                            setTemplates([...templates])

                            AddTemplate(temp)
                        }}
                        modifyTemplate={async (temp) => {


                            let success = await ModifyTemplate(temp)

                            if(success) {
                                temp.setUploaded()
                                setTemplates([...templates])
                            }
                        }}
                        removeTemplate={(name:string) => {
                            setTemplates(templates.filter((e) => name !== e.name))

                            RemoveTemplate(name)
                        }}
                        activeTemplate={activeTemplate}
                        setActiveTemplate={setActiveTemplate}
                    />
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
                        <h1 className={"config-qr-code-header-text"}>Config QR Code</h1>
                        <Button
                            className={"qr-code-close-button"}
                            icon={"x"}
                            color={"red"}
                            onClick={() => setEventCodeDimmerActive(false)}
                        />
                    </div>

                    <QRCode value={`eve:${event}`}/>

                </div>

            </Dimmer>
        </div>
    )
}

export default ConfigPage

