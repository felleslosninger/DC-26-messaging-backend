import apn from "@parse/node-apn";

let provider: apn.Provider | null = null;

function getProvider(): apn.Provider {
  if (provider) return provider;

  provider = new apn.Provider({
    token: {
      key: process.env.APNS_KEY_PATH ?? "",
      keyId: process.env.APNS_KEY_ID ?? "",
      teamId: process.env.APNS_TEAM_ID ?? ""
    },
    production: process.env.APNS_ENVIRONMENT === "production"
  });

  return provider;
}

// Sends a silent push (content-available: 1, no alert/sound/badge) so the app
// wakes in the background and calls GET /messages itself, instead of putting
// message content in the push payload.
export async function sendWakeUpPush(
  deviceTokens: string[],
  message: { title: string; body: string }
): Promise<void> {
  if (deviceTokens.length === 0) return;

  const topic = process.env.APNS_BUNDLE_ID ?? "";
  const env = process.env.APNS_ENVIRONMENT ?? "development";
  const keyId = process.env.APNS_KEY_ID ?? "";
  console.log(`[APNs] sending to topic=${topic} env=${env} keyId=${keyId} tokens=${deviceTokens.length}`);

  const notification = new apn.Notification();
  notification.topic = topic;
  notification.alert = { title: message.title, body: message.body };
  notification.sound = "default";
  notification.contentAvailable = true;
  notification.pushType = "alert";
  notification.priority = 10;
  notification.payload = { type: "new-message" };

  const result = await getProvider().send(notification, deviceTokens);

  if (result.failed.length > 0) {
    for (const failure of result.failed) {
      console.error("APNs push failed", failure.device, failure.response ?? failure.error);
    }
  }
}
