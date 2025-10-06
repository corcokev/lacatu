import {
  Stack,
  StackProps,
  CfnOutput,
  Duration,
  aws_iam as iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubOrg = "corcokev"; // Update this to your GitHub username
    const githubRepo = "lacatu"; // Update this to your actual repo name
    const githubBranch = "main";

    // 1) OIDC Provider (create once)
    const provider = new iam.OpenIdConnectProvider(this, "GitHubOidcProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
      thumbprints: [
        // GitHub’s current & previous root CAs (recommended to include both)
        "6938fd4d98bab03faadb97b34396831e3780aea1",
        "1b511abead59c6ce207077c0bf0e0043b1382612",
      ],
    });

    // 2) Trust policy: restrict to repo + branch
    const principal = new iam.OpenIdConnectPrincipal(provider).withConditions({
      StringEquals: {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      },
      StringLike: {
        "token.actions.githubusercontent.com:sub": `repo:${githubOrg}/${githubRepo}:ref:refs/heads/${githubBranch}`,
      },
    });

    // 3) Role assumed by GitHub Actions
    const ghRole = new iam.Role(this, "GitHubActionsLacatuRole", {
      roleName: "GitHubActionsLacatuRole",
      assumedBy: principal,
      description: "OIDC role used by GitHub Actions to deploy Lacatu via CDK",
      maxSessionDuration: Duration.hours(1),
    });

    // 4) Core deploy permissions (tag-scoped where possible)
    ghRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "CdkDeployCore",
        actions: [
          "cloudformation:*",
          "lambda:*",
          "dynamodb:*",
          "apigateway:*",
          "cloudfront:*",
          "cognito-idp:*",
          "logs:*",
          "s3:*",
          "iam:Get*",
          "iam:List*",
          "sts:GetCallerIdentity",
        ],
        resources: ["*"],
        conditions: {
          StringEqualsIfExists: {
            "aws:RequestTag/Project": "Lacatu",
            "aws:ResourceTag/Project": "Lacatu",
          },
        },
      }),
    );

    // 5) Allow reading CDK bootstrap version (SSM)
    ghRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "CdkBootstrapSsmRead",
        actions: [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:DescribeParameters",
        ],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/cdk-bootstrap/*`,
        ],
      }),
    );

    // 6) Access CDK toolkit buckets (assets upload/download)
    ghRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "CdkToolkitBucketList",
        actions: ["s3:GetBucketLocation", "s3:ListBucket"],
        resources: ["arn:aws:s3:::cdk-*-assets-*"],
      }),
    );
    ghRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "CdkToolkitBucketObjects",
        actions: [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:AbortMultipartUpload",
          "s3:ListBucketMultipartUploads",
          "s3:ListMultipartUploadParts",
        ],
        resources: ["arn:aws:s3:::cdk-*-assets-*/*"],
      }),
    );

    // 7) Allow PassRole only to CDK bootstrap roles (CloudFormation)
    ghRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "PassCdkBootstrapRoles",
        actions: ["iam:PassRole"],
        resources: [
          `arn:aws:iam::${this.account}:role/cdk-*-deploy-role-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-file-publishing-role-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-lookup-role-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-image-publishing-role-*`,
        ],
        conditions: {
          StringEquals: {
            "iam:PassedToService": "cloudformation.amazonaws.com",
          },
        },
      }),
    );

    ghRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "PassCdkCfnExecRole",
        actions: ["iam:PassRole"],
        resources: [
          // CloudFormation execution role created by 'cdk bootstrap'
          `arn:aws:iam::${this.account}:role/cdk-hnb659fds-cfn-exec-role-*`,
        ],
        conditions: {
          StringEquals: {
            "iam:PassedToService": "cloudformation.amazonaws.com",
          },
        },
      }),
    );

    new CfnOutput(this, "GitHubActionsRoleArn", { value: ghRole.roleArn });
  }
}
