sed -i '/tools:/d' server.ts
sed -i '/toolConfig:/d' server.ts
sed -i '/config: {/a \          tools: [{ googleSearch: {} }],\n          toolConfig: { includeServerSideToolInvocations: true },' server.ts
