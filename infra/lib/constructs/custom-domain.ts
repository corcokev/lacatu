import { Construct } from "constructs";
import {
  aws_certificatemanager as acm,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_cloudfront as cloudfront,
} from "aws-cdk-lib";

export interface CustomDomainProps {
  domainName: string;
  distribution: cloudfront.Distribution;
}

export class CustomDomain extends Construct {
  public readonly domainName: string;
  public readonly certificate: acm.Certificate;
  public readonly hostedZone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props: CustomDomainProps) {
    super(scope, id);

    this.domainName = props.domainName;

    // Look up existing hosted zone
    this.hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    });

    // Create SSL certificate
    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: props.domainName,
      subjectAlternativeNames: [`www.${props.domainName}`],
      validation: acm.CertificateValidation.fromDns(this.hostedZone),
    });

    // Update CloudFront distribution with custom domain
    const cfnDistribution = props.distribution.node
      .defaultChild as cloudfront.CfnDistribution;
    cfnDistribution.distributionConfig = {
      ...cfnDistribution.distributionConfig,
      aliases: [props.domainName, `www.${props.domainName}`],
      viewerCertificate: {
        acmCertificateArn: this.certificate.certificateArn,
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2021",
      },
    };

    // Create Route 53 records
    new route53.ARecord(this, "ARecord", {
      zone: this.hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(props.distribution),
      ),
    });

    new route53.ARecord(this, "WWWARecord", {
      zone: this.hostedZone,
      recordName: "www",
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(props.distribution),
      ),
    });
  }
}
