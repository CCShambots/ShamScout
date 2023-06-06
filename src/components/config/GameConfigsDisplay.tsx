import React from "react";
import {Table} from "semantic-ui-react";
import {GameConfig} from "./GameConfig";

export default function GameConfigsDisplay(props: {
    configs:GameConfig[],
    activeConfig:GameConfig,
    setActiveConfig:(e:GameConfig) => void
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
                    props.configs.map(e => {

                        let active = e === props.activeConfig;

                        return <Table.Row key={e.title} onClick={() => props.setActiveConfig(e)} >
                            <Table.Cell className={"game-config-cell " + (active ? "active-config-cell" : "")}>
                                <p>{e.title}</p>
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