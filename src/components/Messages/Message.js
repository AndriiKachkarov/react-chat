import React, {Component} from 'react';
import {Comment, CommentAuthor, CommentAvatar, CommentContent, CommentMetadata, CommentText} from "semantic-ui-react";
import moment from "moment";


const isOwnMessage = (message, user) => message.user.id === user.uid ? 'message__self' : '';
const timeFromNow = timestamp => moment(timestamp).fromNow();

const Message = ({user, message}) => {

    return (
        <Comment>
            <CommentAvatar src={message.user.avatar}/>
            <CommentContent className={isOwnMessage(message, user)}>
                <CommentAuthor as='a'>{message.user.name}</CommentAuthor>
                <CommentMetadata>{timeFromNow(message.timestamp)}</CommentMetadata>
                <CommentText>{message.content}</CommentText>
            </CommentContent>
        </Comment>
    )
};

export default Message;
