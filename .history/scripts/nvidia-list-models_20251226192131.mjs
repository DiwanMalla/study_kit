import "dotenv/config";

const baseURL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const apiKey = process.env.NVIDIA_API_KEY;

if (!apiKey) {
  console.error("Missing NVIDIA_API_KEY in env.");
  process.exit(1);
}

const res = await fetch(`${baseURL}/models`, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
});

if (!res.ok) {
  const text = await res.text().catch(() => "");
  console.error(`Request failed (${res.status}): ${text}`);
  process.exit(1);
}

const json = await res.json();

// Try to print the useful bits without assuming exact schema.
const data = Array.isArray(json?.data) ? json.data : null;
if (!data) {
  console.log(JSON.stringify(json, null, 2));
  process.exit(0);
}

for (const item of data) {
  const id = item?.id ?? "(no id)";
  const ownedBy = item?.owned_by ?? item?.ownedBy ?? "";
  console.log(`${id}${ownedBy ? `  (${ownedBy})` : ""}`);
}
