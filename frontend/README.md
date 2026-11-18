# Finance Manager frontend

The frontend is a React application built with Vite. Project-wide setup and the MySQL/API requirements are in the [root README](../README.md); feature behavior is documented in [`docs/`](../docs/README.md).

## Local development

From the repository root:

```bash
npm ci --prefix frontend
npm run dev --prefix frontend
```

The default local API origin is `http://localhost:4000`. Set `VITE_API_URL` in `frontend/.env` when the API runs elsewhere. Vite-exposed environment variables are included in browser code, so do not put credentials or private keys in them.

Other available scripts are `npm run build --prefix frontend`, `npm run lint --prefix frontend`, and `npm run preview --prefix frontend`.

## App behavior

The frontend contains the signed-in finance screens and a browser-local demo experience. Demo mode uses synthetic records and a local adapter; edits stay within the demo browser state and must not be treated as account data. The demo does not provide account identity/settings operations.

Keep route-level loading states and responsive chart interactions in mind when changing shared components. For backend request paths and payloads, see [API reference](../docs/APIReference.md).
