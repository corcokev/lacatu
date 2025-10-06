package app.di;

import dagger.Module;
import dagger.Provides;
import java.util.List;
import javax.inject.Named;
import javax.inject.Singleton;

@Module
public final class ConfigModule {
  private static final String DEFAULT_ORIGIN = "http://localhost:5173";

  @Provides
  @Singleton
  @Named("USER_ITEMS_TABLE_NAME")
  static String provideUserItemsTableName() {
    return System.getenv("USER_ITEMS_TABLE_NAME");
  }

  @Provides
  @Singleton
  static CorsConfig provideCorsConfig() {
    final String env = System.getenv("FRONTEND_ORIGIN");
    final List<String> allowedOrigins;
    if (env != null && !env.isBlank()) {
      allowedOrigins = List.of(env.split("\\s*,\\s*"));
    } else {
      allowedOrigins = List.of(DEFAULT_ORIGIN, "https://d3odzc270i77yq.cloudfront.net");
    }
    return new CorsConfig(allowedOrigins);
  }
}
