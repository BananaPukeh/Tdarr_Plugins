"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
// tdarrSkipTest
var fs_1 = require("fs");
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var details = function () { return ({
    name: 'Add Subtitle Branding',
    description: 'Prepends a 5 second branding message to SRT/ASS subtitle tracks.',
    style: {
        borderColor: 'purple',
    },
    tags: 'subtitle',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faClosedCaptioning',
    inputs: [
        {
            label: 'Branding Text',
            name: 'brandingText',
            type: 'string',
            defaultValue: 'Powered by Tdarr',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Text shown for the first 5 seconds of each subtitle track',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
var insertBranding = function (filePath, codec, text) { return __awaiter(void 0, void 0, void 0, function () {
    var content, incremented, branding, lines, eventsIdx, insertPos;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs_1.promises.readFile(filePath, 'utf8')];
            case 1:
                content = _a.sent();
                if (!(codec === 'subrip')) return [3 /*break*/, 3];
                incremented = content.replace(/^(\d+)/gm, function (m) { return String(Number(m) + 1); });
                branding = "1\n00:00:00,000 --> 00:00:05,000\n".concat(text, "\n\n");
                return [4 /*yield*/, fs_1.promises.writeFile(filePath, branding + incremented)];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3:
                lines = content.split(/\r?\n/);
                eventsIdx = lines.findIndex(function (l) { return l.trim().toLowerCase() === '[events]'; });
                if (eventsIdx >= 0) {
                    insertPos = eventsIdx + 1;
                    while (insertPos < lines.length && !lines[insertPos].toLowerCase().startsWith('format:')) {
                        insertPos += 1;
                    }
                    if (insertPos < lines.length) {
                        insertPos += 1;
                        lines.splice(insertPos, 0, "Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,".concat(text));
                    }
                }
                return [4 /*yield*/, fs_1.promises.writeFile(filePath, lines.join('\n'))];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, brandingText, subtitleStreams, inputFile, workDir, fileName, container, outputFile, extractionPromises, subFiles, ffArgs, muxCli, muxRes;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                brandingText = String(args.inputs.brandingText || '').trim();
                if (!brandingText) {
                    args.jobLog('Branding text empty, skipping plugin');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                subtitleStreams = (((_a = args.inputFileObj.ffProbeData) === null || _a === void 0 ? void 0 : _a.streams) || [])
                    .filter(function (s) { return s.codec_type === 'subtitle' && (s.codec_name === 'subrip' || s.codec_name === 'ass'); });
                if (subtitleStreams.length === 0) {
                    args.jobLog('No supported subtitle streams found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                inputFile = args.inputFileObj._id;
                workDir = (0, fileUtils_1.getPluginWorkDir)(args);
                fileName = (0, fileUtils_1.getFileName)(inputFile);
                container = (0, fileUtils_1.getContainer)(inputFile);
                outputFile = "".concat(workDir, "/").concat(fileName, "_branded.").concat(container);
                extractionPromises = subtitleStreams.map(function (s, i) { return __awaiter(void 0, void 0, void 0, function () {
                    var ext, subFile, extractCli, res;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ext = s.codec_name === 'subrip' ? 'srt' : 'ass';
                                subFile = "".concat(workDir, "/sub_").concat(i, ".").concat(ext);
                                extractCli = new cliUtils_1.CLI({
                                    cli: args.ffmpegPath,
                                    spawnArgs: ['-y', '-i', inputFile, '-map', "0:".concat(s.index), subFile],
                                    spawnOpts: {},
                                    jobLog: args.jobLog,
                                    outputFilePath: subFile,
                                    updateWorker: args.updateWorker,
                                    logFullCliOutput: args.logFullCliOutput,
                                    inputFileObj: args.inputFileObj,
                                    args: args,
                                });
                                return [4 /*yield*/, extractCli.runCli()];
                            case 1:
                                res = _a.sent();
                                if (res.cliExitCode !== 0)
                                    throw new Error('Failed to extract subtitle');
                                return [4 /*yield*/, insertBranding(subFile, s.codec_name, brandingText)];
                            case 2:
                                _a.sent();
                                return [2 /*return*/, subFile];
                        }
                    });
                }); });
                return [4 /*yield*/, Promise.all(extractionPromises)];
            case 1:
                subFiles = _b.sent();
                ffArgs = ['-y', '-i', inputFile];
                subFiles.forEach(function (sub) {
                    ffArgs.push('-i', sub);
                });
                ffArgs.push('-map', '0');
                subtitleStreams.forEach(function (s) {
                    ffArgs.push('-map', "-0:s:".concat(s.index));
                });
                subFiles.forEach(function (sub, idx) {
                    ffArgs.push('-map', "".concat(idx + 1, ":0"));
                });
                ffArgs.push('-c', 'copy', outputFile);
                muxCli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: ffArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: outputFile,
                    updateWorker: args.updateWorker,
                    logFullCliOutput: args.logFullCliOutput,
                    inputFileObj: args.inputFileObj,
                    args: args,
                });
                return [4 /*yield*/, muxCli.runCli()];
            case 2:
                muxRes = _b.sent();
                if (muxRes.cliExitCode !== 0)
                    throw new Error('Failed to mux subtitles');
                return [2 /*return*/, {
                        outputFileObj: { _id: outputFile },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
