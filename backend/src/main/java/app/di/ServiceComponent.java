package app.di;

import app.handlers.RouterHandler;
import app.repo.UserItemRepository;
import app.service.ItemService;
import app.web.ApiResponseFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import dagger.Component;
import javax.inject.Singleton;

@Singleton
@Component(
    modules = {AwsModule.class, ConfigModule.class, RepoModule.class, ObjectMapperModule.class})
public interface ServiceComponent {
  ItemService itemService();

  UserItemRepository userItemRepository();

  ObjectMapper objectMapper();

  CorsConfig corsConfig();

  ApiResponseFactory apiResponseFactory();

  void inject(RouterHandler handler);
}
