"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var details = function () { return ({
    name: 'Dank Plex Test',
    description: 'Dank Plex Test Plugin',
    style: {
        borderColor: 'orange',
    },
    tags: 'audio',
    isStartPlugin: false,
    pType: '',
    sidebarPosition: 0,
    icon: 'faQuestion',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Test output',
        },
    ],
    requiresVersion: '2.11.01',
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    args.jobLog('Dank Plex Test Plugin executed');
    return ({
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    });
};
exports.plugin = plugin;
