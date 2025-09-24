import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Global error handlers for production stability
process.on('uncaughtException', (error) => {
  log(`UNCAUGHT EXCEPTION: ${error.message}`);
  log(`Stack trace: ${error.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`UNHANDLED REJECTION at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Only log response body for errors or small successful responses to improve performance
      // In production, avoid logging response bodies to prevent sensitive data exposure
      if (process.env.NODE_ENV !== "production") {
        if (capturedJsonResponse && (res.statusCode >= 400 || JSON.stringify(capturedJsonResponse).length < 200)) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } else if (capturedJsonResponse && res.statusCode < 400) {
          // For large successful responses, just log a summary
          const responseSize = JSON.stringify(capturedJsonResponse).length;
          logLine += ` :: {responseSize: ${responseSize} bytes}`;
        }
      } else {
        // In production, only log status and timing for security
        if (res.statusCode >= 400) {
          logLine += ` :: [error response - body redacted for security]`;
        }
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
      
      // Performance monitoring: log slow requests
      if (duration > 2000) {
        log(`⚠️  SLOW REQUEST: ${req.method} ${path} took ${duration}ms`);
      }
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details for debugging while preserving app stability
    log(`ERROR ${req.method} ${req.path} ${status}: ${message}`);
    if (err.stack) {
      log(`Stack trace: ${err.stack}`);
    }

    // Send error response without crashing the process
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Handle server startup errors before listening
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      log(`ERROR: Port ${port} is already in use`);
      process.exit(1);
    } else {
      log(`ERROR: Server failed to start: ${err.message}`);
      process.exit(1);
    }
  });

  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    log('Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    log('Received SIGINT. Shutting down gracefully...');
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
  } catch (error) {
    log(`FATAL ERROR: Failed to start application: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      log(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
})();
