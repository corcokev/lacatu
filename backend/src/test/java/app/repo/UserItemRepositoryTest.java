package app.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import app.model.UserItem;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@ExtendWith(MockitoExtension.class)
public final class UserItemRepositoryTest {

  @Mock private DynamoDbEnhancedClient enhancedClient;

  @Mock private DynamoDbTable<UserItemRecord> table;

  private UserItemRepository repository;
  private final String tableName = "test-table";

  @BeforeEach
  void setUp() {
    when(enhancedClient.<UserItemRecord>table(
            eq(tableName), ArgumentMatchers.<TableSchema<UserItemRecord>>any()))
        .thenReturn(table);
    repository = new UserItemRepository(enhancedClient, tableName);
  }

  @Test
  final void testPut() {
    final String userId = "user123";
    final String itemId = "item456";
    final String value = "test value";
    final long now = System.currentTimeMillis();

    final UserItem result = repository.put(userId, itemId, value, now);

    verify(table).putItem(any(UserItemRecord.class));
    assertEquals(userId, result.userId);
    assertEquals(itemId, result.itemId);
    assertEquals(value, result.value);
    assertEquals(now, result.createdAt);
    assertEquals(now, result.updatedAt);
  }

  @Test
  final void testGetFound() {
    final String userId = "user123";
    final String itemId = "item456";
    final UserItemRecord record = createTestRecord(userId, itemId);

    when(table.getItem(any(Key.class))).thenReturn(record);

    final Optional<UserItem> result = repository.get(userId, itemId);

    assertTrue(result.isPresent());
    assertEquals(userId, result.get().userId);
    assertEquals(itemId, result.get().itemId);
  }

  @Test
  final void testGetNotFound() {
    final String userId = "user123";
    final String itemId = "item456";

    when(table.getItem(any(Key.class))).thenReturn(null);

    final Optional<UserItem> result = repository.get(userId, itemId);

    assertFalse(result.isPresent());
  }

  @Test
  final void testDelete() {
    final String userId = "user123";
    final String itemId = "item456";

    repository.delete(userId, itemId);

    verify(table).deleteItem(any(Key.class));
  }

  private final UserItemRecord createTestRecord(final String userId, final String itemId) {
    final UserItemRecord record = new UserItemRecord();
    record.setUserId(userId);
    record.setItemId(itemId);
    record.setValue("test value");
    record.setCreatedAt(System.currentTimeMillis());
    record.setUpdatedAt(System.currentTimeMillis());
    return record;
  }
}
