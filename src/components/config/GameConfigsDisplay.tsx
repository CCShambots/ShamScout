import React, {useEffect, useState} from "react";
import {Button, Dimmer, Header, Icon, Input, Popup, Segment, Table} from "semantic-ui-react";
import {GameConfig} from "./GameConfig";
import packageJson from "../../../package.json";

export default function GameConfigsDisplay(props: {
    templates:GameConfig[],
    addNewTemplate:(template:GameConfig) => void,
    modifyTemplate:(template:GameConfig) => void,
    removeTemplate:(name:string) => void,
    activeTemplate:GameConfig,
    setActiveTemplate:(e:GameConfig) => void
}) {

    const [addDimmerActive, setAddDimmerActive] = useState(false);

    const [addName, setAddName] = useState("");
    const [legalAddName, setLegalAddName] = useState(true)

    const [removeTemplateDimmer, setRemoveTemplateDimmer] = useState(false)
    const [removeTemplateName, setRemoveTemplateName] = useState("")

    const [deleteConfirmationValue, setDeleteConfirmationValue] = useState("")
    const deleteString = "I'm sure I know what I'm doing"

    useEffect(() => {
        if(props.templates.map(e => e.name).includes(addName)) {
            setLegalAddName(false)
        } else {
            setLegalAddName(true)
        }
    }, [addName, props.templates]);

    let year=  parseInt(packageJson.version.substring(0, 4));

    const createConfig = () => {
        if(legalAddName) {

            const config = new GameConfig(addName, year, [])
            props.addNewTemplate(config)
            setAddName("")
            setAddDimmerActive(false)
        }
    }

    let legalTemplate = props.activeTemplate.isLegal()

    return(
        <Dimmer.Dimmable as={Segment} dimmed={addDimmerActive} onKeyDown={(e:any) => {
            if(e.key === "Enter" && addDimmerActive) createConfig()
            else if(e.key ==="Escape" && addDimmerActive) setAddDimmerActive(false)
        }}>

            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell colSpan={3}>Form Templates</Table.HeaderCell>
                        <Table.HeaderCell>
                            <Button icon={"plus circle"} color={"green"} onClick={() => setAddDimmerActive(true)}/>
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Popup
                                trigger={
                                    <div>

                                        <Button
                                            disabled={!legalTemplate}
                                            icon={"upload"}
                                            color={"blue"}
                                            onClick={() => {
                                                //Only send the template if it's legal
                                                if(legalTemplate) props.modifyTemplate(props.activeTemplate)
                                            }}
                                        />
                                    </div>
                                }
                                content={
                                    legalTemplate ?
                                    "Upload the active template." :
                                    "Your template has errors! Make sure it has no duplicate labels or empty labels"
                                }
                            />
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {
                        props.templates.map(e => {

                            let active = e === props.activeTemplate;

                            return <Table.Row key={`${e.name}`} onClick={() => props.setActiveTemplate(e)} className={"game-config-cell " + (active ? "active-config-cell" : "")}>
                                <Table.Cell>
                                    {e.getStatusIcon()}
                                </Table.Cell>
                                <Table.Cell >
                                    <p>{e.name}</p>
                                </Table.Cell>
                                <Table.Cell>
                                    <p>{e.year}</p>
                                </Table.Cell>
                                <Table.Cell>
                                    <p>{e.getNumberInputFields()} Input Fields</p>
                                </Table.Cell>
                                <Table.Cell>
                                    <Button icon={"trash alternate"} color={"red"} onClick={() => {
                                        setRemoveTemplateName(e.name)
                                        setRemoveTemplateDimmer(true)
                                    }}></Button>
                                </Table.Cell>
                            </Table.Row>
                        }
                        )
                    }
                </Table.Body>


            </Table>

            <Dimmer active={addDimmerActive} onClickOutside={() => setAddDimmerActive(false)}>
                <div
                    style={{display: "flex"}}
                >
                    <Input
                        placeholder={"Config Name..."}
                        value={addName}
                        onChange={(event) => setAddName(event.target.value)}
                        error={!legalAddName}
                    />
                    <Button color={"green"} onClick={() => {
                        createConfig()
                    }}>Create</Button>
                </div>
            </Dimmer>


            <Dimmer page active={removeTemplateDimmer} onClickOutside={() => setRemoveTemplateDimmer(false)}>
                <Header inverted>
                    Warning! You are about to delete the "{removeTemplateName}" template(Forever!)
                    <br/>
                    Type '{deleteString}' into the input to continue...
                </Header>

                <Input
                    placeholder={"Confirmation"}
                    value={deleteConfirmationValue}
                    onChange={(e) => setDeleteConfirmationValue(e.target.value)}/>

                <Button
                    color={"red"}
                    size={"massive"}
                    disabled={deleteString !== deleteConfirmationValue}
                    onClick={() => {
                        props.removeTemplate(removeTemplateName)
                        setRemoveTemplateDimmer(false)
                        setDeleteConfirmationValue("")
                    }}
                >
                    <Icon name={"trash alternate"}/>DELETE
                </Button>

            </Dimmer>
        </Dimmer.Dimmable>
    )
}