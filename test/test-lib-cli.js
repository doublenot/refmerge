'use strict';

const should = require('should');
const td = require('testdouble');
const { exec } = require('child_process');
const fs = require('fs');

describe('Bin Tests', () => {
  let stdoutContent = null;
  const YAML_FILE = '/tmp/file.yaml';

  beforeEach(() => {
    stdoutContent = `Usage: refmerge [options] <file>

Options:
  -V, --version        output the version number
  -o, --output <file>  The path for the output file
  -h, --help           output usage information
`;
  });

  afterEach(() => {
    td.reset();
    stdoutContent = null;
    try {
      fs.unlinkSync(YAML_FILE);
    } catch (e) {
      // suppress error
    }
  });

  it('should display help with no arguments', (done) => {
    exec('node ./bin/refmerge.js', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(stdoutContent);
      should(stderr).be.eql('');
      done();
    });
  });

  it("should display help with '-h'", (done) => {
    exec('node ./bin/refmerge.js -h', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(stdoutContent);
      should(stderr).be.eql('');
      done();
    });
  });

  it("should display help with '--help'", (done) => {
    exec('node ./bin/refmerge.js --help', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(stdoutContent);
      should(stderr).be.eql('');
      done();
    });
  });

  it("should display version with '-V'", (done) => {
    const pkgInfo = require('../package.json');

    exec('node ./bin/refmerge.js -V', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(`${pkgInfo.version}\n`);
      should(stderr).be.eql('');
      done();
    });
  });

  it("should display version with '--version'", (done) => {
    const pkgInfo = require('../package.json');

    exec('node ./bin/refmerge.js --version', (error, stdout, stderr) => {
      should(error).be.eql(null);
      should(stdout).be.eql(`${pkgInfo.version}\n`);
      should(stderr).be.eql('');
      done();
    });
  });
});
