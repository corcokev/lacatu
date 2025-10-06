import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Database } from "./constructs/database.js";
import { Auth } from "./constructs/auth.js";
import { Api } from "./constructs/api.js";
import { Frontend } from "./constructs/frontend.js";
import { LambdaFunction } from "./constructs/lambda.js";
import { CustomDomain } from "./constructs/custom-domain.js";
export interface LacatuStackProps extends StackProps {
  domainName?: string;
}

export class LacatuStack extends Stack {
  constructor(scope: Construct, id: string, props?: LacatuStackProps) {
    super(scope, id, props);

    const domainName = props?.domainName;

    // Create constructs
    const itemsDatabase = new Database(this, "ItemsDatabase");
    const frontend = new Frontend(this, "Frontend");

    // Custom domain setup
    const customDomain = domainName
      ? new CustomDomain(this, "CustomDomain", {
          domainName,
          distribution: frontend.distribution,
        })
      : undefined;

    const auth = new Auth(this, "Auth", {
      domainName: customDomain?.domainName,
      distribution: frontend.distribution,
    });
    const itemsApi = new Api(this, "ItemsApi", { userPool: auth.userPool });
    const itemsLambda = new LambdaFunction(this, "ItemsLambda", {
      tableName: itemsDatabase.userItemsTable.tableName,
      domainName: customDomain?.domainName,
    });

    // Grant permissions
    itemsLambda.grantTableAccess(itemsDatabase.userItemsTable);

    // Add API integration
    itemsApi.addLambdaIntegration("v1", itemsLambda.handler);

    // Outputs
    new CfnOutput(this, "ItemsApiBaseUrl", { value: itemsApi.restApi.url });
    // For backwards compatibility
    new CfnOutput(this, "ApiBaseUrl", { value: itemsApi.restApi.url });
    new CfnOutput(this, "ItemsTableName", {
      value: itemsDatabase.userItemsTable.tableName,
    });
    new CfnOutput(this, "UserPoolId", {
      value: auth.userPool.userPoolId,
    });
    new CfnOutput(this, "UserPoolClientId", {
      value: auth.userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, "CognitoDomain", {
      value: auth.domain.baseUrl(),
    });
    new CfnOutput(this, "FrontendUrl", {
      value: customDomain
        ? `https://${customDomain.domainName}`
        : `https://${frontend.distribution.domainName}`,
    });

    if (customDomain) {
      new CfnOutput(this, "HostedZoneId", {
        value: customDomain.hostedZone.hostedZoneId,
      });
    }
    new CfnOutput(this, "CloudFrontUrl", {
      value: `https://${frontend.distribution.domainName}`,
    });
    new CfnOutput(this, "SiteBucketName", {
      value: frontend.bucket.bucketName,
    });
    new CfnOutput(this, "DistributionId", {
      value: frontend.distribution.distributionId,
    });
  }
}
