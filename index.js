const util = require('util');
const once = require('once');

module.exports = NodeRateLimiter;

NodeRateLimiter.TimeoutError = TimeoutError;

util.inherits(TimeoutError, Error);


function NodeRateLimiter(opts) {
    opts = opts || {};

    const adaptor = opts.adaptor;
    if (!adaptor) {
        throw new Error('adaptor not defined');
    }

    this.reset =(id, callback) => prepare(callback, () => adaptor.reset(id, callback));
    this.get = (id, opts, callback) => prepare(callback, () => adaptor.get(id, opts, callback));


    function prepare(fail, next) {
        if (isPrepared) {
            return next();
        }

        adaptor.prepare((err) => {
            if (err) {
                return fail(err);
            }
            
            isPrepared = true;
            next();
        });
    }
}

function TimeoutError(message, extra) {
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
}