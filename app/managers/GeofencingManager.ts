import { android as androidApp } from "tns-core-modules/application/application";

import loc = com.google.android.gms.location;
import OnSuccessListener = com.google.android.gms.tasks.OnSuccessListener;
import OnFailureListener = com.google.android.gms.tasks.OnFailureListener;
import { GeofencingReceiver } from "../receiver/geofencing-receiver.android";

export class GeofencingManager {
    private geofencePendingIntent: android.app.PendingIntent;

    constructor(
        private geofencingClient = loc.LocationServices.getGeofencingClient(
            androidApp.context
        )
    ) {}

    public setupGeofencing() {
        this.geofencingClient
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
        return new loc.Geofence.Builder()
            .setRequestId("53")
            .setCircularRegion(39.821388, -0.227505, 100)
            .setExpirationDuration(loc.Geofence.NEVER_EXPIRE)
            .setTransitionTypes(
                loc.Geofence.GEOFENCE_TRANSITION_ENTER |
                    loc.Geofence.GEOFENCE_TRANSITION_EXIT
            )
            .build();
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

    public disableGeofencing() {
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
    }
}

let _instance: GeofencingManager;
export function getGeofencingManager() {
    if (!_instance) {
        _instance = new GeofencingManager();
    }

    return _instance;
}
