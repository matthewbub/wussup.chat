# Route Definitions

The AuthV3 service is built and hosted with modern and secure underlying technologies: Hono, Cloudflare Workers, Cloudflare's D3, OpenAPI and TypeScript.

The OpenAPI part is a bitch tbh, it's such a mess of nested objects. When I first started working on the API I wasn't aware of design patterns and their benefits so the initial pass is really just using the module pattern to scope groups of controllers that are similar.

I really seemed to have gone off the rails with the Open API spec definitions. Moving forward we'll try to use the
