import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import API routes from backend modules
import { apiRoutes } from "../../../../../api/src/modules/routes";
import { errorHandler } from "../../../../../api/src/middleware/errorHandler";

export const runtime = "nodejs";

const dummyIo: any = {
  to: () => ({
    emit: () => {}
  })
};

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", apiRoutes(dummyIo));
app.use(errorHandler);

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const bodyBuffer = Buffer.from(await req.arrayBuffer());

  return new Promise((resolve) => {
    const socket = new Socket();
    const reqStream = new IncomingMessage(socket);
    reqStream.url = url.pathname + url.search;
    reqStream.method = req.method;

    req.headers.forEach((val, key) => {
      reqStream.headers[key.toLowerCase()] = val;
    });

    const resStream = new ServerResponse(reqStream);
    const responseHeaders = new Headers();
    const chunks: Buffer[] = [];

    resStream.setHeader = (name: string, val: any) => {
      if (Array.isArray(val)) {
        val.forEach((v) => responseHeaders.append(name, String(v)));
      } else {
        responseHeaders.set(name, String(val));
      }
      return resStream;
    };

    resStream.writeHead = (statusCode: number, headers?: any) => {
      resStream.statusCode = statusCode;
      if (headers) {
        Object.entries(headers).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            v.forEach((val) => responseHeaders.append(k, String(val)));
          } else {
            responseHeaders.set(k, String(v));
          }
        });
      }
      return resStream;
    };

    resStream.write = (chunk: any) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };

    resStream.end = (chunk?: any, encoding?: any, cb?: any): any => {
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const body = Buffer.concat(chunks);
      resolve(
        new Response(body, {
          status: resStream.statusCode || 200,
          headers: responseHeaders
        })
      );
      if (cb) cb();
      return resStream;
    };

    app(reqStream, resStream);

    if (bodyBuffer.length > 0) {
      reqStream.push(bodyBuffer);
    }
    reqStream.push(null);
  });
}

export async function GET(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}

export async function PUT(req: Request) {
  return handleRequest(req);
}

export async function PATCH(req: Request) {
  return handleRequest(req);
}

export async function DELETE(req: Request) {
  return handleRequest(req);
}
