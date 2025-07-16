import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
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
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  args.jobLog('Dank Plex Test Plugin executed');
  return ({
    outputFileObj: args.inputFileObj,
    outputNumber: 1,
    variables: args.variables,
  });
};

export { details, plugin };
