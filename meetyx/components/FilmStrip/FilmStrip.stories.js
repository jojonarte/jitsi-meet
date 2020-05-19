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
        avatarUrl: 'https://gizmoposts24.com/wp-content/uploads/2020/03/mandalorian-babyyoda-plush-frontpage-700x311-1-150x150.jpg',
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
        avatarUrl: 'https://gizmoposts24.com/wp-content/uploads/2020/03/mandalorian-babyyoda-plush-frontpage-700x311-1-150x150.jpg',
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
        avatarUrl: 'https://gizmoposts24.com/wp-content/uploads/2020/03/mandalorian-babyyoda-plush-frontpage-700x311-1-150x150.jpg',
    },
};

export const VerticalMode = () => <FilmStrip remoteVideos={object('Remote Video Feed', remoteVideos)} />;

export const TileMode = () => <FilmStrip remoteVideos={object('Remote Video Feed', remoteVideos)} />;

export const HorizontalMode = () => <FilmStrip remoteVideos={object('Remote Video Feed', remoteVideos)} />;

