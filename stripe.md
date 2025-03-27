# Stripe

When working with Stripe, you'll need to run the webhook locally to test the payment flow. Its no big deal.

the official documentation for both prod and dev are 
here: https://dashboard.stripe.com/test/webhooks but this is the gist of it for us:

## DEV

Lets walk through the setup process and how to obtain 
the `STRIPE_WEBHOOK_SECRET` API Key for local development

First login to Stripe via the CLI

```shell
stripe login
```

Once you're authenticated you can run the webhook 
locally. Then run the following command to listen to the 
webhook locally

```shell
stripe listen --forward-to localhost:3000/api/webhook
```

This is a webhook, so its going to need to stay running 
while your developing. (Basically, run this in its own 
terminal window) 

You're going to see a message that keeps getting printed 
to the terminal when this is running, it will look 
something like this:

```shell
> Ready! You are using Stripe API Version [2022-11-15]. 
Your webhook signing secret is whsec_50... (^C to quit)
```

That `whsec_50...` is your `STRIPE_WEBHOOK_SECRET` API 
key. You'll need to manually add this to your `local.
env` file.

Note: The local webhook secret will change each time you 
launch a new instance of the webhook listener. Just 
follow the steps above and you'll be solid.

## PRODUCTION

wip to document this, its easier just add the URL 
endpoint to Stripe in production and grab the `STRIPE_WEBHOOK_SECRET` from there. 

the prod webhook url** 

## More:

- https://docs.stripe.com/payment-links/post-payment
