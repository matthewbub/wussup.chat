# Hello

If you're looking at this code and thinking its absolute shit I am sorry. Believe it or not, I'm well versed in Next.js, complex JavaScript build systems, etc. This project started with an ambition to steer away from complex build systems and 3rd party services.

At the time of this writing, Next.js is still a pain in the ass to host outside of Vercel. Clerk has some spooky pricing that I wouldn't mind paying for if I billed my clients 1mil a year (but i don't). and ORMs like Primsa, Supabase Drizzle are all great but they just don't feel as slick as some raw ass SQL in a Sqlite3 file that I manage myself.

I also prefer hosting code on a VPS compared to say; Vercel. There's something special about having that base level of control. All this to say there's a lot about this application that's local first which imo makes the level of ownership feel good.

## Guiding Principles

It's a server driven app. We're pretty heavily tied to the MVC pattern with HTMX. I don't see a future where this get's re-written into something like React unless it's for a mobile application. Mostly because it would need to be a full rewrite with JSON responses instead of HTML. I already looked into it; it's a one way street this HTMX stuff.

On the plus side, from experience; taking the template approach requires very little maintenance overtime. Given the low levels of complexity, I expect the features built in this functional area to be well-behaved as far out as 20 years from now. (Hard to speak for the OpenAPI endpoint, but everything else is solid)

### JavaScript

- Global: `public/js`
- Per Page: Inline scripts

It's just easier to track and manage the code when its all in one file. We're just using vanilla JavaScript and I'd need a pretty good reason as to why vanilla JavaScript wouldn't suffice as a solution to what we're building.

### CSS

- Global: `public/css`
- Per Page: Inline styles

Again, it's easier to track and manage the code when it's all in one file. Just regular CSS, we're not looking for anything fancy that would require a CDN or build step.

### Templates (HTML / Views)

- Directory: `pkg/views`

We're using a library called [Templ](https://templ.guide/). The way the code compiles is extremely annoying, but I don't know of anything better for Golang. If you're using VSCode, checkout the Templ extension, it makes working with Templ templates tolerable. If you're using Goland, you should be good.
