# Chat

1000 messages mo

i guess this is v4

- on page load (server component)
  - Create a `meta` row if one does not exist (we need an ID to tie messages too; regardless of weather their signed in or not)
    These values wont change mid-session; Store in Redis for fast grab
    RETURNS `user.id`, `user.subscription_status`, `user.subscription_period_start`, `user.last_day_reset`, `user.last_month_reset`
  - Validate Subscription in Stripe
  - With the `user.id`, Get the list of `threads` (`threads.user_id`) that are associated with the meta.id.
    - Include the `messages` (`messages.chat_session_id` `messages.user_id`) of the current session if the `session` URL param is present.
- on page mount (client component)
  - Send HTTP request to check the quota available for user. (Redis)
    - If user.subscription_status is 'active'
      - COUNT messages sent between NOW and `user.subscription_period_start` (Supabase)
      - Compare `appConfig.plans.pro.monthlyMaxCount` against message COUNT from this month
      - RETURN the COUNT (messagesSent - maxCount)
    - If user.subscription_status is 'free' or null
      - COUNT messages sent between NOW and `user.last_month_reset` (Supabase)
      - Compare `appConfig.plans.free.monthlyMaxCount` against message COUNT from the month query
      - COUNT messages sent between NOW and `user.last_day_reset` (Supabase)
      - Compare `appConfig.plans.free.dailyMaxCount` against message COUNT from the day query
      - RETURN the COUNT (messagesSentThisMonth - maxCountThisMonth) AND the COUNT (messagesSentToday - maxCountToday)
    - STORE the Response: {sentThisMonth, sentToday} in Redis, (mid-session chats will read/write to Redis and write to Supabase)
  - Return client-only obj: permissions.is_allowed_to_chat, permissions.can_chat_again_on (date when they can chat again)
  - Set info into Client state
- on chat
  - Send HTTP request to chat endpoint / Respond with chat
- on chat completion
  - Update Client State Messages
  - Can user still chat or have they reached their daily/ monthly quota?
  - Send a HTTP Request
    - Store chat input, output, inputTokens, outputTokens in Supabase
    - UPDATE the values in Redis: {sentThisMonth, sentToday}
