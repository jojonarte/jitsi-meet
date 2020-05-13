// @flow

import _ from 'lodash';
import React from 'react';

import VideoLayout from '../../../../../modules/UI/videolayout/VideoLayout';

import { connect, disconnect } from '../../../base/connection';
import { translate } from '../../../base/i18n';
import { connect as reactReduxConnect, equals } from '../../../base/redux';
import { getConferenceNameForTitle } from '../../../base/conference';
import { Chat } from '../../../chat';
import { Filmstrip } from '../../../filmstrip';
import { CalleeInfoContainer, InfoDialogButton } from '../../../invite';
import { LargeVideo } from '../../../large-video';
import { Prejoin, isPrejoinPageVisible } from '../../../prejoin';
import { LAYOUTS, getCurrentLayout, TileViewButton } from '../../../video-layout';

import {
    Toolbox,
    fullScreenChanged,
    setToolboxAlwaysVisible,
    showToolbox,
    setFullScreen,
    setOverflowMenuVisible
} from '../../../toolbox';

import { maybeShowSuboptimalExperienceNotification } from '../../functions';

import Labels from './Labels';
import { default as Notice } from './Notice';
import { default as Subject } from './Subject';
import {
    AbstractConference,
    abstractMapStateToProps
} from '../AbstractConference';
import type { AbstractProps } from '../AbstractConference';

// added
import { getLocalVideoTrack, toggleScreensharing } from '../../../base/tracks';
import {
    OverflowMenuVideoQualityItem,
    VideoQualityDialog
} from '../../../video-quality';

import { VideoBlurButton } from '../../../blur';
import { SharedDocumentButton } from '../../../etherpad';
import {
    SETTINGS_TABS,
    SettingsButton,
    openSettingsDialog
} from '../../../settings';
import {
    IconExitFullScreen,
    IconFeedback,
    IconFullScreen,
    IconOpenInNew,
    IconPresentation,
    IconShareVideo
} from '../../../base/icons';
import { E2EEButton } from '../../../e2ee';
import HelpButton from '../../../toolbox/components/HelpButton';
import DownloadButton from '../../../toolbox/components/DownloadButton';
import { createToolbarEvent, sendAnalytics } from '../../../analytics';

import { toggleSharedVideo } from '../../../shared-video';
import { SpeakerStats } from '../../../speaker-stats';
import { openFeedbackDialog } from '../../../feedback';
import { openKeyboardShortcutsDialog } from '../../../keyboard-shortcuts';
import { openDialog } from '../../../base/dialog';
import { OverflowMenuItem } from '../../../base/toolbox';
import OverflowMenuButton from '../../../toolbox/components/web/OverflowMenuButton';
import MuteEveryoneButton from '../../../toolbox/components/web/MuteEveryoneButton';

import { LiveStreamButton, RecordButton } from '../../../recording';

import OverflowMenuProfileItem from '../../../toolbox/components/web/OverflowMenuProfileItem';

declare var APP: Object;
declare var config: Object;
declare var interfaceConfig: Object;

/**
 * DOM events for when full screen mode has changed. Different browsers need
 * different vendor prefixes.
 *
 * @private
 * @type {Array<string>}
 */
const FULL_SCREEN_EVENTS = [
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'fullscreenchange'
];

/**
 * The CSS class to apply to the root element of the conference so CSS can
 * modify the app layout.
 *
 * @private
 * @type {Object}
 */
const LAYOUT_CLASSNAMES = {
    [LAYOUTS.HORIZONTAL_FILMSTRIP_VIEW]: 'horizontal-filmstrip',
    [LAYOUTS.TILE_VIEW]: 'tile-view',
    [LAYOUTS.VERTICAL_FILMSTRIP_VIEW]: 'vertical-filmstrip'
};

/**
 * The type of the React {@code Component} props of {@link Conference}.
 */
type Props = AbstractProps & {

    /**
     * Whether the local participant is recording the conference.
     */
    _iAmRecorder: boolean,

    /**
     * The CSS class to apply to the root of {@link Conference} to modify the
     * application layout.
     */
    _layoutClassName: string,

    /**
     * Name for this conference room.
     */
    _roomName: string,

    /**
     * If prejoin page is visible or not.
     */
    _showPrejoin: boolean,

    dispatch: Function,
    t: Function
};

