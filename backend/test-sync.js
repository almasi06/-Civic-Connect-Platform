// Sync endpoint test — end-to-end
const BASE = "http://localhost:4000";

async function main() {
  console.log("=== 1. Login ===");
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@tshwane.gov.za",
      password: "admin1234",
    }),
  });
  const loginBody = await loginRes.json();
  if (!loginRes.ok) {
    console.error("Login failed:", loginRes.status, loginBody);
    process.exit(1);
  }
  const token = loginBody.token;
  console.log("Login OK. Token length:", token.length);

  console.log("\n=== 2. Sync one report (fresh) ===");
  const oneRes = await fetch(`${BASE}/api/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      requests: [
        {
          id: "cccccccc-3333-3333-3333-333333333333",
          trackingNumber: "TSH-SYNC01",
          category: "water_leak",
          description: "Water leak near school",
          lat: -25.75,
          lng: 28.23,
          status: "submitted",
          version: 1,
          createdAt: "2026-10-13T13:00:00.000Z",
          updatedAt: "2026-10-13T13:00:00.000Z",
          history: [
            {
              status: "submitted",
              at: "2026-10-13T13:00:00.000Z",
              by: "citizen",
            },
          ],
          reporterDeviceId: "test-device-003",
          source: "web",
          syncState: "pending",
        },
      ],
    }),
  });
  const oneBody = await oneRes.json();
  console.log("Status:", oneRes.status);
  console.log("Body:", JSON.stringify(oneBody));

  console.log("\n=== 3. Sync the SAME report again (idempotency test) ===");
  const againRes = await fetch(`${BASE}/api/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      requests: [
        {
          id: "cccccccc-3333-3333-3333-333333333333",
          trackingNumber: "TSH-SYNC01",
          category: "water_leak",
          description: "Water leak near school",
          lat: -25.75,
          lng: 28.23,
          status: "submitted",
          version: 1,
          createdAt: "2026-10-13T13:00:00.000Z",
          updatedAt: "2026-10-13T13:00:00.000Z",
          history: [
            {
              status: "submitted",
              at: "2026-10-13T13:00:00.000Z",
              by: "citizen",
            },
          ],
          reporterDeviceId: "test-device-003",
          source: "web",
          syncState: "pending",
        },
      ],
    }),
  });
  const againBody = await againRes.json();
  console.log("Status:", againRes.status);
  console.log("Body:", JSON.stringify(againBody));
  console.log("(should be {\"accepted\":[]} because idempotency key was already recorded)");

  console.log("\n=== 4. List all requests ===");
  const listRes = await fetch(`${BASE}/api/requests`);
  const listBody = await listRes.json();
  console.log("Total reports:", listBody.length);
  for (const r of listBody) {
    console.log(`  - ${r.trackingNumber} | ${r.category} | ${r.status}`);
  }

  console.log("\n=== Done ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});