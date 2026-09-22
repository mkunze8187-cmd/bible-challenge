import http, { type IncomingMessage, type ServerResponse } from "node:http";

export interface RecordedRequest {
  method: string;
  url: string;
  headers: IncomingMessage["headers"];
  body: string;
}

export interface FixtureServer {
  baseUrl: string;
  requests: RecordedRequest[];
  close(): Promise<void>;
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function json(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
}

export async function startFixtureServer(): Promise<FixtureServer> {
  const requests: RecordedRequest[] = [];

  const server = http.createServer(async (request, response) => {
    const body = await readBody(request);
    requests.push({
      method: request.method ?? "GET",
      url: request.url ?? "/",
      headers: request.headers,
      body
    });

    if (request.url === "/feedback") {
      json(response, 200, { ok: true });
      return;
    }

    if (request.url === "/releases/latest") {
      json(response, 200, {
        tag_name: "v0.1.10",
        name: "Fixture Release",
        html_url: "https://example.test/releases/v0.1.10",
        assets: [
          { name: "BibleChallenge-Setup-0.1.10.exe", size: 1234 },
          { name: "BibleChallengeAdmin-Setup-0.1.10.exe", size: 1234 }
        ]
      });
      return;
    }

    json(response, 404, { error: "fixture route not found" });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Fixture server did not bind to a TCP port.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    requests,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      })
  };
}
