package app.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import app.model.UserItem;
import app.repo.UserItemRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public final class ItemServiceTest {

  @Mock private UserItemRepository repository;

  private ItemService service;

  @BeforeEach
  void setUp() {
    service = new ItemService(repository);
  }

  @Test
  final void testCreate() {
    final String userId = "user123";
    final String value = "test value";
    final UserItem expectedItem = createTestItem(userId, "generated-id", value);

    when(repository.put(eq(userId), anyString(), eq(value), anyLong())).thenReturn(expectedItem);

    final UserItem result = service.create(userId, value);

    assertEquals(expectedItem, result);
    verify(repository).put(eq(userId), anyString(), eq(value), anyLong());
  }

  @Test
  final void testUpdate() {
    final String userId = "user123";
    final String itemId = "item456";
    final String value = "updated value";
    final UserItem expectedItem = createTestItem(userId, itemId, value);

    when(repository.put(eq(userId), eq(itemId), eq(value), anyLong())).thenReturn(expectedItem);

    final UserItem result = service.update(userId, itemId, value);

    assertEquals(expectedItem, result);
    verify(repository).put(eq(userId), eq(itemId), eq(value), anyLong());
  }

  @Test
  final void testGetFound() {
    final String userId = "user123";
    final String itemId = "item456";
    final UserItem expectedItem = createTestItem(userId, itemId, "test value");

    when(repository.get(userId, itemId)).thenReturn(Optional.of(expectedItem));

    final Optional<UserItem> result = service.get(userId, itemId);

    assertTrue(result.isPresent());
    assertEquals(expectedItem, result.get());
  }

  @Test
  final void testGetNotFound() {
    final String userId = "user123";
    final String itemId = "item456";

    when(repository.get(userId, itemId)).thenReturn(Optional.empty());

    final Optional<UserItem> result = service.get(userId, itemId);

    assertFalse(result.isPresent());
  }

  @Test
  final void testList() {
    final String userId = "user123";
    final List<UserItem> expectedItems =
        Arrays.asList(
            createTestItem(userId, "item1", "value1"), createTestItem(userId, "item2", "value2"));

    when(repository.list(userId)).thenReturn(expectedItems);

    final List<UserItem> result = service.list(userId);

    assertEquals(expectedItems, result);
  }

  @Test
  final void testDelete() {
    final String userId = "user123";
    final String itemId = "item456";

    service.delete(userId, itemId);

    verify(repository).delete(userId, itemId);
  }

  private final UserItem createTestItem(
      final String userId, final String itemId, final String value) {
    final UserItem item = new UserItem();
    item.userId = userId;
    item.itemId = itemId;
    item.value = value;
    item.createdAt = System.currentTimeMillis();
    item.updatedAt = System.currentTimeMillis();
    return item;
  }
}
