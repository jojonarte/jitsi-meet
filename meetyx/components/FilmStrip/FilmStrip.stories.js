import React from 'react';
import { withKnobs, object } from '@storybook/addon-knobs';
import './_filmstrip.scss';

import FilmStrip from './FilmStrip';

export default { title: 'FilmStrip',
    decorators: [ withKnobs ] };


// dummy
const remoteVideos = {
    sample1: {
        id: 'sample1',
        flipX: false,
        isAudioMuted: false,
        isLocal: true,
        isVideoMuted: true,
        stream: null,
        name: 'Jojo',
        isDominantSpeaker: false,
        avatarUrl: 'http://placekitten.com/187/187',
    },
    sample2: {
        id: 'sample2',
        flipX: false,
        isAudioMuted: false,
        isLocal: false,
        isVideoMuted: true,
        stream: null,
        name: 'Jojo2',
        isDominantSpeaker: false,
        avatarUrl: 'http://placekitten.com/187/187',
    },
    sample3: {
        id: 'sample3',
        flipX: false,
        isAudioMuted: false,
        isLocal: false,
        isVideoMuted: true,
        stream: null,
        name: 'Jojo2',
        isDominantSpeaker: false,
        avatarUrl: 'http://placekitten.com/187/187',
    },
};

export const VerticalMode = () => <FilmStrip mode="vertical" remoteVideos={object('Remote Video Feed', remoteVideos)} />;

export const TileMode = () => <FilmStrip mode="horizontal" remoteVideos={object('Remote Video Feed', remoteVideos)} />;

export const HorizontalMode = () => <FilmStrip mode="tiled" remoteVideos={object('Remote Video Feed', remoteVideos)} />;

