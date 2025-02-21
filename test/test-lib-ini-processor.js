'use strict';

const should = require('should');
const fs = require('fs');
const ini = require('ini');
const td = require('testdouble');

describe('INI Tests', () => {
  const INI_FILE = '/tmp/file.ini';
  const INI_REF_FILE = '/tmp/file-refmerge.ini';
  const INI_MERGE_FILE = '/tmp/file-merge.ini';
  const INI_FILE_WRITE = '/tmp/file-write.ini';

  beforeEach(() => {});

  afterEach(() => {
    td.reset();
    try {
      fs.unlinkSync(INI_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(INI_REF_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(INI_MERGE_FILE);
    } catch (e) {
      // suppress error
    }
    try {
      fs.unlinkSync(INI_FILE_WRITE);
    } catch (e) {
      // suppress error
    }
  });

  it('process: should throw error with no arguments', (done) => {
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .process()
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Requires a file path to process.'));
        done();
      });
  });

  it('process: should throw error when ini.parse throws error', (done) => {
    fs.writeFileSync(INI_FILE, '', 'utf-8');
    td.replace(ini, 'parse', () => {
      throw new Error('An error occurred.');
    });
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .process(INI_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Empty file, nothing to process.'));
        done();
      });
  });

  it('process: should process the file with no ref settings', (done) => {
    const iniContent = fs.readFileSync(INI_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(INI_FILE, iniContent, 'utf-8');
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .process(INI_FILE)
      .then((results) => {
        should(results).be.eql({
          dataString: '{"test":true}',
          key: undefined,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('process: should process the file with ref settings', (done) => {
    const iniContent = fs.readFileSync(INI_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const iniRefContent = fs.readFileSync(INI_REF_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(INI_FILE, iniContent, 'utf-8');
    fs.writeFileSync(INI_REF_FILE, iniRefContent, 'utf-8');
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .process(INI_REF_FILE)
      .then((results) => {
        should(results).be.eql({
          dataString: '{"another":{"test":true}}',
          key: undefined,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('process: should throw error with merge settings', (done) => {
    const iniContent = fs.readFileSync(INI_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const iniRefContent = fs.readFileSync(INI_REF_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    const iniMergeContent = fs.readFileSync(INI_MERGE_FILE.replace('/tmp', `${__dirname}/data`), 'utf-8');
    fs.writeFileSync(INI_FILE, iniContent, 'utf-8');
    fs.writeFileSync(INI_REF_FILE, iniRefContent, 'utf-8');
    fs.writeFileSync(INI_MERGE_FILE, iniMergeContent, 'utf-8');
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .process(INI_MERGE_FILE)
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('INI config does not support $merge settings.'));
        done();
      });
  });

  it('write: should throw error on write', (done) => {
    td.replace(fs, 'writeFile', (outputFile, compiled, options, cb) => cb(new Error('An error occurred.')));
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .write(INI_FILE_WRITE, { test: true })
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('An error occurred.'));
        done();
      });
  });

  it('write: should write to output file', (done) => {
    td.replace(fs, 'writeFile', (outputFile, compiled, options, cb) => cb());
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .write(INI_FILE_WRITE, { test: true })
      .then((results) => {
        should(results).be.eql({
          outputFile: INI_FILE_WRITE,
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('dump: should throw error on dump', (done) => {
    td.replace(ini, 'stringify', () => {
      throw new Error('An error occurred.');
    });
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .dump({ test: true })
      .then(() => {
        done('Rejection failed.');
      })
      .catch((err) => {
        should(err).be.eql(new Error('Error: An error occurred.'));
        done();
      });
  });

  it('dump: should dump to output file', (done) => {
    const iniProcessor = require('../lib/processor-ini');

    iniProcessor
      .dump({ test: true })
      .then((results) => {
        should(results).be.eql({
          content: 'test=true\n',
        });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
