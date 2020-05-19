/* @flow */

import React from 'react';
import { connect } from '../../features/base/redux';
import AudioIndicator from './AudioIndicator';

import { getLocalParticipant, getParticipantById, PARTICIPANT_ROLE } from '../../features/base/participants';

declare var interfaceConfig: Object;

/**
 * Custom status indicator component
 */
class CustomStatusIndicator extends React.PureComponent<*> {

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <AudioIndicator tooltipPosition = 'bottom' />
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code StatusIndicators}'s props.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The own props of the component.
 * @private
 * @returns {{
 *     _currentLayout: string,
 *     _showModeratorIndicator: boolean
 * }}
*/
function _mapStateToProps(state, ownProps) {
    const { participantID } = ownProps;

    // Only the local participant won't have id for the time when the conference is not yet joined.
    const participant = participantID ? getParticipantById(state, participantID) : getLocalParticipant(state);

    return {
        _showModeratorIndicator:
            !interfaceConfig.DISABLE_FOCUS_INDICATOR && participant && participant.role === PARTICIPANT_ROLE.MODERATOR
    };
}

export default connect(_mapStateToProps)(CustomStatusIndicator);
