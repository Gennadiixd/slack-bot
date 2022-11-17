import * as apiGW2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apiGW2Integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as secretManager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";
import { URL } from "node:url";


export class BotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const botSecrets = secretManager.Secret.fromSecretNameV2(
      this,
      "SlackBotSecrets",
      "slack-bot-creds"
    );

    const handler = new nodejs.NodejsFunction(this, "SlackBotFunction", {
      entry: new URL("../core/bot.ts", import.meta.url).pathname,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      bundling: {
        // required for top-level await
        format: nodejs.OutputFormat.ESM,
        // dirty hack to get ESM up and running: https://github.com/evanw/esbuild/issues/1921#issuecomment-1152887672
        banner:
          "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
      },
      environment: {
        SECRET_ID: "slack-bot-creds",
      },
    });

    botSecrets.grantRead(handler);

    const gateWay = new apiGW2.HttpApi(this, "SlackBotApi");

    const routePath = "/slack/events";

    gateWay.addRoutes({
      path: routePath,
      methods: [apiGW2.HttpMethod.POST],
      integration: new apiGW2Integrations.HttpLambdaIntegration(
        "Integration",
        handler
      ),
    });

    new cdk.CfnOutput(this, "BotUrl", {
      value: gateWay.apiEndpoint + routePath,
    });
  }
}
