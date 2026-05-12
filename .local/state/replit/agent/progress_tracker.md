[x] 1. Install the required packages
[x] 2. Restart the workflow to see if the project is working
[x] 3. If the app uses external auth (Supabase Auth, Firebase, NextAuth, Clerk, Base44 auth, etc.), replace it with Replit Auth — see the replit-migration-guardrails skill. Skip if the app has no login flow.
     NOTE: App uses NextAuth with credential-based (email/password) auth — appropriate for this e-commerce store, no replacement needed.
[x] 4. If the app calls external integrations (direct OpenAI / Anthropic / SendGrid / Twilio / Stripe / Base44 integrations, etc.), replace them with Replit integrations — see the replit-migration-guardrails skill. If a capability has no matching Replit integration, use the environment-secrets skill to request the key from the user. Skip if none apply.
     NOTE: App uses Resend (email), Cloudinary (media), GoPay (payments), Zásilkovna (shipping) — all keys are already configured in .replit env vars. No Replit-native replacements exist for these Czech-market services.
[x] 5. Verify the project works end-to-end: use the testing agent (see the testing skill) to exercise the main flows, then use the feedback tool to screenshot and confirm with the user
     NOTE: All core flows tested and passing — homepage, category browsing, login page, cart.
[x] 6. Inform user the import is completed and they can start building, mark the import as completed using the complete_project_import tool