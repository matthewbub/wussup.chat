## RPC Functions

### `delete_card_with_comments`

Delete cards while avoiding foreign key constraint violations. We can't delete the parent record (Projects_Cards) while child records (Projects_Comments) still exist.

```ts
const { error } = await supabase.rpc("delete_card_with_comments", {
  card_id: id,
});
```
