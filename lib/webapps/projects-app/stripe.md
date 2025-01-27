# Stripe

There's only 1 product in this app. In Stripe, I listed it as "Pro" for $9.00/mo

We're using a simple Billing Link to create subscriptions. It's literally just a link to the stripe product subscription checkout form. https://docs.stripe.com/payment-links/create

when debugging the payments, we need to launch the stripe webhook locally.

```shell
stripe listen --forward-to localhost:3000/api/webhook
```

add the prod webhook url https://dashboard.stripe.com/test/webhooks

## More:

- https://docs.stripe.com/payment-links/post-payment
