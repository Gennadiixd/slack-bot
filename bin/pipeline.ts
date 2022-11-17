#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-stack.js";

if (
  !process.env["REPO_STRING"] ||
  !process.env["BRANCH"] ||
  !process.env["CODESTAR_CONNECTION_ARN"] ||
  !process.env["STAGING_ACCOUNT"] ||
  !process.env["STAGING_REGION"]
) {
  throw new Error(
    "Please provide REPO_STRING, BRANCH and CODESTAR_CONNECTION_ARN envs"
  );
}

const app = new cdk.App();
new PipelineStack(app, "PipelineStack", {
  source: {
    repoString: process.env["REPO_STRING"],
    branch: process.env["BRANCH"],
    codestarConnectionArn: process.env["CODESTAR_CONNECTION_ARN"],
  },
  accounts: {
    staging: {
      account: process.env["STAGING_ACCOUNT"],
      region: process.env["STAGING_REGION"],
    },
  },
});
