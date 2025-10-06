package app.service;

import app.model.UserItem;
import app.repo.UserItemRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.inject.Inject;

public final class ItemService {
  private final UserItemRepository repo;

  @Inject
  public ItemService(final UserItemRepository repo) {
    this.repo = repo;
  }

  public final UserItem create(final String userId, final String value) {
    final String id = UUID.randomUUID().toString();
    final long now = System.currentTimeMillis();
    return repo.put(userId, id, value, now);
  }

  public final UserItem update(final String userId, final String itemId, final String value) {
    final long now = System.currentTimeMillis();
    return repo.put(userId, itemId, value, now);
  }

  public final Optional<UserItem> get(final String userId, final String id) {
    return repo.get(userId, id);
  }

  public final List<UserItem> list(final String userId) {
    return repo.list(userId);
  }

  public final void delete(final String userId, final String id) {
    repo.delete(userId, id);
  }
}
