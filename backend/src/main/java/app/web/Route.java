package app.web;

public enum Route {
  ME("/v1/me"),
  ITEMS("/v1/items"),
  ITEMS_PREFIX("/v1/items/");

  private final String path;

  Route(final String path) {
    this.path = path;
  }

  @Override
  public final String toString() {
    return path;
  }

  public final boolean matches(final String route) {
    return path.equals(route);
  }

  public final boolean isPrefixOf(final String route) {
    if (route == null || route.isEmpty()) {
      return false;
    }
    return route.startsWith(path);
  }
}
