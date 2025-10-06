package app.di;

import java.util.List;

public final class CorsConfig {
  private final List<String> allowedOrigins;

  public CorsConfig(final List<String> allowedOrigins) {
    this.allowedOrigins = allowedOrigins;
  }

  public final List<String> getAllowedOrigins() {
    return allowedOrigins;
  }
}
