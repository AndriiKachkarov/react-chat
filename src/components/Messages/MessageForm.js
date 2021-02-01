import React, {Component} from 'react';
import {Button, ButtonGroup, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import uuidv4 from 'uuid/v4';
import ProgressBar from "./ProgressBar";
import 'emoji-mart/css/emoji-mart.css'
import {emojiIndex, Picker} from "emoji-mart";


export default class MessageForm extends Component {

    state = {
        message: '',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        loading: false,
        errors: [],
        modal: false,
        uploadState: '',
        uploadTask: null,
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref('typing'),
        percentUploaded: 0,
        emojiPicker: false
    };

    componentWillUnmount() {
        if (this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({ uploadTask: null });
        }
    }

    openModal = () => {
        this.setState({modal: true});
    };

    closeModal = () => {
        this.setState({modal: false});
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    handleKeyDown = event => {
        if (event.ctrlKey && event.keyCode === 13) {
            this.sendMessage();
        }

        const {message, typingRef, channel, user} = this.state;

        if (message) {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .set(user.displayName);
        } else {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .remove();
        }
    };

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        };

        if (fileUrl) {
            message['image'] = fileUrl
        } else {
            message['content'] = this.state.message;
        }
        return message;
    };

    sendMessage = () => {
        const {getMessagesRef} = this.props;
        const {message, channel, user, typingRef} = this.state;

        if (message) {
            this.setState({loading: true});
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({loading: false, message: '', errors: []});
                    typingRef
                        .child(channel.id)
                        .child(user.uid)
                        .remove();
                })
                .catch(err => {
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(err)
                    })
                })
        } else {
            this.setState({
                errors: this.state.errors.concat({message: 'Add a message'})
            })
        }
    };

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private-${this.state.channel.id}`;
        } else {
            return 'chat/public';
        }
    };

    uploadFile = (file, metaData) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;


        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metaData)
        }, () => {
            this.state.uploadTask.on('state_changed', snap => {
                    const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                    this.setState({percentUploaded})
                },
                err => {
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: 'error',
                        uploadTask: null
                    });
                },
                () => {
                    this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                        this.sendFileMessage(downloadUrl, ref, pathToUpload);
                    })
                        .catch(err => {
                            this.setState({
                                errors: this.state.errors.concat(err),
                                uploadState: 'error',
                                uploadTask: null
                            });
                        },)
                }
            )
        })
    };

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({
                    uploadState: 'done'
                });
            })
            .catch(err => {
                this.setState({
                    errors: this.state.errors.concat(err),
                });
            })
    };

    handleTogglePicker = () => {
        this.setState({ emojiPicker: !this.state.emojiPicker});
    };

    handleAddEmoji = emoji => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
        this.setState({ message: newMessage, emojiPicker: false});
        setTimeout(() => this.messageInputRef.focus(), 0);
    };

    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== "undefined") {
                let unicode = emoji.native;
                if (typeof unicode !== "undefined") {
                    return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
        });
    };

    render() {
        const {errors, message, loading, modal, uploadState, percentUploaded, emojiPicker} = this.state;

        return (
            <Segment className='message__form'>
                {emojiPicker && (
                    <Picker
                        set='apple'
                        onSelect={this.handleAddEmoji}
                        className='emoji-picker'
                        title='Pick your emoji'
                        emoji='point_up'
                    />
                )}
                <Input
                    fluid
                    name='message'
                    value={message}
                    ref={node => this.messageInputRef = node}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    style={{marginBottom: '0.7em'}}
                    label={
                        <Button
                            icon={emojiPicker ? 'close' : 'add'}
                            content={emojiPicker ? 'close' : null}
                            onClick={this.handleTogglePicker}
                        />
                    }
                    labelPosition='left'
                    placeholder='write your message'
                    className={
                        errors.some(error => error.message.includes('message')) ? 'error' : ''
                    }
                />
                <ButtonGroup icon widths='2'>
                    <Button
                        color='orange'
                        content='Add Reply'
                        onClick={this.sendMessage}
                        icon='edit'
                        labelPosition='left'
                        disabled={loading}
                    />
                    <Button
                        color='teal'
                        onClick={this.openModal}
                        content='Upload Media'
                        icon='cloud upload'
                        labelPosition='right'
                        disabled={uploadState === 'uploading'}
                    />
                </ButtonGroup>
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}
                />
            </Segment>
        )
    }
}
