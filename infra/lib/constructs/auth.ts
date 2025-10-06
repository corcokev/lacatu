import { Construct } from "constructs";
import {
  Duration,
  RemovalPolicy,
  Lazy,
  aws_cognito as cognito,
  aws_cloudfront as cloudfront,
} from "aws-cdk-lib";

export interface AuthProps {
  domainName?: string;
  distribution: cloudfront.Distribution;
}

export class Auth extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly domain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, props: AuthProps) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: { email: { required: true, mutable: false } },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.domain = this.userPool.addDomain("Domain", {
      cognitoDomain: {
        domainPrefix: `lacatu-${scope.node.addr.slice(-6)}`.replace(
          /[^a-z0-9-]/g,
          "",
        ),
      },
    });

    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      generateSecret: false,
      authSessionValidity: Duration.minutes(5),
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
        callbackUrls: [
          "http://localhost:5173/",
          props.domainName
            ? `https://${props.domainName}/`
            : Lazy.string({
                produce: () => `https://${props.distribution.domainName}/`,
              }),
        ],
        logoutUrls: [
          "http://localhost:5173/",
          props.domainName
            ? `https://${props.domainName}/`
            : Lazy.string({
                produce: () => `https://${props.distribution.domainName}/`,
              }),
        ],
      },
    });
  }
}