/**
 * The conference page of the Web application.
 */
class Conference extends AbstractConference<Props, *> {
    _onFullScreenChange: Function;
    _onShowToolbar: Function;
    _originalOnShowToolbar: Function;
    _renderOverflowMenuContent: Function;
    _handleOnVisibilityChange: Function;

    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Throttle and bind this component's mousemove handler to prevent it
        // from firing too often.
        this._originalOnShowToolbar = this._onShowToolbar;
        this._onShowToolbar = _.throttle(
            () => this._originalOnShowToolbar(),
            100,
            {
                leading: true,
                trailing: false
            }
        );

        // Bind event handler so it is only bound once for every instance.
        this._onFullScreenChange = this._onFullScreenChange.bind(this);
        this._renderOverflowMenuContent = this._renderOverflowMenuContent.bind(
            this
        );
        this._handleOnVisibilityChange = this._handleOnVisibilityChange.bind(
            this
        );
    }

    /**
     * Start the connection and get the UI ready for the conference.
     *
     * @inheritdoc
     */
    componentDidMount() {
        document.title = `${this.props._roomName} | ${interfaceConfig.APP_NAME}`;
        this._start();
    }

    /**
     * Calls into legacy UI to update the application layout, if necessary.
     *
     * @inheritdoc
     * returns {void}
     */
    componentDidUpdate(prevProps) {
        if (
            this.props._shouldDisplayTileView
            === prevProps._shouldDisplayTileView
        ) {
            return;
        }

        // TODO: For now VideoLayout is being called as LargeVideo and Filmstrip
        // sizing logic is still handled outside of React. Once all components
        // are in react they should calculate size on their own as much as
        // possible and pass down sizings.
        VideoLayout.refreshLayout();
    }

    /**
     * Disconnect from the conference when component will be
     * unmounted.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        APP.UI.unbindEvents();

        FULL_SCREEN_EVENTS.forEach(name =>
            document.removeEventListener(name, this._onFullScreenChange)
        );

        APP.conference.isJoined() && this.props.dispatch(disconnect());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            VIDEO_QUALITY_LABEL_DISABLED,

            // XXX The character casing of the name filmStripOnly utilized by
            // interfaceConfig is obsolete but legacy support is required.
            filmStripOnly: filmstripOnly
        } = interfaceConfig;
        const {
            _iAmRecorder,
            _layoutClassName,
            _showPrejoin,
            _overflowMenuVisible,
            t
        } = this.props;
        const hideVideoQualityLabel
            = filmstripOnly || VIDEO_QUALITY_LABEL_DISABLED || _iAmRecorder;
        const overflowMenuContent = this._renderOverflowMenuContent();

        return (
            <div
                className = { _layoutClassName }
                id = 'videoconference_page'
                onMouseMove = { this._onShowToolbar }>
                <Notice />
                <Subject />
                <div id = 'videospace'>
                    <LargeVideo />
                    <div className = 'headerButtonsContainer'>
                        <InfoDialogButton />
                        <TileViewButton />
                        <div className = 'headerButton'>
                            <OverflowMenuButton
                                isOpen = { _overflowMenuVisible }
                                onVisibilityChange = {
                                    this._handleOnVisibilityChange
                                }>
                                <ul
                                    aria-label = { t(
                                        'toolbar.accessibilityLabel.moreActionsMenu'
                                    ) }
                                    className = 'overflow-menu overflow-list'>
                                    {overflowMenuContent}
                                </ul>
                            </OverflowMenuButton>
                        </div>
                    </div>
                    {hideVideoQualityLabel || <Labels />}
                    <Filmstrip filmstripOnly = { filmstripOnly } />
                </div>

                {filmstripOnly || _showPrejoin || <Toolbox />}
                {filmstripOnly || <Chat />}

                {this.renderNotificationsContainer()}

                {!filmstripOnly && _showPrejoin && <Prejoin />}

                <CalleeInfoContainer />
            </div>
        );
    }

    /**
     * Handle cisibility change of Menu Items.
     *
     * @private
     * @returns {void}
     */
    _handleOnVisibilityChange(visible) {
        this.props.dispatch(setOverflowMenuVisible(visible));
    }

    /**
     * Renders the list elements of the overflow menu.
     *
     * @private
     * @returns {Array<ReactElement>}
     */
    _renderOverflowMenuContent() {
        const {
            _feedbackConfigured,
            _fullScreen,
            _screensharing,
            _sharingVideo,
            _isGuest,
            _visibleButtons,
            t
        } = this.props;

        const overflowMenuContent = [];

        const shouldShowButton = buttonName => _visibleButtons.has(buttonName);

        if (_isGuest && shouldShowButton('profile')) {
            overflowMenuContent.push(
                <OverflowMenuProfileItem
                    key = 'profile'
                    onClick = { () => {
                        sendAnalytics(createToolbarEvent('profile'));
                        this.props.dispatch(
                            openSettingsDialog(SETTINGS_TABS.PROFILE)
                        );
                    } } />
            );
        }
        if (shouldShowButton('videoquality')) {
            overflowMenuContent.push(
                <OverflowMenuVideoQualityItem
                    key = 'videoquality'
                    onClick = { () => {
                        sendAnalytics(createToolbarEvent('video.quality'));
                        this.props.dispatch(openDialog(VideoQualityDialog));
                    } } />
            );
        }
        if (shouldShowButton('fullscreen')) {
            overflowMenuContent.push(
                <OverflowMenuItem
                    accessibilityLabel = { t(
                        'toolbar.accessibilityLabel.fullScreen'
                    ) }
                    icon = { _fullScreen ? IconExitFullScreen : IconFullScreen }
                    key = 'fullscreen'
                    onClick = { () => {
                        sendAnalytics(
                            createToolbarEvent('toggle.fullscreen', {
                                enable: !this.props._fullScreen
                            })
                        );
                        const fullScreen = !this.props._fullScreen;

                        this.props.dispatch(setFullScreen(fullScreen));
                    } }
                    text = {
                        _fullScreen
                            ? t('toolbar.exitFullScreen')
                            : t('toolbar.enterFullScreen')
                    } />
            );
        }
        overflowMenuContent.push(
            <LiveStreamButton
                key = 'livestreaming'
                showLabel = { true } />
        );

        overflowMenuContent.push(
            <RecordButton
                key = 'record'
                showLabel = { true } />
        );
        if (shouldShowButton('sharedvideo')) {
            overflowMenuContent.push(
                <OverflowMenuItem
                    accessibilityLabel = { t(
                        'toolbar.accessibilityLabel.sharedvideo'
                    ) }
                    icon = { IconShareVideo }
                    key = 'sharedvideo'
                    onClick = { () => {
                        sendAnalytics(
                            createToolbarEvent('shared.video.toggled', {
                                enable: !this.props._sharingVideo
                            })
                        );

                        this.props.dispatch(toggleSharedVideo());
                    } }
                    text = {
                        _sharingVideo
                            ? t('toolbar.stopSharedVideo')
                            : t('toolbar.sharedvideo')
                    } />
            );
        }
        overflowMenuContent.push(
            <VideoBlurButton
                key = 'videobackgroundblur'
                showLabel = { true }
                visible = {
                    shouldShowButton('videobackgroundblur') && !_screensharing
                } />
        );
        if (shouldShowButton('etherpad')) {
            overflowMenuContent.push(
                <SharedDocumentButton
                    key = 'etherpad'
                    showLabel = { true } />
            );
        }
        overflowMenuContent.push(
            <SettingsButton
                key = 'settings'
                showLabel = { true }
                visible = { shouldShowButton('settings') } />
        );
        overflowMenuContent.push(
            <MuteEveryoneButton
                key = 'mute-everyone'
                showLabel = { true }
                visible = { shouldShowButton('mute-everyone') } />
        );

        // if (shouldShowButton("stats")) {
        //     overflowMenuContent.push(
        //         <OverflowMenuItem
        //             accessibilityLabel={t(
        //                 "toolbar.accessibilityLabel.speakerStats"
        //             )}
        //             icon={IconPresentation}
        //             key="stats"
        //             onClick={() => {
        //                 sendAnalytics(createToolbarEvent("speaker.stats"));

        //                 this.props.dispatch(
        //                     openDialog(SpeakerStats, {
        //                         conference: this.props._conference
        //                     })
        //                 );
        //             }}
        //             // onClick={this._onToolbarOpenSpeakerStats}
        //             text={t("toolbar.speakerStats")}
        //         />
        //     );
        // }
        if (shouldShowButton('e2ee')) {
            overflowMenuContent.push(
                <E2EEButton
                    key = 'e2ee'
                    showLabel = { true } />
            );
        }

        if (shouldShowButton('feedback') && _feedbackConfigured) {
            overflowMenuContent.push(
                <OverflowMenuItem
                    accessibilityLabel = { t(
                        'toolbar.accessibilityLabel.feedback'
                    ) }
                    icon = { IconFeedback }
                    key = 'feedback'
                    onClick = { () => {
                        sendAnalytics(createToolbarEvent('feedback'));

                        const { _conference } = this.props;

                        this.props.dispatch(openFeedbackDialog(_conference));
                    } }
                    text = { t('toolbar.feedback') } />
            );
        }
        if (shouldShowButton('shortcuts')) {
            overflowMenuContent.push(
                <OverflowMenuItem
                    accessibilityLabel = { t(
                        'toolbar.accessibilityLabel.shortcuts'
                    ) }
                    icon = { IconOpenInNew }
                    key = 'shortcuts'
                    onClick = { () => {
                        sendAnalytics(createToolbarEvent('shortcuts'));

                        this.props.dispatch(openKeyboardShortcutsDialog());
                    } }
                    text = { t('toolbar.shortcuts') } />
            );
        }
        if (shouldShowButton('download')) {
            overflowMenuContent.push(
                <DownloadButton
                    key = 'download'
                    showLabel = { true } />
            );
        }
        if (shouldShowButton('help')) {
            overflowMenuContent.push(
                <HelpButton
                    key = 'help'
                    showLabel = { true } />
            );
        }

        return overflowMenuContent;
    }

    /**
     * Updates the Redux state when full screen mode has been enabled or
     * disabled.
     *
     * @private
     * @returns {void}
     */
    _onFullScreenChange() {
        this.props.dispatch(fullScreenChanged(APP.UI.isFullScreen()));
    }

    /**
     * Displays the toolbar.
     *
     * @private
     * @returns {void}
     */
    _onShowToolbar() {
        this.props.dispatch(showToolbox());
    }

    /**
     * Until we don't rewrite UI using react components
     * we use UI.start from old app. Also method translates
     * component right after it has been mounted.
     *
     * @inheritdoc
     */
    _start() {
        APP.UI.start();

        APP.UI.registerListeners();
        APP.UI.bindEvents();

        FULL_SCREEN_EVENTS.forEach(name =>
            document.addEventListener(name, this._onFullScreenChange)
        );

        const { dispatch, t } = this.props;

        dispatch(connect());

        maybeShowSuboptimalExperienceNotification(dispatch, t);

        interfaceConfig.filmStripOnly
            && dispatch(setToolboxAlwaysVisible(true));
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code Conference} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { callStatsID } = state['features/base/config'];
    const { fullScreen, overflowMenuVisible } = state['features/toolbox'];
    const localVideo = getLocalVideoTrack(state['features/base/tracks']);
    const sharedVideoStatus = state['features/shared-video'].status;
    const buttons = new Set(interfaceConfig.TOOLBAR_BUTTONS);
    const visibleButtons = new Set(interfaceConfig.TOOLBAR_BUTTONS);

    return {
        ...abstractMapStateToProps(state),
        _iAmRecorder: state['features/base/config'].iAmRecorder,
        _layoutClassName: LAYOUT_CLASSNAMES[getCurrentLayout(state)],
        _roomName: getConferenceNameForTitle(state),
        _showPrejoin: isPrejoinPageVisible(state),
        _overflowMenuVisible: state['features/toolbox'].overflowMenuVisible,
        _feedbackConfigured: Boolean(callStatsID),
        _fullScreen: fullScreen,
        _screensharing: localVideo && localVideo.videoType === 'desktop',
        _sharingVideo:
            sharedVideoStatus === 'playing'
            || sharedVideoStatus === 'start'
            || sharedVideoStatus === 'pause',
        _isGuest: state['features/base/jwt'].isGuest,
        _visibleButtons: equals(visibleButtons, buttons)
            ? visibleButtons
            : buttons,
        _conference: state['features/base/conference']
    };
}

export default reactReduxConnect(_mapStateToProps)(translate(Conference));
