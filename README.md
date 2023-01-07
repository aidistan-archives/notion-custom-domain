# Notion Custom Domain

A rework of [hosso/notion-custom-domain](https://github.com/hosso/notion-custom-domain).


## What's different?

This repo is a **self-hosted** version while the origin is a serverless version
aiming at serving on Vercel.

## How to use it?

1. Clone the repo
2. Build the image
3. Run with proper parameters

Here is an example *docker-compose.yaml* file:

```yaml
version: "3.9"

services:
  notion:
    build: ./
    image: notion
    restart: always
    ports:
        - 3000:3000
    environment:
        START_PAGE_URL: https://fluorescent-trawler-4fe.notion.site/Notion-Custom-Domain-2a8cdabb8ab440579ca40950d79a04b5
        GA_TRACKING_ID:
```

## Real example

```mermaid
flowchart
  origin(https://fluorescent-trawler-4fe.notion.site/Notion-Custom-Domain-2a8cdabb8ab440579ca40950d79a04b5)
  target(https://notion-custom-domain.hosso.co)

  origin --> target

  click origin href "https://fluorescent-trawler-4fe.notion.site/Notion-Custom-Domain-2a8cdabb8ab440579ca40950d79a04b5"
  click target href "https://notion-custom-domain.hosso.co"
```

[![Notion Custom Domain](https://user-images.githubusercontent.com/19500280/93695277-d99aa400-fb4f-11ea-8e82-5c431110ce19.png)](https://notion-custom-domain.hosso.co)
