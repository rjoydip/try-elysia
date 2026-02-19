# Elysia Application

[![React Doctor](https://www.react.doctor/share/badge?p=try-elysia&s=96&w=29&f=26)](https://www.react.doctor/share?p=try-elysia&s=96&w=29&f=26)

This project is a high-performance server application built with [ElysiaJS](https://elysiajs.com) and running on the [Bun](https://bun.sh) runtime, [node](https://nodejs.org/en/) and [worked](https://cloudflare.com).

## Prerequisites

- Ensure you have [Bun](https://bun.sh) installed on your machine.
- Ensure you have [node](https://nodejs.org/en/) installed on your machine.

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
```

## Development

To start the development server run:

```bash
bun run dev
```

## Generate Auth Schema

For generating `better-auth` schema please use below command.

```bash
bun x @better-auth/cli@latest generate --output ./src/db/schema/auth.ts
```

Open [http://localhost:3000/](http://localhost:3000/) with your browser to see the result.
