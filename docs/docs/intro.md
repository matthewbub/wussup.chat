---
sidebar_position: 1
---

# Welcome

Hey welcome to "z cauldron".

## Getting Started

WIP

### What you'll need

Here's the versions i'm running with right now:

- [Node.js](https://nodejs.org/en/download/) version 18.0
- [Go](https://go.dev/) version 1.23.1
- [SQLite](https://www.sqlite.org/download.html) version 3.43.2

## About the core stack

- [Go](https://go.dev/) - Server side programming language
- [Gin](https://gin-gonic.com/) - HTTP framework
- [SQLite](https://www.sqlite.org/) - Database that's easy to work with
- [React](https://react.dev/) - Web library
- [TanStack Router](https://tanstack.com/router) - Web routing system
- [Vite](https://vite.dev/) - JavaScript build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safe javascript
- [TailwindCSS + TailwindUI](https://tailwindui.com) - Prototype friendly component system
- [Docusaurus](https://docusaurus.io/) - Documentation site

## Project History

We're using [Go](https://go.dev/) with [Gin](https://gin-gonic.com/) and a driver for SQLite on the backend. This experience feels a bit like working with [Express.js](https://expressjs.com/).

When the project started, we were using Templ for markup with HTMX. Templ is a JSX-like template library that **requires an additional build command**. We've since migrated away from Templ / HTMX and are building new features in [React](https://react.dev/) with the [TanStack Router](https://tanstack.com/router). The new feature code exists in the `/routes` directory. The Templ code (`pkg/views`) that still exists is marked for deletion.

You can also ignore the `/website` directory, that was a prototype for the react application. Also marked for deletion.
