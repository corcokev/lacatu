package app.di;

import app.repo.UserItemRepository;
import dagger.Module;
import dagger.Provides;
import javax.inject.Named;
import javax.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Module
public final class RepoModule {
  @Provides
  @Singleton
  static DynamoDbEnhancedClient provideEnhancedClient(final DynamoDbClient ddb) {
    return DynamoDbEnhancedClient.builder().dynamoDbClient(ddb).build();
  }

  @Provides
  @Singleton
  static UserItemRepository provideUserItemRepository(
      final DynamoDbEnhancedClient enhanced,
      @Named("USER_ITEMS_TABLE_NAME") final String tableName) {
    return new UserItemRepository(enhanced, tableName);
  }
}
