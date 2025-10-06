import { Construct } from "constructs";
import {
  Duration,
  aws_lambda as lambda,
  aws_dynamodb as dynamodb,
} from "aws-cdk-lib";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export interface LambdaProps {
  tableName: string;
  domainName?: string;
}

export class LambdaFunction extends Construct {
  public readonly handler: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id);

    const filename = fileURLToPath(import.meta.url);
    const dirName = dirname(filename);

    this.handler = new lambda.Function(this, "ApiHandler", {
      runtime: lambda.Runtime.JAVA_21,
      memorySize: 512,
      timeout: Duration.seconds(10),
      handler: "app.handlers.RouterHandler::handleRequest",
      code: lambda.Code.fromAsset(
        join(dirName, "../../../backend/build/libs/backend-0.1.0-all.jar"),
      ),
      environment: {
        USER_ITEMS_TABLE_NAME: props.tableName,
        POWERTOOLS_SERVICE_NAME: "lacatu",
        FRONTEND_ORIGIN: props.domainName
          ? `http://localhost:5173,https://${props.domainName}`
          : "http://localhost:5173,https://d3odzc270i77yq.cloudfront.net",
      },
    });
  }

  public grantTableAccess(table: dynamodb.Table) {
    table.grantReadWriteData(this.handler);
  }
}
