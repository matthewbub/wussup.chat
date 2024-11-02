# CORS (Cross-Origin Resource Sharing)

The application implements CORS protection through a middleware that controls which origins can access the API.

## Current Implementation

The CORS middleware dynamically configures allowed origins based on the environment:

### Production

- Only allows requests from `https://zcauldron.com`

### Development

- Allows requests from:
  - Frontend: `http://localhost:3001`
  - Backend: `http://localhost:8080`

## Configuration

CORS settings are controlled through two main files:

1. `pkg/constants/app_config.go` - Defines domains and ports
2. `pkg/middleware/cors.go` - Implements the CORS logic

To modify allowed origins, update the `AppConfig` struct in `app_config.go`:

```go
var AppConfig = Config{
    ProductionDomain:  "your-domain.com",
    DevelopmentDomain: "localhost",
    DevelopmentPorts: struct {
        Frontend int
        Backend  int
    }{
        Frontend: 3001,
        Backend:  8080,
    },
}
```

## Best Practices

1. **Environment Separation**

   - Maintain strict separation between development and production CORS rules
   - Never allow development origins in production

2. **Security**

   - Always validate origins against a whitelist
   - Use HTTPS in production
   - Minimize the number of allowed origins

3. **Monitoring**

   - Log CORS violations
   - Monitor for unusual patterns
   - Set up alerts for repeated violations

4. **Configuration**
   - Keep CORS configuration easily updatable
   - Document all allowed origins
   - Regular review of CORS policies
