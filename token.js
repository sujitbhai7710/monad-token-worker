var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
async function fetchSingleRequest(url, clientId) {
  if (!clientId) {
    throw new Error("THIRDWEB_CLIENT_ID is not configured");
  }
  
  // Append clientId to URL if not already present
  const finalUrl = url.includes('clientId=') ? url : `${url}&clientId=${clientId}`;
  
  console.log("Making request to:", finalUrl);
  
  const response = await fetch(finalUrl, {
    headers: {
      "Accept": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Thirdweb API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      url: finalUrl,
      clientId: clientId ? "present" : "missing"
    });
    throw new Error(`Thirdweb API error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

function isValidApiKey(request, env) {
  const apiKey = request.headers.get("X-API-Key");
  return apiKey === env.PROTECTION_API_KEY;
}
__name(isValidApiKey, "isValidApiKey");

var index_default = {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
      "Access-Control-Max-Age": "86400"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    if (!isValidApiKey(request, env)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Invalid or missing API key." }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      let response;
      if (path.includes("/metadata/refresh")) {
        const pathParts = path.split("/");
        const contractAddress = pathParts[pathParts.length - 2];
        const tokenId = pathParts[pathParts.length - 1];
        if (!contractAddress || !tokenId) {
          throw new Error("Contract address and token ID are required for metadata refresh");
        }
        if (!env.THIRDWEB_CLIENT_ID) {
          throw new Error("THIRDWEB_CLIENT_ID is not configured in the worker");
        }
        const baseUrl = "https://insight.thirdweb.com/v1";
        const chain = "10143";
        const refreshUrl = `${baseUrl}/nfts/metadata/refresh/${contractAddress}/${tokenId}?chain=${chain}&clientId=${env.THIRDWEB_CLIENT_ID}`;
        console.log("Refreshing metadata for:", { contractAddress, tokenId, url: refreshUrl });
        const refreshResponse = await fetch(refreshUrl, {
          method: "POST",
          headers: {
            "Accept": "application/json"
          }
        });
        if (!refreshResponse.ok) {
          const errorText = await refreshResponse.text();
          console.error("Metadata refresh failed:", {
            status: refreshResponse.status,
            statusText: refreshResponse.statusText,
            body: errorText
          });
          throw new Error(`Failed to refresh metadata: ${refreshResponse.status} - ${errorText}`);
        }
        response = await refreshResponse.json();
        console.log("Metadata refresh successful:", response);
      } else {
        const address = url.searchParams.get("address");
        if (!address) {
          throw new Error("Address parameter is required");
        }
        if (!env.THIRDWEB_CLIENT_ID) {
          throw new Error("THIRDWEB_CLIENT_ID is not configured in the worker");
        }
        const baseUrl = "https://insight.thirdweb.com/v1";
        const chain = "10143";
        if (path.includes("/erc20")) {
          // Use direct fetch without pagination for tokens
          const apiUrl = `${baseUrl}/tokens/erc20/${address}?chain=${chain}&metadata=true&include_spam=true&limit=100`;
          const result = await fetchSingleRequest(apiUrl, env.THIRDWEB_CLIENT_ID);
          response = { balances: result.data || [] };
          console.log("ERC20 response:", JSON.stringify(response));
        } else if (path.includes("/erc721")) {
          // Use direct fetch without pagination for NFTs
          const apiUrl = `${baseUrl}/tokens/erc721/${address}?chain=${chain}&metadata=true&limit=100`;
          const result = await fetchSingleRequest(apiUrl, env.THIRDWEB_CLIENT_ID);
          response = { nfts: result.data || [] };
          console.log("ERC721 response:", JSON.stringify(response));
        } else if (path.includes("/erc1155")) {
          // Use direct fetch without pagination for ERC1155 tokens
          const apiUrl = `${baseUrl}/tokens/erc1155/${address}?chain=${chain}&metadata=true&limit=100`;
          const result = await fetchSingleRequest(apiUrl, env.THIRDWEB_CLIENT_ID);
          response = { balances: result.data || [] };
          console.log("ERC1155 response:", JSON.stringify(response));
        } else {
          throw new Error("Invalid endpoint");
        }
      }
      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error("Worker Error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
          details: error instanceof Error ? error.stack : void 0
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
