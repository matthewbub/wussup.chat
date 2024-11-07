# Authentication

Take a deep dive into the authentication layer

:::warning
We're deprecating server sessions. Moving forward we will only be using JWTs and server side cookies for traditional application development.
:::

We're handling authentication in various ways depending on the context. Code that is both generated via a template engine, and requires authentication is likely using server sessions (legacy). Code that runs through a proxy in React is using JWT and server side cookies. This approach is more complex but allows for more flexibility in the client.

:::info
WIP There is also plans to implement an API based authentication layer as a part of the zcauldron project but I haven't started that yet
:::
