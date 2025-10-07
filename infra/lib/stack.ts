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

    // Set up website and auth
    const frontend = new Frontend(this, "Frontend");
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

    // Create shared resources
    const itemsDatabase = new Database(this, "ItemsDatabase");
    const mainApi = new Api(this, "MainApi", { userPool: auth.userPool });

    // Single Lambda handler for all APIs
    const sharedLambda = new LambdaFunction(this, "SharedLambda", {
      domainName: customDomain?.domainName,
      environment: {
        USER_ITEMS_TABLE_NAME: itemsDatabase.userItemsTable.tableName,
      },
    });

    // Grant permissions to tables
    sharedLambda.grantTableAccess(itemsDatabase.userItemsTable);

    // Add API integrations - all routes go to the same Lambda
    mainApi.addLambdaIntegration("v1", sharedLambda.handler);

    // Outputs
    new CfnOutput(this, "ApiBaseUrl", { value: mainApi.restApi.url });
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
