import {Button, Form, Icon, Table} from "semantic-ui-react";
import React from "react";
export default function APIOptionsTable(props: {
    onSubmit: () => void,
    addAPI:string,
    setAddAPI: (e:string) => void,
    apiOptions: string[],
    setAPIOptions: (e:string[]) => void
}) {

    return <Table className={"api-options-table"}>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>API Options</Table.HeaderCell>
                <Table.HeaderCell>
                    <div className={"api-list-header"}>
                        <Form onSubmit={props.onSubmit}>
                            <Form.Input onChange={(e, data) => props.setAddAPI(data.value)}
                                        placeholder={"Enter New API"}
                            />
                        </Form>
                        <div/>
                    </div>
                </Table.HeaderCell>
            </Table.Row>

        </Table.Header>

        <Table.Body>
            {
                props.apiOptions.map(e =>
                    <Table.Row key={e}>
                        <Table.Cell>{e}</Table.Cell>
                        <Table.Cell className={"center-api-remove-button"}>
                            <Button color={"red"} animated={"vertical"}
                                    onClick={() => {
                                        if (props.apiOptions.length > 1) {

                                            console.log(props.apiOptions)
                                            console.log(e)

                                            props.setAPIOptions(props.apiOptions.filter((element) => element !== e))
                                        }
                                    }}
                            >
                                <Button.Content visible>
                                    <Icon name={"minus"}/>
                                </Button.Content>
                                <Button.Content hidden>
                                    Remove
                                </Button.Content>
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                )
            }

        </Table.Body>
    </Table>;
}