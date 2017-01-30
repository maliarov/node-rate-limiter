module.exports = function (adaptor) {
    let isPrepared = false;

    this.reset = (id, callback) => prepare(callback, () => adaptor.reset(id, callback));
    this.get = (id, opts, callback) => prepare(callback, () => adaptor.get(id, opts, callback));


    function prepare(fail, callback) {
        if (isPrepared) {
            return callback();
        }

        adaptor.prepare((err) => {
            if (err) {
                return fail(err);
            }
            isPrepared = true;
            callback();
        });
    }
};

module.exports.adaptors = require('./adaptors');
