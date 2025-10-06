import { Construct } from "constructs";
import {
  aws_apigateway as apigw,
  aws_cognito as cognito,
  aws_lambda as lambda,
} from "aws-cdk-lib";

export interface ApiProps {
  userPool: cognito.UserPool;
}

export class Api extends Construct {
  public readonly restApi: apigw.RestApi;
  public readonly authorizer: apigw.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id);

    this.restApi = new apigw.RestApi(this, "RestApi", {
      restApiName: "LacatuApi",
      deployOptions: { stageName: "prod" },
    });

    // Add CORS headers to gateway responses for auth errors
    // Note: Real CORS validation happens in Lambda function
    this.restApi.addGatewayResponse("Unauthorized", {
      type: apigw.ResponseType.UNAUTHORIZED,
      responseHeaders: {
        "Access-Control-Allow-Headers": "'Authorization,Content-Type'",
        "Access-Control-Allow-Methods": "'GET,POST,PUT,PATCH,DELETE,OPTIONS'",
      },
    });

    this.authorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "CognitoAuthorizer",
      {
        cognitoUserPools: [props.userPool],
      },
    );
  }

  public addLambdaIntegration(
    path: string,
    handler: lambda.Function,
    methods?: string[],
  ) {
    const integration = new apigw.LambdaIntegration(handler, { proxy: true });
    const resource = this.restApi.root.addResource(path);
    const proxy = resource.addResource("{proxy+}");

    const methodsToAdd = methods || ["GET", "POST", "PUT", "PATCH", "DELETE"];

    methodsToAdd.forEach((method) => {
      proxy.addMethod(method, integration, {
        authorizationType: apigw.AuthorizationType.COGNITO,
        authorizer: this.authorizer,
      });
      resource.addMethod(method, integration, {
        authorizationType: apigw.AuthorizationType.COGNITO,
        authorizer: this.authorizer,
      });
    });

    // OPTIONS without auth for CORS
    proxy.addMethod("OPTIONS", integration);
    resource.addMethod("OPTIONS", integration);

    return { resource, proxy };
  }
}
