import React, {useEffect, useState} from "react";
import Header from "../components/header/Header";
import {Dropdown} from "semantic-ui-react";
import {DropDownOptions} from "../components/scheduling/matchDisplay/ScheduleData";
import "./ConfigPage.css"
import {useLocalStorage} from "usehooks-ts";
import APIOptionsTable from "../components/config/APIOptionsTable";
import GameConfigsDisplay from "../components/config/GameConfigsDisplay";
import {GameConfig} from "../components/config/GameConfig";
import {Pull} from "../util/APIUtil";
import GameConfigEditor from "../components/config/GameConfigEditor";


function ConfigPage() {

    let [APIs, setAPIs] = useLocalStorage("apis", ["localhost:3000"])
    let [activeAPIChoice, setActiveChoice] = useLocalStorage("activeAPI", "localhost:3000")

    let [addAPI, setAddAPI] = useState("")

    let [gameConfigs, setGameGameConfigs] = useState<GameConfig[]>([])
    let [activeConfig, setActiveConfig] = useState<GameConfig>(new GameConfig("none", 2000, []));


    let handleNewActiveConfig = (newItem:GameConfig) => {

        gameConfigs[gameConfigs.indexOf(activeConfig)] = newItem

        setGameGameConfigs(Object.create(gameConfigs))

        setActiveConfig(newItem)
    }

    useEffect(() => {
        Pull(activeAPIChoice, "game-configs", (e) => {

            let newConfigs:GameConfig[] = []

            e.configs.forEach((e:any) => {
                newConfigs.push(GameConfig.fromJson(e))
            })


            setGameGameConfigs(newConfigs);
        })
    }, [activeAPIChoice])

    let options = APIs.map(e => new DropDownOptions(e))

    let handleAddAPIOption = () => {
        if(addAPI !== "" && APIs.indexOf(`http://${addAPI}`) === -1) {

            let toAdd = addAPI;

            if(addAPI.indexOf("http://") === -1 && addAPI.indexOf("https://") === -1) toAdd = `http://${addAPI}`

            APIs.push(toAdd)
            setAPIs([...APIs])
        }
    }

    return(
        <div>
            <Header/>

            <div className={"config-content"}>
                <div className={"left-column"}>
                    <div className={"inline"}>
                        <h3 className={"give-text-padding"}>Current API Source</h3>
                        <Dropdown
                            floating
                            labeled
                            options={options}
                            selection
                            clearable
                            value={activeAPIChoice}
                            onChange={(e, data) => setActiveChoice(data.value as string)}
                            placeholder={"Select API Source"}
                        />
                    </div>

                    <APIOptionsTable onSubmit={handleAddAPIOption} addAPI={addAPI} setAddAPI={setAddAPI}
                                     setAPIOptions={setAPIs} apiOptions={APIs}/>

                    <GameConfigsDisplay configs={gameConfigs} activeConfig={activeConfig} setActiveConfig={handleNewActiveConfig}/>
                </div>
                <div className={"middle-column"}>
                    <GameConfigEditor config={activeConfig} setConfig={handleNewActiveConfig}/>
                </div>
            </div>
        </div>
    )
}

export default ConfigPage

