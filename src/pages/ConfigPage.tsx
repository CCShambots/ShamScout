import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import "./ConfigPage.css"
import GameConfigsDisplay from "../components/config/GameConfigsDisplay";
import {GameConfig} from "../components/config/GameConfig";
import {Pull, PullTBA} from "../util/APIUtil";
import GameConfigEditor from "../components/config/GameConfigEditor";
import {Button, Dimmer, Icon, Input, Segment, Table} from "semantic-ui-react";
import {useLocalStorage} from "usehooks-ts";
import TeamLink from "../components/team-link/TeamLink";
import TeamsInEventDisplay from "../components/config/TeamsInEventDisplay";

function ConfigPage() {

    let [activeTemplateKey, setActiveTemplateKey] = useLocalStorage("active-template", "")

    let [templates, setTemplates] = useState<GameConfig[]>([]);
    let [activeTemplate, updateActiveTemplate] = useState<GameConfig>(new GameConfig("", 0, []));

    let [event, setEvent] = useLocalStorage("current-event", "");
    let [TBAKey, setTBAKey] = useLocalStorage("tba-key", "");


    let setActiveTemplate = (newItem:GameConfig) => {
        updateActiveTemplate(newItem)
        setActiveTemplateKey(newItem.name)
    }

    let handleNewActiveTemplate = (newItem:GameConfig) => {

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
                    <Input placeholder={'Set Event'} value={event} onChange={(e) => setEvent(e.target.value)}/>
                    <Input placeholder={'Set TBA API Key'} value={TBAKey} onChange={(e) => setTBAKey(e.target.value)}/>
                    <GameConfigsDisplay templates={templates} activeTemplate={activeTemplate} setActiveTemplate={setActiveTemplate}/>
                </div>
                <div className={"middle-column"}>
                    <TeamsInEventDisplay/>
                </div>
                <div className={"right-column"}>
                    <GameConfigEditor template={activeTemplate} setTemplate={handleNewActiveTemplate}/>
                </div>
            </div>
        </div>
    )
}

export default ConfigPage

