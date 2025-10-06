package app.di;

import dagger.Module;
import dagger.Provides;
import javax.inject.Singleton;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Module
public final class AwsModule {
  @Provides
  @Singleton
  static Region provideRegion() {
    return Region.of(System.getenv().getOrDefault("AWS_REGION", "us-east-1"));
  }

  @Provides
  @Singleton
  static DynamoDbClient provideDdb(final Region region) {
    return DynamoDbClient.builder().region(region).build();
  }
}
