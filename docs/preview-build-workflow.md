# Preview build workflow

For higher-risk fixes that should be validated before merge, use the repository-local Docker Compose build configuration.

Dry-run validation:

```bash
docker compose config
docker compose build
```

When the image tags are intentionally ready to publish:

```bash
docker compose push
```

Do not push preview images unless the target image tags are deliberate.
