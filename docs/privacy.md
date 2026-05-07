# Privacy

Z3 SMT Game includes no analytics in v1.

The app stores only local browser preferences and progress:

- selected puzzle id,
- completed puzzle ids,
- optional local LLM endpoint,
- optional local LLM model.

This data stays in `localStorage` on the user's device.

The optional local LLM button sends the current puzzle prompt, clues, SMT-LIB, and solution to the endpoint typed in the page. By default that endpoint is:

http://localhost:11434/api/generate

No hosted LLM API key is used. No secrets are required by the frontend.
