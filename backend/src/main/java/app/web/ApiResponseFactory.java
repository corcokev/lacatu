package app.web;

import app.di.CorsConfig;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.inject.Inject;
import javax.inject.Singleton;

@Singleton
public final class ApiResponseFactory {
  private final ObjectMapper mapper;
  private final CorsConfig corsConfig;

  @Inject
  public ApiResponseFactory(final ObjectMapper mapper, final CorsConfig corsConfig) {
    this.mapper = mapper;
    this.corsConfig = corsConfig;
  }

  public final ApiResponse create(final APIGatewayProxyRequestEvent req) {
    return new ApiResponse(mapper, req, corsConfig.getAllowedOrigins());
  }

  public final ApiResponse create(final String origin) {
    return new ApiResponse(mapper, origin, corsConfig.getAllowedOrigins());
  }
}
