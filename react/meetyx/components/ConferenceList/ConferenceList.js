// @flow

import React, { PureComponent } from 'react';

type Props = {
    number: string;
};

/**
 * Meeting List Component
 *
 */
class ConferenceList extends PureComponent<Props> {

    /**
    * Implements React's {@link Component#render()}.
    *
    * @inheritdoc
    * @returns {ReactElement}
    */
    render() {
        return (
            <div className = 'conference-list-container'>
                <div className = 'conference-list-top'>
                    <p>Meetings Today</p>
                    <button
                        className = 'conference-list-filter-button'
                        type = 'button'>
                        Filter
                    </button>
                </div>
                <div className = 'conference-list-item-container'>
                    {this._renderConferenceListItems()}
                </div>
                <div className = 'confernce-list-search' />
            </div>
        );
    }

    /**
     * Returns Confernce List items.
     * @returns {JSX}
     */

    _renderConferenceListItems() {
        // TEMP
        const list = [
            { name: 'AltoSign Meeting',
                status: 'Ongoing' },
            { name: 'General Meeting',
                status: 'Starts @ 01:00 PM' },
            { name: 'Another Meeting',
                status: 'Starts @ 12:55 PM' },
            { name: 'Sirius Meeting',
                status: 'Ended @ 10:45 AM - 11:30 AM' }
        ];

        return list.map(item =>
            (<div className = 'conference-list-item'>
                <div className = 'conference-list-avatar' />
                <div className = 'conference-list-detail'>
                    <p className = 'meeting-title'>{item.name}</p>
                    <p className = 'meeting-status'>{item.status}</p>
                </div>
            </div>)
        );
    }
}

export default ConferenceList;
