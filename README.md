# Webflow MCP Server
[![smithery badge](https://smithery.ai/badge/@kapilduraphe/webflow-mcp-server)](https://smithery.ai/server/@kapilduraphe/webflow-mcp-server)

An MCP server that lets Claude read information about your Webflow sites.

<a href="https://glama.ai/mcp/servers/un9r0vtmku">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/un9r0vtmku/badge" alt="Webflow Server MCP server" />
</a>

## Prerequisites

- [Node.js](https://nodejs.org/) v22 or higher (check with `node --version`)
- [Git](https://git-scm.com/)
- [Claude Desktop](https://claude.ai/download)
- A Webflow account

## Setup

### 1. Create a Webflow API token

1. In Webflow, open your site's **Site settings → Apps & integrations → API access**.
2. Click **Generate API token**.
3. Give it the **Sites: Read** scope. This is the only scope the server needs.
4. Copy the token. Webflow only shows it once.

A site token only gives access to that one site. To see several sites, use a token or OAuth access token that covers them.

### 2. Clone and build

```bash
git clone https://github.com/kapilduraphe/webflow-mcp-server.git
cd webflow-mcp-server
npm ci
```

`npm ci` installs the exact dependency versions from `package-lock.json` and builds the server into `dist/`.

Note two paths for the next step:

```bash
pwd          # the repo folder; the server is at <this path>/dist/index.js
which node   # the Node.js binary (on Windows: where node)
```

### 3. Add the server to Claude Desktop

Open the Claude Desktop config file. In Claude Desktop, go to **Settings → Developer → Edit Config**. The file is at:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add the `webflow` entry under `mcpServers`, using the paths from step 2 and your token:

```json
{
  "mcpServers": {
    "webflow": {
      "command": "/full/path/to/node",
      "args": ["/full/path/to/webflow-mcp-server/dist/index.js"],
      "env": {
        "WEBFLOW_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

- Use the full path to `node` rather than just `"node"`. Claude Desktop may otherwise pick up an older Node.js version, especially if you use nvm.
- On Windows, double the backslashes in JSON paths, for example `"C:\\Users\\you\\webflow-mcp-server\\dist\\index.js"`.
- If the file already has other servers, add `webflow` alongside them inside `mcpServers`.

### 4. Restart and check it works

Fully quit Claude Desktop and reopen it. Then ask Claude:

> List my Webflow sites.

Claude should call the `get_sites` tool and show your sites. If it doesn't, see [Troubleshooting](#troubleshooting).

## Available tools

### get_sites

Lists all Webflow sites the token can access. For each site, it returns:

- Display name
- Site ID and workspace ID
- Created and last published dates
- Preview URL

### get_site

Gets one site by ID. Takes a `siteId` (from `get_sites`) and returns the same fields plus the site's short name.

## Running without Claude Desktop

For local testing, you can run the server directly. Create a `.env` file in the repo folder. It is gitignored, so it won't be committed:

```plaintext
WEBFLOW_API_TOKEN=your-api-token
```

Then run:

```bash
npm start
```

The server talks over standard input/output (stdio), so after the startup messages it waits silently for an MCP client. That is expected; press `Ctrl+C` to stop it. Claude Desktop does not read `.env`, it uses the token from its own config.

## Updating

```bash
git pull
npm ci
```

Then restart Claude Desktop.

## Troubleshooting

### Webflow tools don't appear in Claude

- Fully quit and reopen Claude Desktop after editing the config.
- Check that both paths in the config are absolute and that `dist/index.js` exists. If it doesn't, run `npm ci` again.
- Check that the config file is valid JSON (no trailing commas).
- Check the logs (below).

### "WEBFLOW_API_TOKEN is not defined"

The token isn't set. In Claude Desktop, check the `env` block in the config. When using `npm start`, check the `.env` file.

### Authentication or "Failed to fetch" errors

- Check that the token is correct and hasn't been revoked.
- Check that the token has the **Sites: Read** scope.

### Errors mentioning syntax or unsupported features

Claude Desktop is probably running an old Node.js version. Set `"command"` to the full path from `which node`, and make sure `node --version` is v22 or higher.

### Viewing logs

macOS:

```bash
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

Windows (PowerShell):

```powershell
Get-Content -Path "$env:APPDATA\Claude\logs\mcp*.log" -Wait -Tail 20
```

## Other install option: Smithery

You can also install through [Smithery](https://smithery.ai/server/@kapilduraphe/webflow-mcp-server):

```bash
npx -y @smithery/cli install @kapilduraphe/webflow-mcp-server --client claude
```

## Security

- Keep your API token secret. Don't commit it or paste it into chats or issues.
- Give the token only the **Sites: Read** scope.
- Rotate the token regularly, and revoke it in Webflow if it may have leaked.

## License

MIT. See [LICENSE](LICENSE).
