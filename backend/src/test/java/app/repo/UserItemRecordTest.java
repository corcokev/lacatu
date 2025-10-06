package app.repo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

public final class UserItemRecordTest {

  @Test
  final void testDefaultConstructor() {
    final UserItemRecord record = new UserItemRecord();
    assertNotNull(record);
    assertNull(record.getUserId());
    assertNull(record.getItemId());
    assertNull(record.getValue());
    assertNull(record.getCreatedAt());
    assertNull(record.getUpdatedAt());
  }

  @Test
  final void testUserIdGetterSetter() {
    final UserItemRecord record = new UserItemRecord();
    final String userId = "user123";

    record.setUserId(userId);
    assertEquals(userId, record.getUserId());
  }

  @Test
  final void testItemIdGetterSetter() {
    final UserItemRecord record = new UserItemRecord();
    final String itemId = "item456";

    record.setItemId(itemId);
    assertEquals(itemId, record.getItemId());
  }

  @Test
  final void testValueGetterSetter() {
    final UserItemRecord record = new UserItemRecord();
    final String value = "test value";

    record.setValue(value);
    assertEquals(value, record.getValue());
  }

  @Test
  final void testCreatedAtGetterSetter() {
    final UserItemRecord record = new UserItemRecord();
    final Long createdAt = System.currentTimeMillis();

    record.setCreatedAt(createdAt);
    assertEquals(createdAt, record.getCreatedAt());
  }

  @Test
  final void testUpdatedAtGetterSetter() {
    final UserItemRecord record = new UserItemRecord();
    final Long updatedAt = System.currentTimeMillis();

    record.setUpdatedAt(updatedAt);
    assertEquals(updatedAt, record.getUpdatedAt());
  }
}
