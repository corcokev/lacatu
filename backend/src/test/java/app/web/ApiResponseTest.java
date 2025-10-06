package app.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

final class ApiResponseTest {
  private ObjectMapper mapper;
  private ApiResponse response;
  private List<String> allowedOrigins;

  @BeforeEach
  final void setUp() {
    mapper = new ObjectMapper();
    allowedOrigins = List.of("http://localhost:5173", "https://d3odzc270i77yq.cloudfront.net");
    response = new ApiResponse(mapper, "http://localhost:5173", allowedOrigins);
  }

  @Test
  final void testOkResponse() {
    final APIGatewayProxyResponseEvent result = response.ok(Map.of("test", "value"));

    assertEquals(200, result.getStatusCode());
    assertTrue(result.getBody().contains("\"test\":\"value\""));
    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testCreatedResponse() {
    final APIGatewayProxyResponseEvent result = response.created(Map.of("id", "123"));

    assertEquals(201, result.getStatusCode());
    assertTrue(result.getBody().contains("\"id\":\"123\""));
  }

  @Test
  final void testBadRequestResponse() {
    final APIGatewayProxyResponseEvent result = response.badRequest("Invalid input");

    assertEquals(400, result.getStatusCode());
    assertTrue(result.getBody().contains("\"error\":\"Invalid input\""));
  }

  @Test
  final void testNotFoundResponse() {
    final APIGatewayProxyResponseEvent result = response.notFound("Resource not found");

    assertEquals(404, result.getStatusCode());
    assertTrue(result.getBody().contains("\"error\":\"Resource not found\""));
  }

  @Test
  final void testNoContentResponse() {
    final APIGatewayProxyResponseEvent result = response.noContent();

    assertEquals(204, result.getStatusCode());
    assertEquals("", result.getBody());
  }

  @Test
  final void testConstructorWithRequest() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(Map.of("origin", "http://localhost:5173"));

    final ApiResponse response = new ApiResponse(mapper, req, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testExceptionBasedErrors() {
    final Exception ex = new RuntimeException("test error");

    final APIGatewayProxyResponseEvent result = response.badRequestWithException(ex);

    assertEquals(400, result.getStatusCode());
    assertTrue(result.getBody().contains("Bad request: test error"));
  }

  @Test
  final void testMethodNotAllowedResponse() {
    final APIGatewayProxyResponseEvent result =
        response.methodNotAllowed("Custom method not allowed");

    assertEquals(405, result.getStatusCode());
    assertTrue(result.getBody().contains("\"error\":\"Custom method not allowed\""));
  }

  @Test
  final void testServerErrorResponse() {
    final APIGatewayProxyResponseEvent result = response.serverError("Internal server error");

    assertEquals(500, result.getStatusCode());
    assertTrue(result.getBody().contains("\"error\":\"Internal server error\""));
  }

  @Test
  final void testConvenienceMethodRouteNotFound() {
    final APIGatewayProxyResponseEvent result = response.routeNotFound();

    assertEquals(404, result.getStatusCode());
    assertTrue(result.getBody().contains("Route not found"));
  }

  @Test
  final void testConvenienceMethodNotAllowed() {
    final APIGatewayProxyResponseEvent result = response.methodNotAllowed();

    assertEquals(405, result.getStatusCode());
    assertTrue(result.getBody().contains("Method not allowed"));
  }

  @Test
  final void testConvenienceItemNotFound() {
    final APIGatewayProxyResponseEvent result = response.itemNotFound();

    assertEquals(404, result.getStatusCode());
    assertTrue(result.getBody().contains("Not found"));
  }

  @Test
  final void testConvenienceInvalidBody() {
    final APIGatewayProxyResponseEvent result = response.invalidBody();

    assertEquals(400, result.getStatusCode());
    assertTrue(result.getBody().contains("Invalid body"));
  }

  @Test
  final void testMethodNotAllowedWithException() {
    final Exception ex = new UnsupportedOperationException("test operation");

    final APIGatewayProxyResponseEvent result = response.methodNotAllowedWithException(ex);

    assertEquals(405, result.getStatusCode());
    assertTrue(result.getBody().contains("Method not allowed: test operation"));
  }

  @Test
  final void testServerErrorWithException() {
    final Exception ex = new RuntimeException("server error");

    final APIGatewayProxyResponseEvent result = response.serverErrorWithException(ex);

    assertEquals(500, result.getStatusCode());
    assertTrue(result.getBody().contains("Unexpected error: server error"));
  }

  @Test
  final void testConstructorWithOriginHeaderAndPickOrigin() {
    final ApiResponse response =
        new ApiResponse(mapper, "http://localhost:5173", true, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testConstructorWithOriginHeaderNoPick() {
    final ApiResponse response =
        new ApiResponse(mapper, "http://malicious.com", false, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals("http://malicious.com", result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testConstructorWithRequestNullHeaders() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(null);

    final ApiResponse response = new ApiResponse(mapper, req, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testConstructorWithRequestUpperCaseOrigin() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(Map.of("Origin", "http://localhost:5173"));

    final ApiResponse response = new ApiResponse(mapper, req, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testToJsonWithNullBody() {
    final APIGatewayProxyResponseEvent result = response.ok(null);

    assertEquals(200, result.getStatusCode());
    assertEquals("", result.getBody());
  }

  @Test
  final void testToJsonWithStringBody() {
    final APIGatewayProxyResponseEvent result = response.ok("plain string");

    assertEquals(200, result.getStatusCode());
    assertEquals("plain string", result.getBody());
  }

  @Test
  final void testCorsHeaders() {
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
    assertEquals(
        "Authorization,Content-Type", result.getHeaders().get("Access-Control-Allow-Headers"));
    assertEquals(
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        result.getHeaders().get("Access-Control-Allow-Methods"));
  }

  @Test
  final void testUnauthorizedResponse() {
    final APIGatewayProxyResponseEvent result = response.unauthorized("Auth required");

    assertEquals(401, result.getStatusCode());
    assertTrue(result.getBody().contains("\"error\":\"Auth required\""));
  }

  @Test
  final void testConvenienceUnauthorized() {
    final APIGatewayProxyResponseEvent result = response.unauthorized();

    assertEquals(401, result.getStatusCode());
    assertTrue(result.getBody().contains("Authentication required"));
  }

  @Test
  final void testUpdatedResponse() {
    final APIGatewayProxyResponseEvent result = response.updated(Map.of("updated", "true"));

    assertEquals(200, result.getStatusCode());
    assertTrue(result.getBody().contains("\"updated\":\"true\""));
  }

  @Test
  final void testOriginSelectionWithAllowedOrigin() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(Map.of("origin", "http://localhost:5173"));

    final ApiResponse response = new ApiResponse(mapper, req, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testOriginSelectionWithProductionOrigin() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(Map.of("origin", "https://d3odzc270i77yq.cloudfront.net"));

    final ApiResponse response = new ApiResponse(mapper, req, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    assertEquals(
        "https://d3odzc270i77yq.cloudfront.net",
        result.getHeaders().get("Access-Control-Allow-Origin"));
  }

  @Test
  final void testOriginSelectionWithDisallowedOrigin() {
    final APIGatewayProxyRequestEvent req = new APIGatewayProxyRequestEvent();
    req.setHeaders(Map.of("origin", "https://malicious.example.com"));

    final ApiResponse response = new ApiResponse(mapper, req, allowedOrigins);
    final APIGatewayProxyResponseEvent result = response.ok("test");

    // Should fall back to default origin
    assertEquals("http://localhost:5173", result.getHeaders().get("Access-Control-Allow-Origin"));
  }
}
