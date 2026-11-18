# Authentication and demo

## Account authentication

The backend supports password-based sign-up/sign-in and Google OAuth. Successful authentication issues JWT-backed access used by protected API routes. Google can also be linked/unlinked for an existing account. Password reset uses a time-limited token delivered through the configured email provider. OAuth callback URLs must point to the deployed backend and frontend origins.

Account and profile operations are server-backed and protected as described in the [API reference](APIReference.md). Do not put secrets in frontend environment variables; Vite variables are public in the built client.

## Demo experience

The demo is a browser-only experience designed to let visitors explore the same feature screens without creating an account or contacting the financial API. It uses prepared synthetic records and a frontend-local adapter that follows the application's existing data shapes and feature rules. Supported edits affect the demo's local state so charts and summaries can respond, but are not written to the server or real user data.

Demo activity is isolated from server records. Both the active-demo marker and synthetic editable dataset are kept in the current tab's `sessionStorage`, so state lasts for that tab session and is discarded when the session ends or the demo is reset. It is not a per-user server session and does not create a database account. The browser adapter supports the app's data-backed demo interactions; server identity operations such as account settings, password changes, and Google linking are not part of the demo.

The exact routes available in demo mode depend on the current frontend's demo guard/navigation. The intended visible experience is the app's supported finance screens with synthetic data, not an imitation of authentication or a claim that every account-only operation works. When adding a feature, update the local adapter and demo screen coverage only if that feature can be represented faithfully with existing product behavior.

## Safety properties

- Demo records are synthetic and must not include real user financial details.
- Demo CRUD and reorder actions stay in current-tab `sessionStorage`.
- Demo requests should not fall through to real authenticated API calls.
- Leaving/resetting a demo should clear the demo context so it cannot be mistaken for a signed-in account.
- Account settings and linked identity integrations require normal authentication.

For local and hosted configuration, see [Deployment and operations](Deployment.md).
