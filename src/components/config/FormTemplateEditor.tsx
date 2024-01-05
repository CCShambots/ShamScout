import React, {useState} from "react";
import {ConfigItem, FormTemplate, ItemType} from "./FormTemplate";
import {
    Button,
    Checkbox,
    Dimmer,
    Dropdown,
    Icon,
    Input,
    Popup,
    SegmentInline,
} from "semantic-ui-react";
import "./FormTemplateEditor.css"
import {DropDownOptionsAltText} from "../scheduling/matchDisplay/ScheduleData";
import {QRDisplay, splitString} from "../../util/QRUtil";
import {ReactSortable} from "react-sortablejs";
import {useIsMounted} from "usehooks-ts";

export default function FormTemplateEditor(
    props: {
        template:FormTemplate,
        setTemplate:(e:FormTemplate) => void
    }
    ) {

    let options:DropDownOptionsAltText[] = []

    function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
        return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
    }

    for (const value of enumKeys(ItemType)) {
        options.push(new DropDownOptionsAltText(value, value.replace("_", " ")))
    }

    let [qrDimmer, setQRDimmer] = useState(false)

    let isMounted = useIsMounted();

    return (
        <div>
            <Button.Group fluid>
                <Button color={"blue"} onClick={() => setQRDimmer(true)}>
                    <Icon name={"qrcode"}/> QR Code
                </Button>

                <Button color={"green"}
                    onClick={() => {

                        props.template.items.push(new ConfigItem("Title", props.template.items.length.toString()))

                       props.setTemplate(Object.create(props.template))
                    }}>

                    <Icon name={"add"}/> Create
                </Button>
            </Button.Group>

            <div className={"template-items"}>

                <ReactSortable
                    list={props.template.items.map(e => {return {id: props.template.items.indexOf(e), name: e.label}})}
                    setList={(e) => {
                        props.template.items = e.map(e => props.template.items.filter(ele => ele.label === e.name)[0])

                        if(isMounted()) {
                            props.setTemplate(Object.create(props.template))
                        }
                    }}
                >
                    {
                        props.template.items.map(e => {
                            return <FormItem key={props.template.items.indexOf(e)} item={e} options={options} config={props.template} setConfig={
                                props.setTemplate
                            }/>
                        })
                    }
                </ReactSortable>
            </div>

            <Dimmer page active={qrDimmer} onClickOutside={() => setQRDimmer(false)}>
                <div className={"config-qr-code-window"}>
                    <div className={"qr-code-header"}>
                        <h1 className={"config-qr-code-header-text"}>Config QR Code</h1>
                        <Button className={"qr-code-close-button"} icon={"x"} color={"red"} onClick={() => setQRDimmer(false)}/>
                    </div>

                    <QRDisplay splitCode={splitString(props.template.generateQRCodeJson())}/>

                </div>
            </Dimmer>
        </div>
    )

}

function FormItem(props: {
    item: ConfigItem,
    options: DropDownOptionsAltText[],
    config: FormTemplate,
    setConfig: (e:FormTemplate) => void
}) {

    let [useMin, setUseMin] = useState(props.item.min !== -1)
    let [useMax, setUseMax] = useState(props.item.max !== -1)

    return <div
        className={("template-item") + (props.item.type === ItemType.Title ? " item-type-title " : " item-type-normal ")}
    >
        <Icon name={"list"} size={"large"} className={"draggable-list"}/>

        <Button tabIndex={-1} icon={"trash alternate"} color={"red"} onClick={() => {

            props.setConfig(props.config.removeItem(props.item))
        }}></Button>

        <Dropdown
            options={props.options}
            value={ItemType[props.item.type]}
            selection
            // fluid
            onChange={(event, {value}) => {
                let str = value as string
                props.item.setType(str)
                props.setConfig(Object.create(props.config))
            }}
        />

        <Input
            placeholder={"label"}
            value={props.item.label}
            onChange={(event, data) => {
                if(props.item.isNewNameLegal(props.config, data.value)) {
                    props.item.label = data.value
                    props.setConfig(Object.create(props.config))
                }
            }}
            error={!props.item.isLegalName(props.config)}
        />

        {
            props.item.type === ItemType.Rating ?
                <Popup
                    pinned
                    on={"click"}
                    trigger={
                        <Button icon={"setting"}/>
                    }
                >
                    <SegmentInline className={"align-min-max"}>
                        <Checkbox
                            checked={useMin}
                            toggle
                            label={"min"}
                            onChange={(e, data) => {
                                setUseMin(data.checked ?? false)
                            }}
                        />
                        <Input type={"number"}
                               disabled={!useMin} placeholder={"min"} value={props.item.min}
                            onChange={(event, data) => {
                                props.item.min = +data.value
                                props.setConfig(Object.create(props.config))
                            }}
                        />
                    </SegmentInline>
                    <div></div>
                    <SegmentInline className={"align-min-max"}>
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
    </div>;
}