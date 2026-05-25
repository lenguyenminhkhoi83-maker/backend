CORS configuration

This project uses the `CORS_ORIGIN` environment variable to restrict allowed origins for browser requests.

- Format: a comma-separated list of origins, e.g. `https://example.com,https://app.example.com`
- If `CORS_ORIGIN` is not set:
  - In `development` mode, localhost origins (http://localhost[:port]) are allowed for convenience.
  - In other environments, requests from browser origins will be rejected until you set `CORS_ORIGIN`.

Set the environment variable before starting the server, for example:

PowerShell:

```powershell
$env:CORS_ORIGIN = "https://example.com,https://app.example.com"
npm run start
```

Linux/macOS:

```bash
export CORS_ORIGIN="https://example.com,https://app.example.com"
npm run start
```
