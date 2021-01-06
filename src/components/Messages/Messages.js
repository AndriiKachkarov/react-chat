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
        messagesLoading: true
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

    addMessageListener = channelId => {
        const loadedMessages = [];
        this.state.messagesRef.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({messages: loadedMessages, messagesLoading: false})
        });
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


    render() {
        const {messagesRef, channel, user, messages} = this.state;

        return (
            <>
                <MessagesHeader/>

                <Segment>
                    <CommentGroup className='messages'>
                        {this.displayMessages(messages)}
                    </CommentGroup>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                />
            </>
        )
    }
}
