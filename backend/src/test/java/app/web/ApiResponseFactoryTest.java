package app.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import app.di.CorsConfig;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
final class ApiResponseFactoryTest {

  @Mock private CorsConfig corsConfig;
  private ObjectMapper mapper;
  private ApiResponseFactory factory;
  private List<String> allowedOrigins;

  @BeforeEach
  final void setUp() {
    mapper = new ObjectMapper();
    allowedOrigins = List.of("http://localhost:5173", "https://example.com");
    when(corsConfig.getAllowedOrigins()).thenReturn(allowedOrigins);
    factory = new ApiResponseFactory(mapper, corsConfig);
  }

  @Test
  final void testCreateWithRequest() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(Map.of("origin", "http://localhost:5173"));

    final ApiResponse response = factory.create(req);

    assertNotNull(response);
    assertEquals(200, response.ok("test").getStatusCode());
    assertEquals(
        "http://localhost:5173",
        response.ok("test").getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testCreateWithOrigin() {
    final String origin = "https://example.com";

    final ApiResponse response = factory.create(origin);

    assertNotNull(response);
    assertEquals(200, response.ok("test").getStatusCode());
    assertEquals(origin, response.ok("test").getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testCreateWithNullHeaders() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(null);

    final ApiResponse response = factory.create(req);

    assertNotNull(response);
    assertEquals(200, response.ok("test").getStatusCode());
    assertEquals(
        "http://localhost:5173",
        response.ok("test").getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testCreateWithDisallowedOrigin() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(Map.of("origin", "https://malicious.com"));

    final ApiResponse response = factory.create(req);

    assertNotNull(response);
    assertEquals(200, response.ok("test").getStatusCode());
    assertEquals(
        "http://localhost:5173",
        response.ok("test").getHeaders().get("Access-Control-Allow-Origin"));
  }
}
