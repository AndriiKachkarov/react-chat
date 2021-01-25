import React, {Component} from 'react';
import firebase from '../../firebase';
import {
    Button,
    Form,
    FormField,
    Icon,
    Input, Label,
    MenuItem,
    MenuMenu,
    Modal,
    ModalActions,
    ModalContent,
    ModalHeader
} from "semantic-ui-react";
import {connect} from "react-redux";
import {setCurrentChannel, setPrivateChannel} from "../../redux/actions";

class Channels extends Component {

    state = {
        user: this.props.currentUser,
        channel: null,
        channels: [],
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        notifications: [],
        modal: false,
        firstLoad: true,
        activeChannel: '',
        listeners: []
    };

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    };

    addListeners = () => {
        const loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({channels: loadedChannels}, () => this.setFirstChannel());
            this.addNotificationListener(snap.key);
        })
    };

    addNotificationListener = channelId => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if (this.state.channel) {
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    };

    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        const index = notifications.findIndex(n => n.id === channelId);

        if (index !== -1) {
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total;

                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }

        this.setState({ notifications });
    };

    removeListeners = () => {
        this.state.channelsRef.off();
    };

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];

        if (this.state.firstLoad && this.state.channels.length) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel })
        }
        this.setState({firstLoad: false});
    };

    closeModal = () => this.setState({modal: false});

    openModal = () => this.setState({modal: true});

    addChanel = () => {
        const {channelsRef, channelName, channelDetails, user} = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({channelName: '', channelDetails: ''});
                this.closeModal();
                console.log('channel added');
            })
            .catch(err => {
                console.log(err);
            })
    };

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.addChanel();
        }
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value})
    };

    isFormValid = ({channelName, channelDetails}) => channelName && channelDetails;

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.clearNotifications(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel });
    };

    clearNotifications = (channel) => {
        const index = this.state.notifications.findIndex(n => n.id === channel.id);

        if (index !== -1) {
            const updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({ notifications: updatedNotifications })
        }
    };

    setActiveChannel = channel => {
        this.setState({
            activeChannel: channel.id
        })
    };

    displayChannels = channels => (
        channels.length > 0 && channels.map(channel => (
            <MenuItem
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{opacity: 0.7}}
                active={channel.id === this.state.activeChannel}
            >
                {this.getNotificationsCount(channel) && (
                    <Label color={'red'}>{this.getNotificationsCount(channel)}</Label>
                )}
                # {channel.name}
            </MenuItem>
        ))
    );

    getNotificationsCount = channel => {
        let count = 0;

        this.state.notifications.forEach(n => {
            if (n.id === channel.id) {
                count = n.count;
            }
        });

        if (count) return count;
    };

    render() {
        const {channels, modal} = this.state;

        return (
            <>
                <MenuMenu className='menu'>
                    <MenuItem>
                    <span>
                        <Icon name='exchange'/> CHANNELS
                    </span>{' '}
                        ({channels.length})
                        <Icon name='add' onClick={this.openModal}/>
                    </MenuItem>
                    {this.displayChannels(channels)}
                </MenuMenu>
                <Modal basic open={modal} onClose={this.closeModal}>
                    <ModalHeader>Add a channel</ModalHeader>
                    <ModalContent>
                        <Form onSubmit={this.handleSubmit}>
                            <FormField>
                                <Input
                                    fluid
                                    label='Name of Channel'
                                    name='channelName'
                                    onChange={this.handleChange}
                                />
                            </FormField>
                            <FormField>
                                <Input
                                    fluid
                                    label='About the Channel'
                                    name='channelDetails'
                                    onChange={this.handleChange}
                                />
                            </FormField>
                        </Form>
                    </ModalContent>

                    <ModalActions>
                        <Button color='green' inverted onClick={this.handleSubmit}>
                            <Icon name='checkmark'/>Add
                        </Button>
                        <Button color='red' inverted onClick={this.closeModal}>
                            <Icon name='remove'/>Cancel
                        </Button>
                    </ModalActions>
                </Modal>
            </>
        )
    }
}

const setDispatchToProps = {
    setCurrentChannel,
    setPrivateChannel
};

export default connect(null, setDispatchToProps)(Channels);
