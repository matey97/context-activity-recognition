import { Observable } from "tns-core-modules/data/observable";
import { Resolution } from "nativescript-context-apis/activity-recognition";

import { getGeofencingManager } from "./managers/GeofencingManager";
import { getLocationManager } from "./managers/LocationManager";
import { getRecognizersManager } from "./managers/ActivityRecognizersManager";
import { getActivityChangeCallback } from "./utils/callbacks";

export class HelloWorldModel extends Observable {
    constructor(
        private recognizerManager = getRecognizersManager(),
        private geofencingManager = getGeofencingManager(),
        private locationManager = getLocationManager()
    ) {
        super();
    }

    setup() {
        //this.prepareAllRecognizers();
        //this.setupGeofencing();
        this.recognizerManager.prepareAllRecognizers();
        this.geofencingManager.setupGeofencing();
    }

    startRecognizer() {
        //this.startLowResRecognizer();
        //this.startLocationUpdates();
        this.recognizerManager.enableRecognizer(
            Resolution.LOW,
            getActivityChangeCallback(Resolution.LOW)
        );
        this.locationManager.startLocationUpdates();
    }

    stopRecognizer() {
        //this.disableGeofencing();
        //this.stopRecognizers();
        //this.stopLocationUpdates();
        this.recognizerManager.stopRecognizers();
        this.geofencingManager.disableGeofencing();
        this.locationManager.stopLocationUpdates();
    }

    /*private setupGeofencing() {
        const geofencingClient = loc.LocationServices.getGeofencingClient(
            androidApp.context
        );
        geofencingClient
            .addGeofences(
                this.getGeofencingRequest(),
                this.getGeofencePendingIntent()
            )
            .addOnSuccessListener(
                new OnSuccessListener({
                    onSuccess: () => console.log("Geofences added"),
                })
            )
            .addOnFailureListener(
                new OnFailureListener({
                    onFailure: (e) =>
                        console.log(`Could not add geofences: ${e}`),
                })
            );
    }

    private getGeofencingRequest(): loc.GeofencingRequest {
        return new loc.GeofencingRequest.Builder()
            .setInitialTrigger(loc.GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofence(this.getGeofence())
            .build();
    }

    private getGeofence(): loc.Geofence {
        return (
            new loc.Geofence.Builder()
                .setRequestId("53")
                .setCircularRegion(39.821388, -0.227505, 100)
                .setExpirationDuration(loc.Geofence.NEVER_EXPIRE)
                .setTransitionTypes(
                    loc.Geofence.GEOFENCE_TRANSITION_ENTER |
                        loc.Geofence.GEOFENCE_TRANSITION_EXIT
                )
                .build()
        );
    }

    private getGeofencePendingIntent(): android.app.PendingIntent {
        if (!this.geofencePendingIntent) {
            const intent = new android.content.Intent(
                androidApp.context,
                GeofencingReceiver.class
            );
            this.geofencePendingIntent = android.app.PendingIntent.getBroadcast(
                androidApp.context,
                53,
                intent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT
            );
        }

        return this.geofencePendingIntent;
    }

    private disableGeofencing() {
        const geofencingClient = loc.LocationServices.getGeofencingClient(
            androidApp.context
        );
        geofencingClient
            .removeGeofences(this.getGeofencePendingIntent())
            .addOnSuccessListener(
                new OnSuccessListener({
                    onSuccess: () => console.log("Geofences disabled"),
                })
            )
            .addOnFailureListener(
                new OnFailureListener({
                    onFailure: (e) =>
                        console.log(`Could not disable geofences: ${e}`),
                })
            );
    }*/

    /*private prepareAllRecognizers() {
        recognizers.forEach((type) => {
            this.prepareRecognizer(type);
        });
    }

    private async prepareRecognizer(type) {
        const rec = contextApis.getActivityRecognizer(type);

        if (type === Resolution.HIGH) {
            await initializeHighResRecognizer(rec);
        }

        const isReady = rec.isReady();
        console.log(`${type} res activity ready: ${isReady}`);

        if (!isReady) {
            console.log(`Up to prepare ${type} res activity recognizer...`);
            await rec.prepare();
        }
    }*/

    /*private async startLowResRecognizer() {
        this.recognizer = contextApis.getActivityRecognizer(Resolution.LOW);
        const isReady = this.recognizer.isReady();

        if (!isReady) {
            await this.recognizer.prepare();
        }
        this.recognizer.listenActivityChanges((activityChange) => {
            console.log(`LowResRecognizer: ${JSON.stringify(activityChange)}`);
            getCSVWriter().write({
                type: "LOW_RES",
                record: `${activityChange.type}#${activityChange.transition}`,
                confidence: activityChange.confidence
                    ? activityChange.confidence
                    : -1,
                timestamp: activityChange.timestamp.getTime(),
            });
        });
        await this.recognizer.startRecognizing();
    }*/

    /*private stopRecognizers() {
        recognizers.forEach((type) => {
            const rec = contextApis.getActivityRecognizer(type);
            rec.stopRecognizing();
            console.log(`${type} res activity recognizer stoped`);
            rec.stopListening();
        });
    }

    private async startLocationUpdates() {
        const provider = contextApis.geolocationProvider;
        const ok = await this.prepareGeolocationProvider(provider);

        const stream = ok
            ? provider.locationStream({
                  highAccuracy: true,
                  stdInterval: 30000,
                  maxAge: 60000,
              })
            : of<Geolocation>(null);

        this.locationSubscription = stream.subscribe(
            (location) => {
                console.log(`Location acquired!: ${JSON.stringify(location)}`);
                getCSVWriter().write({
                    type: "LOCATION",
                    record: `${location.latitude}#${location.longitude}`,
                    confidence: -1,
                    timestamp: location.timestamp.getTime(),
                });
            },
            (error) =>
                console.error(
                    `Location updates could not be acquired: ${error}`
                )
        );
    }

    private _preparing: Promise<any>;
    private async prepareGeolocationProvider(
        provider: GeolocationProvider
    ): Promise<boolean> {
        const isReady = await provider.isReady();
        if (isReady) {
            return true;
        }

        try {
            if (!this._preparing) {
                this._preparing = provider.prepare();
            }
            await this._preparing;
            return true;
        } catch (e) {
            console.error(`GeolocationProvider couldn't be prepared: ${e}`);
            return false;
        } finally {
            this._preparing = null;
        }
    }*/

    /*private stopLocationUpdates() {
        if (this.locationSubscription) {
            this.locationSubscription.unsubscribe();
            console.log("Unsuscribed from GeolocationProvider");
        }
    }*/
}
