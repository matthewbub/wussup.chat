# Generate Base64 Key

## Overview

We use a Base64-encoded key for application-level encryption to securely manage user sessions.

## Prerequisites

Just `go`

See the [Project Requirements](../../readme.md#project-requirements) in the root Readme for more information on the latest version.

## Usage

To generate a key, navigate to the `/cmd/generate_base64_key` directory and execute the application:

```bash
go run main.go
```

Example output:

```bash
# Expected output
Generated base64 key: tG3wGlXtvbz9lp4JG5XcIG5GRDz0ZxXKwXlgLXyR82o=
```

Copy the full contents of your key. In the example above, your key would begin with "t" and end with "=".

To generate another key, run the command again.

## Security

If your key has been exposed, replace it with a new key.
