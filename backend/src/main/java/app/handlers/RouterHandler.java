package app.handlers;

import app.di.DaggerServiceComponent;
import app.service.ItemService;
import app.web.ApiResponse;
import app.web.ApiResponseFactory;
import app.web.Route;
import com.amazonaws.HttpMethod;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.Optional;
import javax.inject.Inject;

/** AWS Lambda handler for routing API Gateway requests to item management endpoints. */
public final class RouterHandler
    implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

  private static final String ANONYMOUS_USER = "anonymous";
  private static final String OPTIONS_METHOD = "OPTIONS";
  private static final String VALUE_REGEX = ".*\"value\":\"(.*?)\".*";
  private static final String VALUE_REPLACEMENT = "$1";

  private final ItemService items;
  private final ApiResponseFactory responseFactory;
  private final ObjectMapper mapper;

  @Inject
  public RouterHandler(
      final ItemService itemService,
      final ApiResponseFactory responseFactory,
      final ObjectMapper mapper) {
    this.items = itemService;
    this.responseFactory = responseFactory;
    this.mapper = mapper;
  }

  public RouterHandler() {
    this(
        DaggerServiceComponent.create().itemService(),
        DaggerServiceComponent.create().apiResponseFactory(),
        DaggerServiceComponent.create().objectMapper());
  }

  @Override
  public APIGatewayProxyResponseEvent handleRequest(
      final APIGatewayProxyRequestEvent req, final Context ctx) {
    if (req == null) {
      final ApiResponse response = responseFactory.create("http://localhost:5173");
      return response.badRequest("Request cannot be null");
    }

    final ApiResponse response = responseFactory.create(req);

    try {
      final String methodStr = Optional.ofNullable(req.getHttpMethod()).orElse("GET");

      // Handle OPTIONS first, before any other processing
      if (OPTIONS_METHOD.equalsIgnoreCase(methodStr)) {
        return response.noContent();
      }

      final String route = Optional.ofNullable(req.getPath()).orElse("");
      final String userId = extractUserId(req);

      final HttpMethod method = HttpMethod.valueOf(methodStr);

      if (Route.ME.matches(route)) {
        return response.ok(Map.of("userId", userId));
      }
      if (Route.ITEMS.matches(route) || Route.ITEMS_PREFIX.isPrefixOf(route)) {
        if (ANONYMOUS_USER.equals(userId)) {
          return response.unauthorized();
        }
        return handleItemsRoute(route, method, userId, req, response);
      }
      return response.routeNotFound();
    } catch (IllegalArgumentException e) {
      return response.badRequestWithException(e);
    } catch (RuntimeException e) {
      return response.serverErrorWithException(e);
    }
  }

  private final APIGatewayProxyResponseEvent handleItemsRoute(
      final String route,
      final HttpMethod method,
      final String userId,
      final APIGatewayProxyRequestEvent req,
      final ApiResponse response) {
    if (HttpMethod.POST.equals(method)) {
      return handleCreateItem(userId, req, response);
    }
    if (HttpMethod.GET.equals(method) && Route.ITEMS.matches(route)) {
      return response.ok(Map.of("items", items.list(userId)));
    }
    if (HttpMethod.PUT.equals(method)) {
      final String id = extractItemId(route);
      return handleUpdateItem(userId, id, req, response);
    }
    if (HttpMethod.GET.equals(method)) {
      final String id = extractItemId(route);
      return items.get(userId, id).map(response::ok).orElseGet(response::itemNotFound);
    }
    if (HttpMethod.DELETE.equals(method)) {
      final String id = extractItemId(route);
      items.delete(userId, id);
      return response.noContent();
    }
    return response.methodNotAllowed();
  }

  private final APIGatewayProxyResponseEvent handleCreateItem(
      final String userId, final APIGatewayProxyRequestEvent req, final ApiResponse response) {
    final String body = Optional.ofNullable(req.getBody()).orElse("");
    final String value = body.replaceAll(VALUE_REGEX, VALUE_REPLACEMENT);
    if (value.isEmpty() || value.equals(body)) {
      return response.invalidBody();
    }
    return response.created(items.create(userId, value));
  }

  private final APIGatewayProxyResponseEvent handleUpdateItem(
      final String userId,
      final String itemId,
      final APIGatewayProxyRequestEvent req,
      final ApiResponse response) {
    final String body = Optional.ofNullable(req.getBody()).orElse("");
    final String value = body.replaceAll(VALUE_REGEX, VALUE_REPLACEMENT);
    if (value.isEmpty() || value.equals(body)) {
      return response.invalidBody();
    }
    return response.updated(items.update(userId, itemId, value));
  }

  private final String extractUserId(final APIGatewayProxyRequestEvent req) {
    if (req.getRequestContext() == null || req.getRequestContext().getAuthorizer() == null) {
      return ANONYMOUS_USER;
    }
    final JsonNode node = mapper.valueToTree(req.getRequestContext().getAuthorizer());
    final String sub = node.path("claims").path("sub").asText(null);
    return (sub == null || sub.isBlank()) ? ANONYMOUS_USER : sub;
  }

  private final String extractItemId(final String route) {
    return route.substring(Route.ITEMS_PREFIX.toString().length());
  }
}
