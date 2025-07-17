// tdarrSkipTest
import { promises as fsp } from 'fs';
import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { getContainer, getFileName, getPluginWorkDir } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

const details = (): IpluginDetails => ({
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
});

const insertBranding = async (filePath: string, codec: string, text: string): Promise<void> => {
  const content = await fsp.readFile(filePath, 'utf8');
  if (codec === 'subrip') {
    const incremented = content.replace(/^(\d+)/gm, (m) => String(Number(m) + 1));
    const branding = `1\n00:00:00,000 --> 00:00:05,000\n${text}\n\n`;
    await fsp.writeFile(filePath, branding + incremented);
  } else {
    const lines = content.split(/\r?\n/);
    const eventsIdx = lines.findIndex((l) => l.trim().toLowerCase() === '[events]');
    if (eventsIdx >= 0) {
      let insertPos = eventsIdx + 1;
      while (insertPos < lines.length && !lines[insertPos].toLowerCase().startsWith('format:')) {
        insertPos += 1;
      }
      if (insertPos < lines.length) {
        insertPos += 1;
        lines.splice(insertPos, 0, `Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,${text}`);
      }
    }
    await fsp.writeFile(filePath, lines.join('\n'));
  }
};

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  const brandingText = String(args.inputs.brandingText || '').trim();
  if (!brandingText) {
    args.jobLog('Branding text empty, skipping plugin');
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1,
      variables: args.variables,
    };
  }

  const subtitleStreams = (args.inputFileObj.ffProbeData?.streams || [])
    .filter((s) => s.codec_type === 'subtitle' && (s.codec_name === 'subrip' || s.codec_name === 'ass'));

  if (subtitleStreams.length === 0) {
    args.jobLog('No supported subtitle streams found');
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1,
      variables: args.variables,
    };
  }

  const inputFile = args.inputFileObj._id;
  const workDir = getPluginWorkDir(args);
  const fileName = getFileName(inputFile);
  const container = getContainer(inputFile);
  const outputFile = `${workDir}/${fileName}.${container}`;

  const extractionPromises = subtitleStreams.map(async (s, i) => {
    const ext = s.codec_name === 'subrip' ? 'srt' : 'ass';
    const subFile = `${workDir}/sub_${i}.${ext}`;
    const extractCli = new CLI({
      cli: args.ffmpegPath,
      spawnArgs: ['-y', '-i', inputFile, '-map', `0:${s.index}`, subFile],
      spawnOpts: {},
      jobLog: args.jobLog,
      outputFilePath: subFile,
      updateWorker: args.updateWorker,
      logFullCliOutput: args.logFullCliOutput,
      inputFileObj: args.inputFileObj,
      args,
    });
    const res = await extractCli.runCli();
    if (res.cliExitCode !== 0) throw new Error('Failed to extract subtitle');
    await insertBranding(subFile, s.codec_name, brandingText);
    return {
      file: subFile,
      language: s.tags?.language,
      title: s.tags?.title,
    };
  });

  const subFiles = await Promise.all(extractionPromises);

  const ffArgs = ['-y', '-i', inputFile];
  subFiles.forEach((sub) => {
    ffArgs.push('-i', sub.file);
  });
  ffArgs.push('-map', '0');
  subtitleStreams.forEach((s) => {
    ffArgs.push('-map', `-0:s:${s.index}`);
  });
  subFiles.forEach((sub, idx) => {
    ffArgs.push('-map', `${idx + 1}:0`);
  });
  ffArgs.push('-map_metadata', '0');
  ffArgs.push('-c', 'copy');
  const baseStreams = (args.inputFileObj.ffProbeData?.streams || [])
    .filter((st) => !subtitleStreams.some((ss) => ss.index === st.index)).length;
  subFiles.forEach((sub, idx) => {
    if (sub.language) {
      ffArgs.push(`-metadata:s:s:${String(baseStreams + idx)}`, `language=${sub.language}`);
    }
    if (sub.title) {
      ffArgs.push(`-metadata:s:s:${String(baseStreams + idx)}`, `title=${sub.title}`);
    }
  });
  ffArgs.push(outputFile);

  const muxCli = new CLI({
    cli: args.ffmpegPath,
    spawnArgs: ffArgs,
    spawnOpts: {},
    jobLog: args.jobLog,
    outputFilePath: outputFile,
    updateWorker: args.updateWorker,
    logFullCliOutput: args.logFullCliOutput,
    inputFileObj: args.inputFileObj,
    args,
  });
  const muxRes = await muxCli.runCli();
  if (muxRes.cliExitCode !== 0) throw new Error('Failed to mux subtitles');

  return {
    outputFileObj: { _id: outputFile },
    outputNumber: 1,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};
