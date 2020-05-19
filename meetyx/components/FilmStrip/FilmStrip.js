// @flow

import React from 'react';

import RemoteVideo from '../RemoteVideo';
import { defaultProps } from '@atlaskit/button';

type RemoteVideoType = {
  id: String,
  flipX: Boolean,
  isAudioMuted: Boolean,
  isLocal: Boolean,
  isVideoMuted: Boolean,
  stream: MediaStream,
};

type FilmStripMode = 'horizontal' | 'vertical' | 'tiled'

type Props = {
    remoteVideos: { [key: String]: RemoteVideoType },
    mode: FilmStripMode
};

/**
 * Custom Film Strip component
 *
 */
export default class FilmStrip extends React.PureComponent<Props> {
    static defaultProps = {
        remoteVideos: {}
    }

    /**
    * Implements React's {@link Component#render()}.
    *
    * @inheritdoc
    * @returns {ReactElement}
    */
    render() {
        if (!Object.keys(this.props.remoteVideos).length) {
            return <h1>TODO: maybe something to show empty?</h1>;
        }

        return this._renderFilms();
    }

    /**
     * renders all remote videos available
     */
    _renderFilms() {
        const { mode = 'vertical', remoteVideos } = this.props;

        return (
            <div className={`filmstrip-container ${mode}`}>
                {Object.values(remoteVideos).map(this._renderRemoteVideo)}
            </div>
        );
    }

    /**
     * renders specific RemoteVideo
     */
    _renderRemoteVideo(remoteVideo: RemoteVideoType) {
        return <RemoteVideo {...remoteVideo} />;
    }
}
