package app.web;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class ApiResponse {
  private static final String DEFAULT_ORIGIN = "http://localhost:5173";
  private static final String ERROR_KEY = "error";

  private final ObjectMapper mapper;
  private final String origin;
  private final List<String> allowedOrigins;

  private final String pickOrigin(final String requestOrigin) {
    if (requestOrigin != null && allowedOrigins.contains(requestOrigin)) {
      return requestOrigin;
    }
    return DEFAULT_ORIGIN;
  }

  public ApiResponse(
      final ObjectMapper mapper, final String origin, final List<String> allowedOrigins) {
    this.mapper = mapper;
    this.origin = origin;
    this.allowedOrigins = allowedOrigins;
  }

  public ApiResponse(
      final ObjectMapper mapper,
      final String originHeader,
      final boolean pickOrigin,
      final List<String> allowedOrigins) {
    this.mapper = mapper;
    this.allowedOrigins = allowedOrigins;
    this.origin = pickOrigin ? pickOrigin(originHeader) : originHeader;
  }

  public ApiResponse(
      final ObjectMapper mapper,
      final APIGatewayProxyRequestEvent req,
      final List<String> allowedOrigins) {
    this.mapper = mapper;
    this.allowedOrigins = allowedOrigins;
    final String originHeader =
        req.getHeaders() != null
            ? Optional.ofNullable(req.getHeaders().get("origin"))
                .orElse(req.getHeaders().get("Origin"))
            : null;
    this.origin = pickOrigin(originHeader);
  }

  public final APIGatewayProxyResponseEvent ok(final Object body) {
    return generateResponseEvent(200, body);
  }

  public final APIGatewayProxyResponseEvent created(final Object body) {
    return generateResponseEvent(201, body);
  }

  public final APIGatewayProxyResponseEvent updated(final Object body) {
    return generateResponseEvent(200, body);
  }

  public final APIGatewayProxyResponseEvent badRequest(final String message) {
    return generateResponseEvent(400, Map.of(ERROR_KEY, message));
  }

  public final APIGatewayProxyResponseEvent notFound(final String message) {
    return generateResponseEvent(404, Map.of(ERROR_KEY, message));
  }

  public final APIGatewayProxyResponseEvent methodNotAllowed(final String message) {
    return generateResponseEvent(405, Map.of(ERROR_KEY, message));
  }

  public final APIGatewayProxyResponseEvent unauthorized(final String message) {
    return generateResponseEvent(401, Map.of(ERROR_KEY, message));
  }

  public final APIGatewayProxyResponseEvent serverError(final String message) {
    return generateResponseEvent(500, Map.of(ERROR_KEY, message));
  }

  // Convenience methods with predefined error messages
  public final APIGatewayProxyResponseEvent routeNotFound() {
    return notFound("Route not found");
  }

  public final APIGatewayProxyResponseEvent methodNotAllowed() {
    return methodNotAllowed("Method not allowed");
  }

  public final APIGatewayProxyResponseEvent itemNotFound() {
    return notFound("Not found");
  }

  public final APIGatewayProxyResponseEvent invalidBody() {
    return badRequest("Invalid body; expected {\"value\":\"...\"}");
  }

  public final APIGatewayProxyResponseEvent unauthorized() {
    return unauthorized("Authentication required");
  }

  // Exception-based error methods with prefixes
  public final APIGatewayProxyResponseEvent badRequestWithException(final Exception e) {
    return badRequest("Bad request: " + e.getMessage());
  }

  public final APIGatewayProxyResponseEvent methodNotAllowedWithException(final Exception e) {
    return methodNotAllowed("Method not allowed: " + e.getMessage());
  }

  public final APIGatewayProxyResponseEvent serverErrorWithException(final Exception e) {
    return serverError("Unexpected error: " + e.getMessage());
  }

  public final APIGatewayProxyResponseEvent noContent() {
    return new APIGatewayProxyResponseEvent()
        .withStatusCode(204)
        .withHeaders(corsHeaders())
        .withBody("");
  }

  private final APIGatewayProxyResponseEvent generateResponseEvent(
      final int status, final Object body) {
    return new APIGatewayProxyResponseEvent()
        .withStatusCode(status)
        .withHeaders(corsHeaders())
        .withBody(toJson(body));
  }

  private final String toJson(final Object body) {
    if (body == null) return "";
    if (body instanceof String) return (String) body;
    try {
      return mapper.writeValueAsString(body);
    } catch (final Exception e) {
      return "{\"error\":\"serialization\"}";
    }
  }

  private final Map<String, String> corsHeaders() {
    final Map<String, String> h = new HashMap<>();
    h.put("Access-Control-Allow-Origin", origin);
    h.put("Access-Control-Allow-Headers", "Authorization,Content-Type");
    h.put("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    return h;
  }
}
