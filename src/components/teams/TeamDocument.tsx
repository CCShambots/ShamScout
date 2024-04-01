import {Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {ScoutForm} from "../ScoutForm";
import {axiosHeaders, getImage, getImagePath} from "../../util/APIUtil";
import {useLocalStorage} from "usehooks-ts";
import {CURRENT_EVENT} from "../../util/LocalStorageConstants";
import {team} from "../../pages/TeamsPage";
// import {ZebraTable} from "@david.kucsai/react-pdf-table/lib/stories/components/story/ZebraTable";

const styles = StyleSheet.create({
    page: {

    },
    header: {
        textAlign: 'center',
        margin: 10,
        fontSize: 40,
        fontWeight: 'bold'
    },
    image: {
        width: 100,
        height: 100
    }
});

export function TeamDocuments(props: {teams:team[], data:ScoutForm[]}) {
    return <Document>
        {
            props.teams.map((team) =>
                <TeamDocument
                    team={team}
                    filteredData={props.data.filter(e => e.team === team.number)}
                />
            )
        }
    </Document>
}

export function TeamDocument(props: {team:team, filteredData:ScoutForm[]})  {
    let [currentEvent] = useLocalStorage(CURRENT_EVENT, "")

    let year=  currentEvent.substring(0, 4);

    return <Page size={"A4"}>
            <View>
                <Text style={styles.header}>{props.team.number} - {props.team.name}</Text>
                <Image
                    src={{ uri: getImagePath(props.team.number, year), method: 'GET', headers: axiosHeaders.headers, body: '' }}
                    style={styles.image}
                />

            </View>
        </Page>
}