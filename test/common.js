const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

global.expect = chai.expect;
global.assert = chai.assert;
global.sinon = sinon;

chai.use(sinonChai);