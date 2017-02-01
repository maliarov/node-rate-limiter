const util = require('util');
const once = require('once');

const adaptors = {};

module.exports = NodeRateLimiter;

NodeRateLimiter.registerAdaptor = registerAdaptor;
NodeRateLimiter.TimeoutError = TimeoutError;

util.inherits(TimeoutError, Error);


function NodeRateLimiter(opts) {
    opts = opts || {};

    let adaptor = opts.adaptor;

    if (!adaptor && opts.adaptorName) {
        const Adaptor = adaptors[opts.adaptorName] && adaptors[opts.adaptorName].versions[opts.adaptorVer || 'default'];
        if (!Adaptor) {
            throw new Error('adaptor not initialized');
        }

        adaptor = new Adaptor(opts.adaptorOpts);
    }

    opts.adaptorName = adaptor.name;
    opts.adaptorVer = adaptor.ver;

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
};

function registerAdaptor(opts) {
    const ver = opts.ver || 'default';

    adaptors[opts.name] = adaptors[opts.name] || {};
    adaptors[opts.name].ver = adaptors[opts.name].ver || {};

    if (adaptors[opts.name].versions[ver]) {
        throw new Error(`adaptor with same name [${opts.name}] and version [${ver}] already registered`);
    }

    adaptors[opts.name].versions[ver] = opts;
}