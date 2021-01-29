import React, {Component} from 'react';
import {CommentGroup, Segment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import {connect} from "react-redux";
import {setUserPosts} from "../../redux/actions";
import Typing from "./Typing";

class Messages extends Component {

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
        usersRef: firebase.database().ref('users'),
        isChannelStarred: false,
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected')
    };

    componentDidMount() {
        const {channel, user} = this.state;

        if (channel && user) {
            this.addListeners(channel.id);
            this.addUserStarsList(channel.id, user.uid);
        }
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId);
        this.addTypingListeners(channelId);
    };


    addMessageListener = channelId => {
        const loadedMessages = [];
        const ref = this.getMessagesRef().child(channelId);
        ref.on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({messages: loadedMessages, messagesLoading: false});
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        });
    };

    addTypingListeners = channelId =>  {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap => {
           if (snap.key !== this.state.user.uid) {
               typingUsers = typingUsers.concat({
                   id: snap.key,
                   name: snap.val()
               });
               this.setState({ typingUsers });
           }
        });

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({ typingUsers });
            }
        });

        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true) {
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if (err !== null) {
                            console.error(err);
                        }
                    })
            }
        })
    };

    addUserStarsList = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if (data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    this.setState({
                        isChannelStarred: prevStarred
                    })
                }
            })
    };

    countUserPosts = messages => {
        const userPosts = messages.reduce((acc, message) => {
            if (message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
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
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length === 1 ? 'user' : 'users';
        const numUniqueUsers = `${uniqueUsers.length} ${plural}`;
        this.setState({
            numUniqueUsers
        });
    };

    getMessagesRef = () => {
        const {messagesRef, privateMessagesRef, privateChannel} = this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    };

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel());
    };

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar,
                        }
                    }
                })
        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if (err) {
                        console.error(err);
                    }
                })
        }
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
        const searchResults = channelMessages.filter(message => (message.content &&
            message.content.match(regexp) ||
            message.user.name.match(regexp)
        ));
        this.setState({searchResults});
        setTimeout(() => this.setState({searchLoading: false}), 1000);
    };

    displayTypingUsers = users => (
        users.length > 0 && users.map(user => (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
                <span className="user__typing">{user.name} is typing<Typing/></span>
            </div>
        ))
    );

    render() {
        const {
            messagesRef,
            channel,
            user,
            messages,
            numUniqueUsers,
            searchTerm,
            searchResults,
            searchLoading,
            privateChannel,
            isChannelStarred,
            typingUsers
        } = this.state;

        return (
            <>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStared={isChannelStarred}
                />

                <Segment>
                    <CommentGroup className='messages'>
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
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

export default connect(null, { setUserPosts })(Messages);
