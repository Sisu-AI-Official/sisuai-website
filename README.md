# sisuai.net

Marketing site for **Sisu AI** ([sisuai.net](https://sisuai.net)) — static HTML/CSS/JS
deployed on **Netlify**, with a Resend-backed contact form.

This repo is one site in the Sisu AI setup. It is also mounted as a submodule in the
private umbrella repo `Sisu-AI-Official/sisuai` (under `sites/sisuai.net`), but it
stands alone — clone and work on it directly.

## Structure

```
public/                                 # Netlify publish dir (the deployed files)
  index.html                            #   Main landing page (English)
  one-person-company-workshop.html      #   Workshop landing page (Vietnamese)
  _redirects                            #   Netlify URL redirects
  css/  js/  images/  branding/
functions/
  send-contact.js                       # Contact form -> Resend email
netlify.toml                            # publish = public, functions = functions
```

## Environments

| Branch    | Environment | Deploys to                          |
|-----------|-------------|-------------------------------------|
| `staging` | Staging     | staging URL (e.g. `staging.sisuai.net`) |
| `main`    | Live        | `sisuai.net`                        |

Work and review on `staging`; promote by merging `staging` → `main`.

## Local development

```bash
npx serve public
# or, to test the contact function:
npx netlify dev
```

## Netlify setup

- **Base directory**: repo root (leave blank)
- publish dir and functions come from `netlify.toml` (`public` / `functions`)
- **Production branch**: `main`; enable **branch deploys** for `staging`
- Env var: `RESEND_API_KEY` (Resend API key for `send-contact`)

## Contributing

1. Branch off `staging`.
2. Open a PR into `staging`; review the staging deploy.
3. Once approved, `staging` is merged into `main` to go live.
