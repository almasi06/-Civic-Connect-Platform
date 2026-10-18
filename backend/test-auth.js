// 4. Sync one report
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
        history: [{ status: "submitted", at: "2026-10-13T13:00:00.000Z", by: "citizen" }],
        reporterDeviceId: "test-device-003",
        source: "web",
        syncState: "pending",
      },
    ],
  }),
});
console.log("/sync one:", oneRes.status, await oneRes.text());