import React, {Component} from 'react';
import firebase from '../../firebase';
import {
    Button,
    Form,
    FormField,
    Icon,
    Input,
    MenuItem,
    MenuMenu,
    Modal,
    ModalActions,
    ModalContent,
    ModalHeader
} from "semantic-ui-react";
import {connect} from "react-redux";
import {setCurrentChannel} from "../../redux/actions";

class Channels extends Component {

    state = {
        user: this.props.currentUser,
        channels: [],
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        modal: false,
        firstLoad: true,
        activeChannel: ''
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
        })
    };

    removeListeners = () => {
      this.state.channelsRef.off();
    };

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];

        if (this.state.firstLoad && this.state.channels.length) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
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
      this.props.setCurrentChannel(channel);
    };

    setActiveChannel = channel => {
        this.setState({
            activeChannel: channel.id
        })
    };

    displayChannels = channels => (
        channels.length && channels.map(channel => (
             <MenuItem
                 key={channel.id}
                 onClick={() => this.changeChannel(channel)}
                 name={channel.name}
                 style={{opacity: 0.7}}
                 active={channel.id === this.state.activeChannel}
             >
                 # {channel.name}
             </MenuItem>
        ))
    );

    render() {
        const {channels, modal} = this.state;

        return (
            <>
                <MenuMenu style={{paddingBottom: '2em'}}>
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
    setCurrentChannel
};

export default connect(null, setDispatchToProps)(Channels);
