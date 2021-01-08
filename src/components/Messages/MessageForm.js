import React, {Component} from 'react';
import {Button, ButtonGroup, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import uuidv4 from 'uuid/v4';
import ProgressBar from "./ProgressBar";


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
        percentUploaded: 0
    };

    openModal = () => {
        this.setState({modal: true});
    };

    closeModal = () => {
        this.setState({modal: false});
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
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
        const {message, channel} = this.state;

        if (message) {
            this.setState({loading: true});
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({loading: false, message: '', errors: []})
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

    render() {
        const {errors, message, loading, modal, uploadState,  percentUploaded} = this.state;

        return (
            <Segment className='message__form'>
                <Input
                    fluid
                    name='message'
                    value={message}
                    onChange={this.handleChange}
                    style={{marginBottom: '0.7em'}}
                    label={<Button icon='add'/>}
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
