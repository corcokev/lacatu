package app.di;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import dagger.Module;
import dagger.Provides;
import javax.inject.Singleton;

@Module
public final class ObjectMapperModule {
  @Provides
  @Singleton
  static ObjectMapper provideObjectMapper() {
    final ObjectMapper mapper = new ObjectMapper();
    mapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
    return mapper;
  }
}
