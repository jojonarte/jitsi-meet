import React from 'react';
import { withKnobs, text, boolean } from '@storybook/addon-knobs';
import './_remotevideo.scss';

import RemoteVideo from '.';

export default { title: 'RemoteVideo',
    decorators: [ withKnobs ] };

export const Component = () => (
    <RemoteVideo
        isDominantSpeaker={boolean('Dominant Speaker', false)}
        name={text('Name', 'Sample Name')}
        flipX={boolean('Flip Video', false)}
        isAudioMuted={boolean('Audio Muted', false)}
        isVideoMuted={boolean('Video Disabled', true)}
        isLocal={boolean('Local Video Feed?', false)}
        avatarUrl={text('avatarUrl', 'https://gizmoposts24.com/wp-content/uploads/2020/03/mandalorian-babyyoda-plush-frontpage-700x311-1-150x150.jpg')}
    />
);
