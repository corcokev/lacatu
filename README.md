# Lacatu: Serverless Boilerplate (API Gateway + Lambda Java + DynamoDB + Cognito + React)

## Prereqs

- Node 20+, npm
- AWS CDK v2 (`npm i -g aws-cdk`), AWS creds configured
- Java 21

## 1) Configure AWS credentials

Set up AWS SSO (recommended):
```
aws configure sso
```

## 2) Deploy infrastructure

```
cd infra
npm i
# Build backend jar so the Lambda asset exists
(cd ../backend && ./gradlew clean shadowJar)
# Set your AWS profile
export AWS_PROFILE=your-profile-name
# Deploy both OIDC and main stacks
npm run deploy
```

## 3) Configure frontend environment

Update `frontend/.env.local` with stack outputs:

```
VITE_ITEMS_API_URL=<ItemsApiBaseUrl>
VITE_API_BASE_URL=<ItemsApiBaseUrl>
VITE_COGNITO_USER_POOL_ID=<UserPoolId>
VITE_COGNITO_CLIENT_ID=<UserPoolClientId>
VITE_COGNITO_DOMAIN=<CognitoDomain>
```

## 4) Test locally

```
cd frontend
npm i
npm run dev
```

## 5) GitHub Actions CI/CD

Two workflows automatically deploy on push:

- `infra-deploy.yml` — deploys CDK on changes to `infra/` or `backend/`
- `frontend-deploy.yml` — deploys React on changes to `frontend/`

### Required GitHub secrets (OIDC)

- `AWS_ACCOUNT_ID`
- `AWS_REGION`

The workflows automatically fetch all other values from CloudFormation stack outputs.

## 6) Architecture

- **Items API**: DynamoDB + Lambda + API Gateway
- **Auth**: Cognito User Pool with hosted UI
- **Frontend**: React + Vite deployed to S3 + CloudFront
- **Custom Domain**: Route 53 + ACM certificate (optional)
- **CI/CD**: GitHub Actions with OIDC (no long-lived credentials)

## 7) Adding new APIs

To add new APIs (orders, users, etc.):

1. Add new DynamoDB table in CDK: `OrdersDatabase` construct
2. Add API Gateway routes pointing to the same Lambda
3. Update Lambda code to handle new endpoints (parse request path/method)
4. Update frontend to call new endpoints

The single Lambda parses the request path and HTTP method to route to appropriate logic.

## Stack Outputs Reference

- `ApiBaseUrl` - API endpoint
- `UserPoolId` - Cognito User Pool ID
- `UserPoolClientId` - Cognito App Client ID
- `CognitoDomain` - Cognito hosted UI domain
- `FrontendUrl` - CloudFront or custom domain URL
- `SiteBucketName` - S3 bucket for frontend assets
- `DistributionId` - CloudFront distribution ID
