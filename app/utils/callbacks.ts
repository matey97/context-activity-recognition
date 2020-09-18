import {
    Resolution,
    HumanActivity,
} from "nativescript-context-apis/activity-recognition";
import { getCSVWriter, RecordType } from "./csv-writer";
import { getRecognizersManager } from "../managers/ActivityRecognizersManager";

export function getActivityChangeCallback(type: Resolution) {
    switch (type) {
        case Resolution.LOW:
        case Resolution.HIGH:
            return (activityChange) => {
                console.log(
                    `${type} res recognizer: ${JSON.stringify(activityChange)}`
                );
                writeToCSV(
                    activityChange,
                    type === Resolution.LOW ? "LOW_RES" : "HIGH_RES"
                );
            };
        case Resolution.MEDIUM:
            return (activityChange) => {
                console.log(
                    `Medium res recognizer: ${JSON.stringify(activityChange)}`
                );
                writeToCSV(activityChange, "MED_RES");
                const recognizers = getRecognizersManager();
                if (activityChange.type === HumanActivity.STILL) {
                    recognizers.disableRecognizer(Resolution.MEDIUM);
                    recognizers.enableRecognizer(
                        Resolution.HIGH,
                        (activityChange) => {
                            console.log(
                                `High res recognizer: ${JSON.stringify(
                                    activityChange
                                )}`
                            );
                            writeToCSV(activityChange, "HIGH_RES");
                        }
                    );
                }
            };
    }
}

function writeToCSV(activityChange, type: RecordType) {
    getCSVWriter().write({
        type,
        record: `${activityChange.type}#${activityChange.transition}`,
        confidence: activityChange.confidence ? activityChange.confidence : -1,
        timestamp: activityChange.timestamp.getTime(),
    });
}
