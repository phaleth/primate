# Primate 

Expressive, minimal and extensible framework for JavaScript

## Getting started

Run `npx -y primate@latest create` to create a project structure.

Create a route in `routes/index.js`

```js
// getting-started.js
```

Run `npm i && npm start` and visit `localhost:6161` in your browser.

## Table of Contents

- [Serving content](#serving-content)
  - [Plain text](#plain-text)
  - [JSON](#json)
  - [Streams](#streams)
  - [Response](#response)
  - [HTML](#html)
- [Routing](#routing)
  - [Basic](#basic)
  - [The request object](#the-request-object)
  - [Accessing the request body](#accessing-the-request-body)
  - [Parameterized routes](#parameterized-routes)
  - [Explicit handlers](#explicit-handlers)

## Serving content

Create a file in `routes/index.js` to handle the special `/` route.

### Plain text

```js
// serving-content/plain-text.js
```

### JSON

```js
// serving-content/json.js
```

### Streams

```js
// serving-content/streams.js
```

### Response

```js
// serving-content/response.js
```

### HTML

```js
// serving-content/html.js
```

## Routing

Primate uses filesystem-based routes. Every path a client accesses is mapped to 
a route under `routes`.

* `index.js` handles the root route (`/`)
* `post.js` handles the `/post` route
* `post/{postId}.js` handles a parameterized route where `{postId}` can
  be mapped to anything, such as `/post/1`

### Basic

```js
// routing/basic.js
```

### The request object

```js
// routing/the-request-object.js
```

### Accessing the request body

For requests containing a body, Primate will attempt to parse the body according
to the content type sent along the request. Currently supported are
`application/x-www-form-urlencoded` (typically for form submission) and
`application/json`.

```js
// routing/accessing-the-request-body.js
```

### Parameterized routes

```js
// routing/parameterized-routes.js
```

### Explicit handlers

Often we can figure out the content type to respond with based on the return
type from the handler. For other cases, we need to use an explicit handler.

```js
// routing/explicit-handlers.js
```

## Resources

* Website: https://primatejs.com
* IRC: Join the `#primate` channel on `irc.libera.chat`.

## License

MIT