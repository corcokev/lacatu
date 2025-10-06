package app.repo;

import app.model.UserItem;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

public final class UserItemRepository {
  private final DynamoDbEnhancedClient enhanced;
  private final DynamoDbTable<UserItemRecord> table;

  public UserItemRepository(final DynamoDbEnhancedClient enhanced, final String tableName) {
    this.enhanced = enhanced;
    this.table = enhanced.table(tableName, TableSchema.fromBean(UserItemRecord.class));
  }

  public final UserItem put(
      final String userId, final String itemId, final String value, final long now) {
    final UserItemRecord r = new UserItemRecord();
    r.setUserId(userId);
    r.setItemId(itemId);
    r.setValue(value);
    r.setCreatedAt(now);
    r.setUpdatedAt(now);
    table.putItem(r);
    return toModel(r);
  }

  public final Optional<UserItem> get(final String userId, final String itemId) {
    final Key key = Key.builder().partitionValue(userId).sortValue(itemId).build();
    final UserItemRecord r = table.getItem(key);
    return Optional.ofNullable(r).map(this::toModel);
  }

  public final List<UserItem> list(final String userId) {
    final List<UserItem> out = new ArrayList<>();
    for (final UserItemRecord r :
        table
            .query(
                r ->
                    r.queryConditional(
                        QueryConditional.keyEqualTo(Key.builder().partitionValue(userId).build())))
            .items()) {
      out.add(toModel(r));
    }
    return out;
  }

  public final void delete(final String userId, final String itemId) {
    final Key key = Key.builder().partitionValue(userId).sortValue(itemId).build();
    table.deleteItem(key);
  }

  private final UserItem toModel(final UserItemRecord r) {
    final UserItem m = new UserItem();
    m.userId = r.getUserId();
    m.itemId = r.getItemId();
    m.value = r.getValue();
    m.createdAt = r.getCreatedAt();
    m.updatedAt = r.getUpdatedAt();
    return m;
  }
}
