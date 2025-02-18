import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { WebflowClient } from "webflow-api";
import { z } from "zod";

const accessToken =
  process.env.WEBFLOW_API_TOKEN ||
  (() => {
    throw new Error("WEBFLOW_API_TOKEN is not defined");
  })();

// Initialize the server
const server = new Server(
  {
    name: "webflow-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const schemas = {
  toolInputs: {
    getSite: z.object({
      siteId: z.string().min(1, "Site ID is required"),
    }),
    getSites: z.object({}),
  },
};

interface WebflowApiError {
  status?: number;
  message: string;
  code?: string;
}

type ToolHandler = (args: unknown) => Promise<{
  content: Array<{ type: "text"; text: string }>;
}>;

// Utility functions
function isWebflowApiError(error: unknown): error is WebflowApiError {
  return error !== null && typeof error === "object" && "code" in error;
}

function formatDate(date: Date | undefined | null): string {
  if (!date) return "N/A";
  return date.toLocaleString();
}

// Tool definitions
const TOOL_DEFINITIONS = [
  {
    name: "get_site",
    description:
      "Retrieve detailed information about a specific Webflow site by ID, including workspace, creation date, display name, and publishing details",
    inputSchema: {
      type: "object",
      properties: {
        siteId: {
          type: "string",
          description: "The unique identifier of the Webflow site",
        },
      },
      required: ["siteId"],
    },
  },
  {
    name: "get_sites",
    description:
      "Retrieve a list of all Webflow sites accessible to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// Tool handlers
const toolHandlers: Record<string, ToolHandler> = {
  get_site: async (args: unknown) => {
    const { siteId } = schemas.toolInputs.getSite.parse(args);

    try {
      const webflow = new WebflowClient({ accessToken });
      const site = await webflow.sites.get(siteId);

      if (!site) {
        throw new Error("Site not found");
      }

      const formattedSite = `• Site Details:
            ID: ${site.id}
            Display Name: ${site.displayName}
            Short Name: ${site.shortName}
          
          - Workspace Information:
            Workspace ID: ${site.workspaceId}
          
          - Dates:
            Created On: ${formatDate(site?.createdOn)}
            Last Published: ${formatDate(site?.lastPublished)}
          
          - URLs:
            Preview URL: ${site.previewUrl || "N/A"}`;

      return {
        content: [
          {
            type: "text" as const,
            text: formattedSite,
          },
        ],
      };
    } catch (error: unknown) {
      if (isWebflowApiError(error) && error.code === "NOT_FOUND") {
        return {
          content: [
            {
              type: "text" as const,
              text: `Site with ID ${siteId} not found.`,
            },
          ],
        };
      }
      console.error("Error fetching site:", error);
      throw new Error("Failed to fetch site details");
    }
  },

  get_sites: async () => {
    try {
      const webflow = new WebflowClient({ accessToken });
      const { sites } = await webflow.sites.list();

      if (!Array.isArray(sites) || sites.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No sites found for this account.",
            },
          ],
        };
      }

      const formattedSites = sites
        .map(
          (site) => `
• Site: ${site.displayName}
  - ID: ${site.id}
  - Workspace: ${site.workspaceId}
  - Created: ${formatDate(site?.createdOn)}
  - Last Published: ${formatDate(site?.lastPublished)}
  - Preview URL: ${site.previewUrl || "N/A"}
`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `Found ${sites.length} sites:\n${formattedSites}`,
          },
        ],
      };
    } catch (error: unknown) {
      console.error("Error fetching sites:", error);
      throw new Error("Failed to fetch sites list");
    }
  },
};

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("Tools requested by client");
  return { tools: TOOL_DEFINITIONS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const handler = toolHandlers[name as keyof typeof toolHandlers];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return await handler(args);
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    throw error;
  }
});

// Start the server
async function main() {
  try {
    // Check for required environment variables
    const requiredEnvVars = ["WEBFLOW_API_TOKEN"];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );
    if (missingVars.length > 0) {
      console.error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
      process.exit(1);
    }

    console.error("Starting server with env vars:", {
      WEBFLOW_API_TOKEN: "[REDACTED]",
    });

    const transport = new StdioServerTransport();
    console.error("Created transport");

    await server.connect(transport);
    console.error("Connected to transport");

    console.error("Webflow MCP Server running on stdio");
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
