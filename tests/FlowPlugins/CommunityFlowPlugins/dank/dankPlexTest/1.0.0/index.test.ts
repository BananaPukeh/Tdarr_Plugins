import { plugin } from '../../../../../../FlowPluginsTs/CommunityFlowPlugins/dank/dankPlexTest/1.0.0/index';
import { IpluginInputArgs } from '../../../../../../FlowPluginsTs/FlowHelpers/1.0.0/interfaces/interfaces';
import { IFileObject } from '../../../../../../FlowPluginsTs/FlowHelpers/1.0.0/interfaces/synced/IFileObject';

const sampleH264 = require('../../../../../sampleData/media/sampleH264_1.json');

describe('dankPlexTest Plugin', () => {
  let baseArgs: IpluginInputArgs;

  beforeEach(() => {
    baseArgs = {
      inputs: {},
      variables: {} as IpluginInputArgs['variables'],
      inputFileObj: JSON.parse(JSON.stringify(sampleH264)) as IFileObject,
      jobLog: jest.fn(),
    } as Partial<IpluginInputArgs> as IpluginInputArgs;
  });

  it('should return output number 1 and log execution', () => {
    const result = plugin(baseArgs);

    expect(result.outputNumber).toBe(1);
    expect(result.outputFileObj).toBe(baseArgs.inputFileObj);
    expect(result.variables).toBe(baseArgs.variables);
    expect(baseArgs.jobLog).toHaveBeenCalledWith('Dank Plex Test Plugin executed');
  });
});
