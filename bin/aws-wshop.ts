#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BotStack } from "../lib/bot-stack.js";

const app = new cdk.App();
new BotStack(app, "BotStack");
