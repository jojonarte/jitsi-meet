// @flow

import React from 'react';

type RemoteVideo = {
  id: String,
  flipX: Boolean,
  isAudioMuted: Boolean,
  isLocal: Boolean,
  isVideoMuted: Boolean,
  stream: MediaStream,
};

type Props = {
    remoteVideos: Array<RemoteVideo>
};

// dummy
const remoteVideos = [
    {
        id: 'sample1',
        flipX: false,
        isAudioMuted: false,
        isLocal: true,
        isVideoMuted: true,
        stream: null
    },
    {
        id: 'sample2',
        flipX: false,
        isAudioMuted: false,
        isLocal: false,
        isVideoMuted: true,
        stream: null
    }
];

/**
 * Custom Film Strip component
 *
 */
export default class FilmStrip extends React.PureComponent<Props> {

    /**
    * Implements React's {@link Component#render()}.
    *
    * @inheritdoc
    * @returns {ReactElement}
    */
    render() {
        return (
            <div>Film strip</div>
        );
    }
}
