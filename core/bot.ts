import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { App, AwsLambdaReceiver } from "@slack/bolt";

const secretManagerClient = new SecretsManagerClient({});

const getSecretValueCommand = new GetSecretValueCommand({
  SecretId: process.env["SECRET_ID"],
});

const { SecretString } = await secretManagerClient.send(getSecretValueCommand);
const { SigningSecret, BotToken } = JSON.parse(SecretString!);

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: SigningSecret,
});

const app = new App({ token: BotToken, receiver: awsLambdaReceiver });

export const handler = async (event: any, context: any, callback: any) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};

app.message("goodbye", async ({ message, say }) => {
  console.log("1234 =========================");
  await say(`See ya later 123`);
});

app.message("hello", async ({ message, say }) => {
  console.log("hello =========================");
  await say(`hello rcvd`);
});
