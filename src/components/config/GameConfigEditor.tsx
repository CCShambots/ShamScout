import React, {useState} from "react";
import {ConfigItem, GameConfig, ItemType} from "./GameConfig";
import {
    Button,
    Checkbox,
    Dimmer,
    Dropdown,
    Icon,
    Input,
    Popup,
    SegmentInline,
    Table,
    Transition
} from "semantic-ui-react";
import "./GameConfigEditor.css"
import {DropDownOptionsAltText} from "../scheduling/matchDisplay/ScheduleData";
import QRCode from "react-qr-code";

export default function GameConfigEditor(
    props: {
        config:GameConfig,
        setConfig:(e:GameConfig) => void
    }
    ) {

    let options:DropDownOptionsAltText[] = []

    function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
        return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
    }

    for (const value of enumKeys(ItemType)) {
        options.push(new DropDownOptionsAltText(ItemType[value], ItemType[value]))
    }

    let [qrDimmer, setQRDimmer] = useState(false)

    return (
        <div>
            <Table className={"game-config-editor"}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell colSpan={"3"}>
                            {props.config.title}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Button animated={"vertical"} onClick={() => setQRDimmer(true)}>
                                <Button.Content visible><Icon name={"qrcode"}/></Button.Content>
                                <Button.Content hidden>QR Code</Button.Content>
                            </Button>
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            <Button animated={"vertical"} onClick={() => {

                                props.config.items.push(new ConfigItem("title"))

                                props.setConfig(Object.create(props.config))
                            }}>
                                <Button.Content visible> <Icon name={"add"}/></Button.Content>
                                <Button.Content hidden>Create</Button.Content>
                            </Button>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                        {
                            props.config.items.map(e => {
                                return <FormItem item={e} options={options} config={props.config} setConfig={props.setConfig}/>
                            })
                        }
                </Table.Body>
            </Table>

            <Dimmer page active={qrDimmer} onClickOutside={() => setQRDimmer(false)}>
                <div className={"qr-code-window"}>
                    <div className={"qr-code-header"}>
                        <h1 className={"qr-code-header-text"}>Config QR Code</h1>
                        <Button className={"qr-code-close-button"} animated={"vertical"} onClick={() => setQRDimmer(false)}>
                            <Button.Content hidden>Close</Button.Content>
                            <Button.Content visible><Icon name={"x"}/></Button.Content>
                        </Button>
                    </div>

                    <QRDisplay config={props.config}/>

                </div>
            </Dimmer>
        </div>
    )

}

function QRDisplay(props: {
    config:GameConfig
}) {

    let code = props.config.generateJSON()

    return(
        <div>
            <QRCode value={code} className={"qr-code"}/>
            <p>{code}</p>

        </div>
    )

}

function FormItem(props: {
    item: ConfigItem,
    options: DropDownOptionsAltText[],
    config: GameConfig,
    setConfig: (e:GameConfig) => void
}) {

    let [useMin, setUseMin] = useState(props.item.min !== -1)
    let [useMax, setUseMax] = useState(props.item.max !== -1)

    return <Table.Row className={(props.item.type === ItemType.title ? " item-type-title " : "")}>
        <Table.Cell>
            <Button icon={"trash alternate"} color={"red"} onClick={() => {

                props.setConfig(props.config.removeItem(props.item))
            }}></Button>
        </Table.Cell>
        <Table.Cell className={"item-type-dropdown"}>
            <Dropdown
                options={props.options}
                value={props.item.type}
                selection
                // clearable
                onChange={(event, {value}) => {
                    let str = value as string
                    str = str.replace(" ", "_")
                    str = str.toLowerCase();
                    props.item.setType(str)
                    props.setConfig(Object.create(props.config))
                }}
            />
        </Table.Cell>
        <Table.Cell>
            <Input
                placeholder={"label"}
                value={props.item.label}
                onChange={(event, data) => {
                    props.item.label = data.value
                    props.setConfig(Object.create(props.config))
                }}
            />
        </Table.Cell>
        <Table.Cell>
            {
                props.item.type === ItemType.rating ?
                    <Popup
                        pinned
                        on={"click"}
                        trigger={
                            <Button icon={"setting"}/>
                        }
                    >
                        <SegmentInline>
                            <Checkbox
                                checked={useMin}
                                toggle
                                label={"min"}
                                onChange={(e, data) => {
                                    setUseMin(data.checked ?? false)
                                }}
                            />
                            <Input type={"number"} disabled={!useMin} placeholder={"min"} value={props.item.min}
                                onChange={(event, data) => {
                                    props.item.min = +data.value
                                    props.setConfig(Object.create(props.config))
                                }}
                            />
                        </SegmentInline>
                        <div></div>
                        <SegmentInline>
                            <Checkbox
                                checked={useMax}
                                toggle
                                onChange={(e, data) =>
                                    {setUseMax(data.checked ?? false)}
                                }
                                label={"max"}
                            />
                            <Input type={"number"} disabled={!useMax} placeholder={"max"} value={props.item.max}
                                   onChange={(event, data) => {
                                       props.item.max = +data.value

                                       props.setConfig(Object.create(props.config))
                                   }}
                            />
                        </SegmentInline>


                    </Popup>
                    : <div/>
            }
        </Table.Cell>
        <Table.Cell>
            <Button
                icon={"arrow up"}
                onClick={() => {
                    props.setConfig(props.config.swap(props.item, true))
                }}
                disabled={props.config.items.indexOf(props.item) === 0}
            />
            <Button
                icon={"arrow down"}
                onClick={() => {
                    props.setConfig(props.config.swap(props.item, false))
                }}
                disabled={props.config.items.indexOf(props.item) === props.config.items.length - 1}
            />
        </Table.Cell>
    </Table.Row>;
}