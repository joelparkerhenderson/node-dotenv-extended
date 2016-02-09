/**
 * Created by Keith Morris on 2/9/16.
 */
import _ from 'lodash';
import dotenv from 'dotenv';
import fs from 'fs';
import winston from 'winston';

function loadEnvironmentFile(path, encoding, silent) {
    try {
        var data = fs.readFileSync(path, encoding);
        return dotenv.parse(data);
    } catch (err) {
        if (!silent) {
            winston.error(err.message);
        }
        return {};
    }
}
export const parse = dotenv.parse.bind(dotenv);
export const config = options => {

    var defaultsData, environmentData,
        defaultOptions = {
            encoding: 'utf-8',
            silent: true,
            environment: '.env',
            defaults: '.env.defaults',
            schema: '.env.schema',
            errorOnMissing: false,
            errorOnExtra: false,
            assignToProcessEnv: true,
            overrideProcessEnv: false
        };

    options = _.assign({}, defaultOptions, options);

    defaultsData = loadEnvironmentFile(options.defaults, options.encoding, options.silent);
    environmentData = loadEnvironmentFile(options.environment, options.encoding, options.silent);

    let configData = _.assign({}, defaultsData, environmentData);

    if (options.errorOnMissing || options.errorOnExtra) {
        let schemaKeys = _.keys(loadEnvironmentFile(options.schema, options.encoding, options.silent));
        let configKeys = _.keys(configData);

        let missingKeys = _.filter(schemaKeys, function (key) {
            return configKeys.indexOf(key) < 0;
        });
        let extraKeys = _.filter(configKeys, function (key) {
            return schemaKeys.indexOf(key) < 0;
        });
        if (options.errorOnMissing && missingKeys.length) {
            throw new Error('MISSING CONFIG VALUES: ' + missingKeys.join(' ,'));
        }

        if (options.errorOnExtra && extraKeys.length) {
            throw new Error('EXTRA CONFIG VALUES: ' + extraKeys.join(', '));
        }
    }

    if (options.assignToProcessEnv) {
        if (options.overrideProcessEnv) {
            _.assign(process.env, configData);
        } else {
            const tmp = _.assign({}, configData, process.env);
            _.assign(process.env, tmp);
        }
    }
    return configData;
};

export const load = config;
