# Webflow MCP Server
[![smithery badge](https://smithery.ai/badge/@kapilduraphe/webflow-mcp-server)](https://smithery.ai/server/@kapilduraphe/webflow-mcp-server)

This MCP server enables Claude to interact with Webflow's APIs.

<a href="https://glama.ai/mcp/servers/un9r0vtmku">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/un9r0vtmku/badge" alt="Webflow Server MCP server" />
</a>

## Prerequisites

- Node.js (v16 or higher)
- Claude Desktop App
- Webflow Account
- Webflow API Token (Site token or OAuth Acces Token)

## Setup Instructions

### 1. Create a Webflow API Token

- Log in to your Webflow account
- Navigate to Site Settings > Apps & Integrations
- Generate a new API token
- Copy the token value (you won't be able to see it again)

Alternatively, you can also generate an OAuth Access Token.

### 2. Initial Project Setup

Install dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file for local development (don't commit this file):

```plaintext
WEBFLOW_API_TOKEN=your-api-token
```

### 4. Configure Claude Desktop

Open your Claude Desktop configuration file:

For MacOS:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

For Windows:

```bash
code %AppData%\Claude\claude_desktop_config.json
```

Add or update the configuration:

```json
{
    "mcpServers": {
        "webflow": {
            "command": "node",
            "args": [
                "/ABSOLUTE/PATH/TO/YOUR/build/index.js"
            ],
            "env": {
                "WEBFLOW_API_TOKEN": "your-api-token"
            }
        }
    }
}
```

Save the file and restart Claude Desktop.

### Installing via Smithery

To install Webflow MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@kapilduraphe/webflow-mcp-server):

```bash
npx -y @smithery/cli install @kapilduraphe/webflow-mcp-server --client claude
```

## Available Tools

The server currently provides the following tools:

### get_sites

Retrieves a list of all Webflow sites accessible to the authenticated user. Returns detailed information including:

- Site Display Name and Short Name
- Site ID and Workspace ID
- Creation, Last Updated, and Last Published Dates
- Preview URL
- Time Zone settings
- Custom Domains configuration
- Localization settings (primary and secondary locales)
- Data collection preferences

### get_site

Retrieves detailed information about a specific Webflow site by ID. Requires a siteId parameter and returns the same detailed information as get_sites for a single site.

## Type Definitions

```typescript
interface WebflowApiError {
    status?: number;
    message: string;
    code?: string;
}

interface WebflowCustomDomain {
    id: string;
    url: string;
    lastPublished: string;
}

interface WebflowLocale {
    id: string;
    cmsLocaleId: string;
    enabled: boolean;
    displayName: string;
    redirect: boolean;
    subdirectory: string;
    tag: string;
}

interface WebflowSite {
    id: string;
    workspaceId: string;
    createdOn: string;
    displayName: string;
    shortName: string;
    lastPublished: string;
    lastUpdated: string;
    previewUrl: string;
    timeZone: string;
    parentFolderId?: string;
    customDomains: WebflowCustomDomain[];
    locales: {
        primary: WebflowLocale;
        secondary: WebflowLocale[];
    };
    dataCollectionEnabled: boolean;
    dataCollectionType: string;
}
```

## Error Handling

The server handles various error scenarios:

### Environment Errors

- Missing WEBFLOW_API_TOKEN
- Invalid API token

## Troubleshooting

### Common Issues

#### Tools not appearing in Claude

- Check Claude Desktop logs
- Verify WEBFLOW_API_TOKEN is set correctly
- Ensure the path to index.js is absolute and correct

#### Authentication Errors

- Verify your API token is valid
- Check if the token has the necessary permissions
- Ensure the token hasn't expired

### Viewing Logs

To view server logs:

For MacOS/Linux:

```bash
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

For Windows:

```powershell
Get-Content -Path "$env:AppData\Claude\Logs\mcp*.log" -Wait -Tail 20
```

### Environment Variables

If you're getting environment variable errors, verify:

- `WEBFLOW_API_TOKEN`: Should be a valid API token

## Security Considerations

- Keep your API token secure
- Don't commit credentials to version control
- Use environment variables for sensitive data
- Regularly rotate API tokens
- Monitor API usage in Webflow
- Use minimum required permissions for API token

## Support

If you encounter any issues:

- Check the troubleshooting section above
- Review Claude Desktop logs
- Examine the server's error output
- Check Webflow's API documentation

## License

MIT License - See LICENSE file for details.