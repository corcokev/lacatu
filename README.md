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

Or configure regular AWS credentials:
```
aws configure
```

## 2) Deploy infra

```
cd infra
npm i
npm run build
# Build backend jar so the Lambda asset exists
(cd ../backend && ./gradlew clean shadowJar || ./gradlew.bat clean shadowJar)
# Set your AWS profile (if using SSO)
export AWS_PROFILE=your-profile-name
npm run deploy
```

Copy the stack outputs:

- `ApiBaseUrl`
- `UserPoolId`
- `UserPoolClientId`
- `CognitoDomain`
- `FrontendUrl`
- `SiteBucketName`
- `DistributionId`

## 3) Configure Cognito callback URLs

Update the User Pool App Client callback/logout URLs to include `FrontendUrl`.

## 4) Build & upload frontend

Create a `.env` (or set in CI) for Vite:

```
VITE_API_BASE_URL=<ApiBaseUrl>
VITE_COGNITO_USER_POOL_ID=<UserPoolId>
VITE_COGNITO_CLIENT_ID=<UserPoolClientId>
VITE_COGNITO_DOMAIN=<CognitoDomain>
```

Build and upload:

```
cd ../frontend
npm i
npm run build
aws s3 sync dist/ s3://<SiteBucketName>
aws cloudfront create-invalidation --distribution-id <DistributionId> --paths "/*"
```

## 5) GitHub Actions CI

Two workflows are included:

- `infra-deploy.yml` — builds backend jar and deploys CDK on pushes to `infra` or `backend`.
- `frontend-deploy.yml` — builds React and deploys to S3 + invalidates CloudFront on pushes to `frontend`.

### Required repo secrets

- `AWS_ACCOUNT_ID` (optional, for scoping)
- `AWS_REGION` (e.g., `us-east-1`)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CDK_STACK_NAME` (e.g., `LacatuStack`)
- `SITE_BUCKET_NAME` (from stack output `SiteBucketName`)
- `DISTRIBUTION_ID` (from stack output `DistributionId`)
- `API_BASE_URL`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `COGNITO_DOMAIN` (to inject into Vite build)

## 6) Test the flow

Open `FrontendUrl`, login, add an item.
