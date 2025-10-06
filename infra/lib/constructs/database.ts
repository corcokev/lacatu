import { Construct } from "constructs";
import { RemovalPolicy, aws_dynamodb as dynamodb } from "aws-cdk-lib";

export interface DatabaseProps {
  tableName?: string;
}

export class Database extends Construct {
  public readonly userItemsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: DatabaseProps) {
    super(scope, id);

    this.userItemsTable = new dynamodb.Table(this, "UserItems", {
      tableName: props?.tableName,
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "itemId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });
  }
}
