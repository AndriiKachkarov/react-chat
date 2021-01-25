import React, {Component} from 'react';
import {CommentGroup, Segment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";

export default class Messages extends Component {

    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        listeners: []
    };

    componentDidMount() {
        const {channel, user} = this.state;

        if (channel && user) {
            this.addListeners(channel.id)
        }
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId)
    };

    componentWillUnmount() {
        this.state.listeners.forEach(ref => ref.off());
    }

    addMessageListener = channelId => {
        const loadedMessages = [];
        const ref = this.getMessagesRef().child(channelId);
        ref.on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({messages: loadedMessages, messagesLoading: false});
            this.countUniqueUsers(loadedMessages);
        });
        this.setState({listeners: [...this.state.listeners, ref]});
    };

    displayMessages = messages => (
        messages.length && messages.map(message => (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />
        ))
    );

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
    };

    countUniqueUsers = messages => {
        const uniqueUsers =messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length === 1 ? 'user' : 'users'
        const numUniqueUsers = `${uniqueUsers.length} ${plural}`;
        this.setState({
            numUniqueUsers
        });
    };

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    };

    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, this.handleSearchMessages);
    };

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regexp = new RegExp(this.state.searchTerm, 'gi');
        const  searchResults = channelMessages.filter(message => (message.content &&
            message.content.match(regexp) ||
            message.user.name.match(regexp)
        ));
        this.setState({searchResults});
        setTimeout(() => this.setState({searchLoading: false}), 1000);
    };

    render() {
        const {messagesRef, channel, user, messages, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel} = this.state;

        return (
            <>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                />

                <Segment>
                    <CommentGroup className='messages'>
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </CommentGroup>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </>
        )
    }
}
