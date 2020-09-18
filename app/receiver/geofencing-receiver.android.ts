import loc = com.google.android.gms.location;
import { Resolution } from "nativescript-context-apis/activity-recognition";
import { getCSVWriter } from "../utils/csv-writer";
import {
    ActivityRecognizersManager,
    getRecognizersManager,
} from "../managers/ActivityRecognizersManager";
import { getActivityChangeCallback } from "../utils/callbacks";

@JavaProxy("org.nativescript.contextactivityrecognition.GeofencingReceiver")
export class GeofencingReceiver extends android.content.BroadcastReceiver {
    onReceive(
        context: android.content.Context,
        intent: android.content.Intent
    ) {
        const recognizersManager = getRecognizersManager();
        const geofencingEvent: loc.GeofencingEvent = loc.GeofencingEvent.fromIntent(
            intent
        );

        if (geofencingEvent.hasError()) {
            const error = loc.GeofenceStatusCodes.getStatusCodeString(
                geofencingEvent.getErrorCode()
            );
            console.log(`GeofencingReceiver: Error --> ${error}`);
        }

        const geofenceTransition = geofencingEvent.getGeofenceTransition();
        const time = java.lang.System.currentTimeMillis();

        if (geofenceTransition === loc.Geofence.GEOFENCE_TRANSITION_ENTER) {
            console.log("GeofencingReceiver: entering geofence");
            this.writeGeofenceChangeToCSV("ENTER", time);
            this.setRecognizersInGeofence(recognizersManager);
        } else if (
            geofenceTransition === loc.Geofence.GEOFENCE_TRANSITION_EXIT
        ) {
            console.log("GeofencingReceiver: exiting geofence");
            this.writeGeofenceChangeToCSV("EXIT", time);
            this.setRecognizersOutGeofence(recognizersManager);
        }
    }

    private async setRecognizersInGeofence(
        recognizerManager: ActivityRecognizersManager
    ) {
        //await this.disableRecognizer(Resolution.LOW);
        //await this.enableRecognizer(Resolution.MEDIUM);
        await recognizerManager.disableRecognizer(Resolution.LOW);
        await recognizerManager.enableRecognizer(
            Resolution.MEDIUM,
            getActivityChangeCallback(Resolution.MEDIUM)
        );
    }

    private async setRecognizersOutGeofence(
        recognizerManager: ActivityRecognizersManager
    ) {
        await recognizerManager.disableRecognizer(Resolution.MEDIUM);
        await recognizerManager.disableRecognizer(Resolution.HIGH);
        await recognizerManager.enableRecognizer(
            Resolution.LOW,
            getActivityChangeCallback(Resolution.LOW)
        );
    }

    /*private async enableRecognizer(type: Resolution) {
        const recognizer = contextApis.getActivityRecognizer(type);
        recognizer.listenActivityChanges(this.getActivityChangeCallback(type));
        await recognizer.startRecognizing();
        console.log(`${type} res recognizer enabled!`);
        LocalNotifications.schedule([
            {
                title: `${type} res started`,
            },
        ]);
    }

    private async disableRecognizer(type: Resolution) {
        const recognizer = contextApis.getActivityRecognizer(type);
        recognizer.stopListening();
        await recognizer.stopRecognizing();
        console.log(`${type} res recognizer disabled!`);
    }*/

    /*private getActivityChangeCallback(type: Resolution) {
        switch (type) {
            case Resolution.LOW:
            case Resolution.HIGH:
                return (activityChange) => {
                    console.log(
                        `${type} res recognizer: ${JSON.stringify(
                            activityChange
                        )}`
                    );
                    this.writeToCSV(
                        activityChange,
                        type === Resolution.LOW ? "LOW_RES" : "HIGH_RES"
                    );
                };
            case Resolution.MEDIUM:
                return (activityChange) => {
                    console.log(
                        `Medium res recognizer: ${JSON.stringify(
                            activityChange
                        )}`
                    );
                    this.writeToCSV(activityChange, "MED_RES");
                    if (activityChange.type === HumanActivity.STILL) {
                        this.disableRecognizer(Resolution.MEDIUM);
                        this.enableRecognizer(Resolution.HIGH);
                    }
                };
        }
    }

    private writeToCSV(activityChange: ActivityChange, type: RecordType) {
        getCSVWriter().write({
            type,
            record: `${activityChange.type}#${activityChange.transition}`,
            confidence: activityChange.confidence
                ? activityChange.confidence
                : -1,
            timestamp: activityChange.timestamp.getTime(),
        });
    }*/

    private writeGeofenceChangeToCSV(transition: string, timestamp: number) {
        getCSVWriter().write({
            type: "GEOFENCE",
            record: transition,
            confidence: 1,
            timestamp,
        });
    }
}
