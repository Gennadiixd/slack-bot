import * as cdk from "aws-cdk-lib";
import * as pipelines from "aws-cdk-lib/pipelines";
import type { Construct } from "constructs";
import { BotStack } from "./bot-stack.js";

class CodeBuildStepWithPrimarySource extends pipelines.CodeBuildStep {
  override get primaryOutput(): pipelines.FileSet {
    return super.primaryOutput!;
  }
}

abstract class CodePipelineSourceWithPrimarySource extends pipelines.CodePipelineSource {
  override get primaryOutput(): pipelines.FileSet {
    return super.primaryOutput!;
  }

  static override connection(
    repoString: string,
    branch: string,
    props: pipelines.ConnectionSourceOptions
  ): CodePipelineSourceWithPrimarySource {
    return pipelines.CodePipelineSource.connection(
      repoString,
      branch,
      props
    ) as CodePipelineSourceWithPrimarySource;
  }
}

interface PipelineStackProps extends cdk.StackProps {
  source: {
    repoString: string;
    branch: string;
    codestarConnectionArn: string;
  };
  accounts: {
    staging: Required<cdk.Environment>;
  };
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      crossAccountKeys: true,
      dockerEnabledForSynth: true,
      synth: new CodeBuildStepWithPrimarySource("Synth", {
        input: CodePipelineSourceWithPrimarySource.connection(
          props.source.repoString,
          props.source.branch,
          {
            connectionArn: props.source.codestarConnectionArn, // Created using the AWS console * });',
          }
        ),
        commands: [
          "npm ci",
          `REPO_STRING=${props.source.repoString} BRANCH=${props.source.branch} CODESTAR_CONNECTION_ARN=${props.source.codestarConnectionArn} npx cdk synth -a 'npx ts-node --esm --prefer-ts-exts bin/pipeline.ts'`,
        ],
      }),
    });

    pipeline.addStage(
      new DeploymentStage(this, "Staging", {
        env: props.accounts.staging,
      })
    );
  }
}

class DeploymentStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new BotStack(this, "BotStack");
  }
}
