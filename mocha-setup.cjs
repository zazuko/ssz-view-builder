const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
require('chai-snapshot-matcher')

chai.use(sinonChai)
chai.use(chaiAsPromised)
