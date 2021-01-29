import React, {Component} from 'react';
import {Icon, MenuItem, MenuMenu} from "semantic-ui-react";
import {connect} from "react-redux";
import {setCurrentChannel, setPrivateChannel} from "../../redux/actions";
import firebase from "../../firebase";

class Starred extends Component {
    state = {
        user: this.props.currentUser,
        userRef: firebase.database().ref('users'),
        starredChannels: [],
        activeChannel: ''
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    addListeners = (userId) => {
        this.state.userRef
            .child(userId)
            .child('starred')
            .on('child_added', snap => {
               const starredChannel = { id: snap.key, ...snap.val() };
               this.setState({
                   starredChannels: [...this.state.starredChannels, starredChannel]
               })
            });

        this.state.userRef
            .child(userId)
            .child('starred')
            .on('child_removed', snap => {
                const channelToRemove = { id: snap.key, ...snap.val() };
                const filteredChannels = this.state.starredChannels.filter(channel => channel.id !== channelToRemove.id);
                this.setState({ starredChannels:  filteredChannels})
            })
    };

    displayChannels = starredChannels => (
        starredChannels.length > 0 && starredChannels.map(channel => (
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

    setActiveChannel = channel => {
        this.setState({
            activeChannel: channel.id
        })
    };

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    };

    render() {
        const {starredChannels} = this.state;

        return (
            <MenuMenu className='menu'>
                <MenuItem>
                    <span>
                        <Icon name='star'/> STARRED
                    </span>{' '}
                    ({starredChannels.length})
                </MenuItem>
                {this.displayChannels(starredChannels)}
            </MenuMenu>

        )
    }
}

export default connect(null, {
    setCurrentChannel, setPrivateChannel
})(Starred);
