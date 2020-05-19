/* eslint-disable require-jsdoc */
// @flow

import React from 'react';

import Microphone from '../../assets/SvgComponents/Microphone';

type Props = {
  id: String,
  flipX: Boolean,
  isAudioMuted: Boolean,
  isLocal: Boolean,
  isVideoMuted: Boolean,
  avatarUrl: String,
  stream: MediaStream,
  name: String,
  isDominantSpeaker: Boolean,
};


/**
 * Custom User Video/Avatar component
 *
 */
export default class RemoteVideo extends React.Component<Props> {

    /**
    * Implements React's {@link Component#render()}.
    *
    * @inheritdoc
    * @returns {ReactElement}
    */
    render() {
        return (
            <div className="remote-video-container">
                <img src={this.props.avatarUrl} alt={this.props.id} />
                {this.renderStatusBar()}
                <span className={this.props.isDominantSpeaker ? 'dominant-speaker' : ''}>{this.props.name}</span>
            </div>
        );
    }

    renderStatusBar() {
        const { isDominantSpeaker } = this.props;

        return (
            <div className="remote-video__statusbar">
                <div><Microphone fill={isDominantSpeaker ? '#0AD22B' : '#87a5c1'} /></div>
            </div>
        );
    }
}
