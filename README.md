# node-rate-limiter [![Build Status](https://travis-ci.org/mujichOk/node-rate-limiter.svg?branch=master)](https://travis-ci.org/mujichOk/node-rate-limiter)

  Simple calls rate limiter for [Node.js®](https://nodejs.org), inspired by [@tj](https://github.com/tj)'s [node-ratelimiter](https://github.com/tj/node-ratelimiter)
 
  Package contains **NodeRateLimiter** that uses different adaptors for store rate's data to varios stores.<br/> 
  By default **NodeRateLimiter** supports local process memory, but you can also use following adaptors:
   - **[node-rate-limiter-redis](https://github.com/mujichOk/node-rate-limiter-redis)** - adaptor for [Redis](https://redis.io) database 

# Install 
```
npm install node-rate-limiter
```

# Usage

You can find default values under **NodeRateLimiter** namespace 

```js
  NodeRateLimiter.defaults = {
    rateLimit: 5000,      // default number of call for current timeframe
    expiration: 3600000,  // default duration in ms of current timeframe
    timeout: 500          // default timeout in ms of reset/get methods call
  };
```

You can use default in memory store of current process just providing empty adaptor

```js
const NodeRateLimiter = require('node-rate-limiter');
const nodeRateLimiter = new NodeRateLimiter();
```

Or You can use one of the existing providers 

```js
const NodeRateLimiter = require('node-rate-limiter');
const SomeAdaptor = require('some-adaptor-package');

const nodeRateLimiter = new NodeRateLimiter(new SomeAdaptor({/*...*/}));
```

You can wrap your internal system module method

```js
function someInternalSystemModuleMethod(clientId, arg1, /*...*/ argN, callback) {
  nodeRateLimiter.get(clientId, (err, limit) => {
      if (err) {
        throw err;
      }

      if (!limit.remaining) {
        return callback(new NodeRateLimiter.RateLimitError(limit));
      }

      someInternalSystemModule.someMethod(arg1, /*...*/ argN, callback);
  });
}
```

Or use it like middleware f.ex in [Express](http://expressjs.com)

```js
const NodeRateLimiter = require('node-rate-limiter');
const SomeAdaptor = require('some-adaptor-package');

const nodeRateLimiter = new NodeRateLimiter(new SomeAdaptor({/*...*/}));

const express = require('express');
const app = express();

app.use('/api', RequestRateLimitMiddleware);
app.get('/api/integers/:a/add/:b', (req, res) => res.send(parseInt(req.params.a) + parseInt(req.params.b)));
app.get('/api/integers/:a/sub/:b', (req, res) => res.send(parseInt(req.params.a) - parseInt(req.params.b)));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});


function RequestRateLimitMiddleware(req, res, next) {
  nodeRateLimiter.get(res.yourUniqIdForCurrentSession, (err, limit) => {
    if (err) {
      return next(err);
    }

    res.set('X-RateLimit-Limit', limit.total);
    res.set('X-RateLimit-Remaining', limit.remaining);
    res.set('X-RateLimit-Reset', limit.reset);

    if (limit.remaining) {
      return next();
    }

    res.set('Retry-After', limit.reset);
    res.send(429, `Rate limit exceeded, retry in ${limit.reset} ms`);
  });
}
```

If method call least too long, then callback will fires with Timeout error.

```js
  nodeRateLimiter.get(someId, (err, limit) => {
    if (err && err.name = 'TimeoutError') {
      /* handle timeout error */
      return;
    }

    /* ... */
  });
```

# License

  [MIT](https://raw.githubusercontent.com/mujichOk/node-rate-limiter/master/LICENSE)
