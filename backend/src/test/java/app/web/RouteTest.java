package app.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class RouteTest {

  @Test
  void testRouteMatches() {
    assertTrue(Route.ME.matches("/v1/me"));
    assertFalse(Route.ME.matches("/v1/items"));
    assertFalse(Route.ME.matches("/v1/me/extra"));
  }

  @Test
  void testRouteIsPrefixOf() {
    assertTrue(Route.ITEMS.isPrefixOf("/v1/items"));
    assertTrue(Route.ITEMS.isPrefixOf("/v1/items/123"));
    assertFalse(Route.ITEMS.isPrefixOf("/v1/me"));
    assertFalse(Route.ITEMS.isPrefixOf("/v1/item"));
  }

  @Test
  void testRouteToString() {
    assertEquals("/v1/me", Route.ME.toString());
    assertEquals("/v1/items", Route.ITEMS.toString());
    assertEquals("/v1/items/", Route.ITEMS_PREFIX.toString());
  }

  @Test
  void testItemsPrefixMatching() {
    assertTrue(Route.ITEMS_PREFIX.isPrefixOf("/v1/items/"));
    assertTrue(Route.ITEMS_PREFIX.isPrefixOf("/v1/items/123"));
    assertTrue(Route.ITEMS_PREFIX.isPrefixOf("/v1/items/abc-def"));
    assertFalse(Route.ITEMS_PREFIX.isPrefixOf("/v1/items"));
  }

  @Test
  void testRouteMatchesEdgeCases() {
    assertFalse(Route.ME.matches(null));
    assertFalse(Route.ME.matches(""));
    assertFalse(Route.ME.matches("/v1/ME"));
    assertTrue(Route.ME.matches("/v1/me"));
  }

  @Test
  void testRouteIsPrefixOfEdgeCases() {
    assertFalse(Route.ITEMS.isPrefixOf(null));
    assertFalse(Route.ITEMS.isPrefixOf(""));
    assertFalse(Route.ITEMS.isPrefixOf("/v1/ITEMS"));
    assertTrue(Route.ITEMS.isPrefixOf("/v1/items"));
  }

  @Test
  void testAllRouteValues() {
    assertEquals(3, Route.values().length);
    assertEquals(Route.ME, Route.valueOf("ME"));
    assertEquals(Route.ITEMS, Route.valueOf("ITEMS"));
    assertEquals(Route.ITEMS_PREFIX, Route.valueOf("ITEMS_PREFIX"));
  }

  @Test
  void testRouteMatchesExactly() {
    assertTrue(Route.ITEMS.matches("/v1/items"));
    assertFalse(Route.ITEMS.matches("/v1/items/"));
    assertFalse(Route.ITEMS.matches("/v1/items/123"));
  }
}
