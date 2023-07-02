import React from "react";
import {Table} from "semantic-ui-react";
import {GameConfig} from "./GameConfig";

export default function GameConfigsDisplay(props: {
    templates:GameConfig[],
    activeTemplate:GameConfig,
    setActiveTemplate:(e:GameConfig) => void
}) {

    return(
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Game Configs</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {
                    props.templates.map(e => {

                        let active = e === props.activeTemplate;

                        return <Table.Row key={`${e.name}`} onClick={() => props.setActiveTemplate(e)} >
                            <Table.Cell className={"game-config-cell " + (active ? "active-config-cell" : "")}>
                                <p>{e.name}</p>
                                <p>{e.year}</p>
                                <p>{e.getNumberInputFields()} Input Fields</p>
                            </Table.Cell>
                        </Table.Row>
                    }
                    )
                }
            </Table.Body>


        </Table>
    )
}