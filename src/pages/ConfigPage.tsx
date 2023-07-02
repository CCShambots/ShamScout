import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import "./ConfigPage.css"
import GameConfigsDisplay from "../components/config/GameConfigsDisplay";
import {GameConfig} from "../components/config/GameConfig";
import {Pull} from "../util/APIUtil";
import GameConfigEditor from "../components/config/GameConfigEditor";

function ConfigPage() {

    let [templates, setTemplates] = useState<GameConfig[]>([]);
    let [activeTemplate, setActiveTemplate] = useState<GameConfig>(new GameConfig("", 0, []));

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

        }).then(() => {
        })
    }, [])

    return(
        <div>
            <Header/>

            <div className={"config-content"}>
                <div className={"left-column"}>

                    <GameConfigsDisplay templates={templates} activeTemplate={activeTemplate} setActiveTemplate={setActiveTemplate}/>
                </div>
                <div className={"middle-column"}>
                    <GameConfigEditor template={activeTemplate} setTemplate={handleNewActiveTemplate}/>
                </div>
            </div>
        </div>
    )
}

export default ConfigPage

