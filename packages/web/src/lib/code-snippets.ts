const API_BASE = 'https://api.isburner.com';

export function getSnippets(email: string, apiKey: string): { language: string; code: string }[] {
  return [
    {
      language: 'cURL',
      code: `curl -H "X-API-Key: ${apiKey}" \\
  "${API_BASE}/api/check?email=${email}"`,
    },
    {
      language: 'JavaScript',
      code: `const res = await fetch(
  "${API_BASE}/api/check?email=${email}",
  { headers: { "X-API-Key": "${apiKey}" } }
);
const data = await res.json();
console.log(data.disposable);`,
    },
    {
      language: 'Python',
      code: `import requests

res = requests.get(
    "${API_BASE}/api/check",
    params={"email": "${email}"},
    headers={"X-API-Key": "${apiKey}"}
)
data = res.json()
print(data["disposable"])`,
    },
    {
      language: 'Go',
      code: `req, _ := http.NewRequest("GET",
    "${API_BASE}/api/check?email=${email}", nil)
req.Header.Set("X-API-Key", "${apiKey}")
resp, _ := http.DefaultClient.Do(req)`,
    },
    {
      language: 'Ruby',
      code: `require "net/http"
require "json"

uri = URI("${API_BASE}/api/check?email=${email}")
req = Net::HTTP::Get.new(uri)
req["X-API-Key"] = "${apiKey}"
res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |http|
  http.request(req)
}
data = JSON.parse(res.body)
puts data["disposable"]`,
    },
  ];
}
