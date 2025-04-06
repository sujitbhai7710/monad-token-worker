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
      
      // Metadata refresh functionality has been removed
      
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
        
        // Check if the address is a 1 Million Nad holder
        const nadsContractAddress = "0x922da3512e2bebbe32bcce59adf7e6759fb8cea2";
        const isNadHolder = (result.data || []).some(token => 
          token.contract?.address?.toLowerCase() === nadsContractAddress.toLowerCase()
        );
        
        response = { 
          is1MillionNadHolder: isNadHolder,
          nfts: result.data || [] 
        };
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
