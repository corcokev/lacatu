package app.repo;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@DynamoDbBean
public final class UserItemRecord {
  private String userId;
  private String itemId;
  private String value;
  private Long createdAt;
  private Long updatedAt;

  public UserItemRecord() {
    // Default constructor required by DynamoDB Enhanced Client
  }

  @DynamoDbPartitionKey
  public final String getUserId() {
    return userId;
  }

  public final void setUserId(final String v) {
    userId = v;
  }

  @DynamoDbSortKey
  public final String getItemId() {
    return itemId;
  }

  public final void setItemId(final String v) {
    itemId = v;
  }

  public final String getValue() {
    return value;
  }

  public final void setValue(final String v) {
    value = v;
  }

  public final Long getCreatedAt() {
    return createdAt;
  }

  public final void setCreatedAt(final Long v) {
    createdAt = v;
  }

  public final Long getUpdatedAt() {
    return updatedAt;
  }

  public final void setUpdatedAt(final Long v) {
    updatedAt = v;
  }
}
