import React, {Component} from 'react';
import {Button, ButtonGroup, Input, Segment} from "semantic-ui-react";
import firebase from "../../firebase";


export default class MessageForm extends Component{

    state = {
        message: '',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        loading: false,
        errors: []
    };

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    createMessage = () => {
        const message = {
            content: this.state.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        };
        return message;
    };

    sendMessage = () => {
        const {messagesRef} = this.props;
        const {message, channel} = this.state;

        if (message) {
            this.setState({loading: true});
            messagesRef
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

    render() {
        const {errors, message, loading} = this.state;

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
                        content='Upload Media'
                        icon='cloud upload'
                        labelPosition='right'
                    />
                </ButtonGroup>
            </Segment>
        )
    }
}
