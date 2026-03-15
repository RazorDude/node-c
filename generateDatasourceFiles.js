"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const configProvider_1 = require("../common/configProvider");
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const logPrefix = '[Node-C][generateDatasourceFiles]';
    console.info(`${logPrefix}: Loading configurations...`);
    const appModule = yield Promise.resolve(`${path_1.default.resolve(process.cwd(), './dist/app.module')}`).then(s => __importStar(require(s)));
    const { appConfigs, envKeys, envKeysParentNames, useEnvFile, useEnvFileWithPriority } = appModule.AppModuleBase
        .configProviderModuleRegisterOptions;
    const envName = process.env['DATASOURCE_ENV'];
    const envProfileConfigName = `appConfigProfile${envName.charAt(0).toUpperCase()}${envName.substring(1, envName.length)}`;
    const config = yield configProvider_1.ConfigProviderService.loadConfig({
        appConfigCommon: appConfigs['appConfigCommon'],
        [envProfileConfigName]: appConfigs[envProfileConfigName]
    }, { envKeys, envKeysParentNames, envName, useEnvFile, useEnvFileWithPriority });
    const { data } = config;
    const moduleNames = ((_a = process.env['MODULE_NAMES']) === null || _a === void 0 ? void 0 : _a.split(',')) || [];
    console.info(`${logPrefix}: Configurations loaded. Generating files for ${moduleNames.length} modules...`);
    for (const i in moduleNames) {
        const moduleName = moduleNames[i];
        const innerLogPrefix = `${logPrefix}[${moduleName}]`;
        console.info(`${innerLogPrefix}: Generating files for the module...`);
        const moduleConfig = data[moduleName];
        if (!moduleConfig) {
            console.info(`${innerLogPrefix}: No module config found.`);
            continue;
        }
        const { type: moduleType } = moduleConfig;
        if (moduleType === configProvider_1.RDBType.ClickHouse || !Object.values(configProvider_1.RDBType).includes(moduleType)) {
            console.info(`${innerLogPrefix}: Module type ${moduleType} is not eligible for file generation.`);
            continue;
        }
        yield configProvider_1.ConfigProviderService.generateOrmconfig(config, {
            entitiesPathInModule: 'entities',
            migrationsPathInModule: 'migrations',
            moduleName,
            modulePathInProject: `src/data/${moduleName}`,
            seedsPathInModule: 'seeds'
        });
        console.info(`${innerLogPrefix}: Module files generated successfully.`);
    }
    console.info(`${logPrefix}: Files generated successfully.`);
}))().then(() => process.exit(0), err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=generateDatasourceFiles.js.map