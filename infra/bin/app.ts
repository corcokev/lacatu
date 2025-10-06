import "source-map-support/register.js";
import { config } from "dotenv";
import { App, Tags } from "aws-cdk-lib";
import { LacatuStack } from "../lib/stack.js";
import { GithubOidcStack } from "../lib/github.js";

// Load environment variables from .env file
config();

const app = new App();
Tags.of(app).add("Project", "Lacatu");

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region:
    process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || "us-east-1",
};

new GithubOidcStack(app, "GithubOidcStack", { env });

new LacatuStack(app, "LacatuStack", {
  env,
  domainName: process.env.DOMAIN_NAME,
});
