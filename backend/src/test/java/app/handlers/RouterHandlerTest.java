package app.handlers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import app.model.UserItem;
import app.service.ItemService;
import app.web.ApiResponse;
import app.web.ApiResponseFactory;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public final class RouterHandlerTest {

  @Mock private ItemService itemService;
  @Mock private Context context;
  @Mock private APIGatewayProxyRequestEvent.ProxyRequestContext requestContext;
  @Mock private APIGatewayProxyRequestEvent.RequestIdentity identity;
  @Mock private ApiResponseFactory responseFactory;

  private RouterHandler handler;
  private ObjectMapper mapper;

  @BeforeEach
  final void setUp() {
    mapper = new ObjectMapper();
    // Mock the factory to return real ApiResponse instances
    lenient()
        .when(responseFactory.create(any(APIGatewayProxyRequestEvent.class)))
        .thenAnswer(
            invocation -> {
              final APIGatewayProxyRequestEvent req = invocation.getArgument(0);
              return new ApiResponse(mapper, req, List.of("http://localhost:5173"));
            });
    lenient()
        .when(responseFactory.create(anyString()))
        .thenAnswer(
            invocation -> {
              final String origin = invocation.getArgument(0);
              return new ApiResponse(mapper, origin, List.of("http://localhost:5173"));
            });
    handler = new RouterHandler(itemService, responseFactory, mapper);
  }

  @Test
  final void testOptionsRequest() {
    final APIGatewayProxyRequestEvent request = createRequest("OPTIONS", "/v1/items", null, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(204, response.getStatusCode());
    assertEquals("", response.getBody());
  }

  @Test
  final void testMeEndpointAnonymous() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/me", null, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"userId\":\"anonymous\""));
  }

  @Test
  final void testMeEndpointWithAuthenticatedUser() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/me", null, null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"userId\":\"user123\""));
  }

  @Test
  final void testGetItemsListAnonymous() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/items", null, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(401, response.getStatusCode());
    assertTrue(response.getBody().contains("Authentication required"));
  }

  @Test
  final void testGetItemsListAuthenticated() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/items", null, null);
    setupAuthenticatedUser(request, "user123");
    when(itemService.list("user123"))
        .thenReturn(Arrays.asList(createTestItem("item1"), createTestItem("item2")));

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"items\""));
  }

  @Test
  final void testCreateItemAnonymous() {
    final APIGatewayProxyRequestEvent request =
        createRequest("POST", "/v1/items", "{\"value\":\"test\"}", null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(401, response.getStatusCode());
  }

  @Test
  final void testCreateItemAuthenticated() {
    final APIGatewayProxyRequestEvent request =
        createRequest("POST", "/v1/items", "{\"value\":\"test\"}", null);
    setupAuthenticatedUser(request, "user123");
    final UserItem createdItem = createTestItem("item1");
    when(itemService.create("user123", "test")).thenReturn(createdItem);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(201, response.getStatusCode());
    verify(itemService).create("user123", "test");
  }

  @Test
  final void testCreateItemInvalidBodyNoMatch() {
    final APIGatewayProxyRequestEvent request = createRequest("POST", "/v1/items", "invalid", null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Invalid body"));
  }

  @Test
  final void testCreateItemEmptyValue() {
    final APIGatewayProxyRequestEvent request =
        createRequest("POST", "/v1/items", "{\"value\":\"\"}", null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Invalid body"));
  }

  @Test
  final void testCreateItemEmptyBody() {
    final APIGatewayProxyRequestEvent request = createRequest("POST", "/v1/items", "", null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Invalid body"));
  }

  @Test
  final void testCreateItemNullBody() {
    final APIGatewayProxyRequestEvent request = createRequest("POST", "/v1/items", null, null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Invalid body"));
  }

  @Test
  final void testGetSingleItemAuthenticated() {
    final APIGatewayProxyRequestEvent request =
        createRequest("GET", "/v1/items/item123", null, null);
    setupAuthenticatedUser(request, "user123");
    final UserItem item = createTestItem("item123");
    when(itemService.get("user123", "item123")).thenReturn(Optional.of(item));

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    verify(itemService).get("user123", "item123");
  }

  @Test
  final void testGetSingleItemNotFound() {
    final APIGatewayProxyRequestEvent request =
        createRequest("GET", "/v1/items/item123", null, null);
    setupAuthenticatedUser(request, "user123");
    when(itemService.get("user123", "item123")).thenReturn(Optional.empty());

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(404, response.getStatusCode());
    assertTrue(response.getBody().contains("Not found"));
  }

  @Test
  final void testUpdateItemAuthenticated() {
    final APIGatewayProxyRequestEvent request =
        createRequest("PUT", "/v1/items/item123", "{\"value\":\"updated\"}", null);
    setupAuthenticatedUser(request, "user123");
    final UserItem updatedItem = createTestItem("item123");
    when(itemService.update("user123", "item123", "updated")).thenReturn(updatedItem);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    verify(itemService).update("user123", "item123", "updated");
  }

  @Test
  final void testUpdateItemInvalidBodyNoMatch() {
    final APIGatewayProxyRequestEvent request =
        createRequest("PUT", "/v1/items/item123", "invalid", null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Invalid body"));
  }

  @Test
  final void testUpdateItemEmptyValue() {
    final APIGatewayProxyRequestEvent request =
        createRequest("PUT", "/v1/items/item123", "{\"value\":\"\"}", null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Invalid body"));
  }

  @Test
  final void testDeleteItemAuthenticated() {
    final APIGatewayProxyRequestEvent request =
        createRequest("DELETE", "/v1/items/item123", null, null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(204, response.getStatusCode());
    verify(itemService).delete("user123", "item123");
  }

  @Test
  final void testInvalidRoute() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/invalid", null, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(404, response.getStatusCode());
    assertTrue(response.getBody().contains("Route not found"));
  }

  @Test
  final void testMethodNotAllowedForItems() {
    final APIGatewayProxyRequestEvent request = createRequest("PATCH", "/v1/items", null, null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(405, response.getStatusCode());
    assertTrue(response.getBody().contains("Method not allowed"));
  }

  @Test
  final void testGetMethodRoute() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/other", null, null);
    setupAuthenticatedUser(request, "user123");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(404, response.getStatusCode());
    assertTrue(response.getBody().contains("Route not found"));
  }

  @Test
  final void testIllegalArgumentException() {
    final APIGatewayProxyRequestEvent request =
        createRequest("INVALID_METHOD", "/v1/me", null, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Bad request:"));
  }

  @Test
  final void testRuntimeException() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/items", null, null);
    setupAuthenticatedUser(request, "user123");
    when(itemService.list("user123")).thenThrow(new RuntimeException("Database error"));

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(500, response.getStatusCode());
    assertTrue(response.getBody().contains("Unexpected error:"));
  }

  @Test
  final void testNullPath() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", null, null, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(404, response.getStatusCode());
    assertTrue(response.getBody().contains("Route not found"));
  }

  @Test
  final void testNullHttpMethod() {
    final APIGatewayProxyRequestEvent request = createRequest(null, "/v1/me", null, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"userId\":\"anonymous\""));
  }

  @Test
  final void testExtractUserIdWithNullSub() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/me", null, null);
    setupAuthenticatedUser(request, null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"userId\":\"anonymous\""));
  }

  @Test
  final void testExtractUserIdWithBlankSub() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/me", null, null);
    setupAuthenticatedUser(request, "");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"userId\":\"anonymous\""));
  }

  @Test
  final void testExtractUserIdWithWhitespaceSub() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/me", null, null);
    setupAuthenticatedUser(request, "   ");

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"userId\":\"anonymous\""));
  }

  @Test
  final void testExtractUserIdWithNullAuthorizer() {
    final APIGatewayProxyRequestEvent request = createRequest("GET", "/v1/me", null, null);
    request.setRequestContext(requestContext);
    when(requestContext.getAuthorizer()).thenReturn(null);

    final APIGatewayProxyResponseEvent response = handler.handleRequest(request, context);

    assertEquals(200, response.getStatusCode());
    assertTrue(response.getBody().contains("\"userId\":\"anonymous\""));
  }

  @Test
  final void testExtractUserIdWithNullRequest() {
    final APIGatewayProxyResponseEvent response = handler.handleRequest(null, context);

    assertEquals(400, response.getStatusCode());
    assertTrue(response.getBody().contains("Request cannot be null"));
  }

  private APIGatewayProxyRequestEvent createRequest(
      final String method,
      final String path,
      final String body,
      final Map<String, String> headers) {
    final APIGatewayProxyRequestEvent request = new APIGatewayProxyRequestEvent();
    request.setHttpMethod(method);
    request.setPath(path);
    request.setBody(body);
    request.setHeaders(headers != null ? headers : Map.of("origin", "http://localhost:5173"));
    return request;
  }

  private void setupAuthenticatedUser(
      final APIGatewayProxyRequestEvent request, final String userId) {
    request.setRequestContext(requestContext);
    final Map<String, Object> claims = new HashMap<>();
    claims.put("sub", userId);
    final Map<String, Object> authorizer = Map.of("claims", claims);
    when(requestContext.getAuthorizer()).thenReturn(authorizer);
  }

  private UserItem createTestItem(final String itemId) {
    final UserItem item = new UserItem();
    item.itemId = itemId;
    item.userId = "user123";
    item.value = "test value";
    item.createdAt = System.currentTimeMillis();
    item.updatedAt = System.currentTimeMillis();
    return item;
  }
}
