import { readFileSync, writeFileSync } from "fs";
// import Cloudflare from "cloudflare";

async function fetchIP(): Promise<string> {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = (await response.json()) as { ip: string };
  return data.ip;
}

async function updateIP(newIP: string): Promise<void> {
  const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
  const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID!;
  const CLOUDFLARE_DNS_RECORDS = JSON.parse(
    process.env.CLOUDFLARE_DNS_RECORDS!,
  );

  for (const record of CLOUDFLARE_DNS_RECORDS) {
    const url = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${record.id}`;
    const body = {
      type: "A",
      name: record.name,
      content: newIP,
      ttl: 3600,
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result: any = await response.json();
    console.log("Cloudflare response:", result);

    if (!result.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(result.errors)}`);
    }
  }
}

async function updateEnvFile(key: string, value: string): Promise<void> {
  const envPath = ".env";
  let content = "";

  try {
    content = readFileSync(envPath, "utf-8");
  } catch (e) {
    // File doesn't exist, create it
  }

  const lines = content.split("\n");
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.startsWith(`${key}=`)) {
      lines[i] = `${key}=${value}`;
      found = true;
      break;
    }
  }

  if (!found) {
    lines.push(`${key}=${value}`);
  }

  writeFileSync(envPath, lines.filter((line) => line.trim()).join("\n") + "\n");
}

export async function checkIP(): Promise<boolean> {
  console.log("Checking IP...");
  const ip = await fetchIP();
  const currentIP = process.env.CURRENT_IP;

  if (ip !== currentIP) {
    console.log(`IP has changed from ${currentIP} to ${ip}`);
    await updateIP(ip);
    await updateEnvFile("CURRENT_IP", ip);
    console.log(`IP was updated`);
    return true;
  }
  console.log(`IP is still the same: ${ip}`);
  return false;
}
