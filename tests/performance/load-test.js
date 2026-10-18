import http from 'k6/http';
import { check, sleep } from 'k6';

// Define the load: 100 concurrent users (matching NFR-02)
export const options = {
  stages: [
    { duration: '10s', target: 100 }, // Ramp up to 100 users
    { duration: '20s', target: 100 }, // Stay at 100 users
    { duration: '5s', target: 0 },    // Ramp down
  ],
  thresholds: {
    // NFR-02: 95% of requests must be under 3 seconds (3000ms)
    http_req_duration: ['p(95)<3000'], 
  },
};

export default function () {
  // Change this URL if your backend runs on a different port (e.g., 3000, 5000)
  const url = 'http://localhost:3001/api/requests'; 
  
  const payload = JSON.stringify({
    category: 'pothole',
    description: 'Test pothole from K6 load test',
    lat: -25.7461,
    lng: 28.1881,
    // Mock base64 photo string to pass validation
    photo: 'data:image/jpeg;base64,dummybase64string...' 
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  // Check that the server returns a 201 Created
  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
