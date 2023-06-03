import React, {useState} from "react";
import Header from "../components/header/Header";
import {Button, Dropdown, Form, Icon, Table} from "semantic-ui-react";
import {DropDownOptions} from "../components/scheduling/matchDisplay/ScheduleData";
import "./ConfigPage.css"
import {useLocalStorage} from "usehooks-ts";

function ConfigPage() {

    let [APIs, setAPIs] = useLocalStorage("apis", ["localhost:3000"])
    let [activeChoice, setActiveChoice] = useLocalStorage("activeAPI", "localhost:3000")

    let [addAPI, setAddAPI] = useState("")

    let options = APIs.map(e => new DropDownOptions(e))

    let handleAddAPIOption = () => {
        if(addAPI !== "" && APIs.indexOf(addAPI) === -1) {

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
                <div className={"inline"}>
                    <h3 className={"give-text-padding"}>Current API Source</h3>
                    <Dropdown
                        floating
                        labeled
                        options={options}
                        selection
                        clearable
                        value={activeChoice}
                        onChange={(e,data) => setActiveChoice(data.value as string)}
                        placeholder={"Select API Source"}
                    />
                </div>

                <Table className={"api-options-table"}>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>API Options</Table.HeaderCell>
                            <Table.HeaderCell>
                                <div className={"api-list-header"}>
                                    <Form onSubmit={handleAddAPIOption}>
                                        <Form.Input onChange={(e, data) => setAddAPI(data.value)}
                                               placeholder={"Enter New API"}
                                        />
                                    </Form>
                                    <div/>
                                </div>
                            </Table.HeaderCell>
                        </Table.Row>

                        {
                            APIs.map((e) =>
                                <Table.Row>
                                    <Table.Cell>{e}</Table.Cell>
                                    <Table.Cell className={"center-api-remove-button"}>
                                        <Button color={"red"} animated={"vertical"}
                                            onClick={() => {
                                                if(APIs.length > 1) {
                                                    setAPIs(APIs.filter((element) => element !== e))
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

                    </Table.Header>
                </Table>
            </div>
        </div>
    )
}

export default ConfigPage

