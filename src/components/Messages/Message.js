import React, {Component} from 'react';
import {
    Comment,
    CommentAuthor,
    CommentAvatar,
    CommentContent,
    CommentMetadata,
    CommentText,
    Image
} from "semantic-ui-react";
import moment from "moment";


const isOwnMessage = (message, user) => message.user.id === user.uid ? 'message__self' : '';
const timeFromNow = timestamp => moment(timestamp).fromNow();
const isMessage = message => message.hasOwnProperty('image') && !message.hasOwnProperty('content');

const Message = ({user, message}) => {

    return (
        <Comment>
            <CommentAvatar src={message.user.avatar}/>
            <CommentContent className={isOwnMessage(message, user)}>
                <CommentAuthor as='a'>{message.user.name}</CommentAuthor>
                <CommentMetadata>{timeFromNow(message.timestamp)}</CommentMetadata>
                {isMessage(message) ? <Image src={message.image} className='message__image'/> :
                    <CommentText>{message.content}</CommentText>
                }
            </CommentContent>
        </Comment>
    )
};

export default Message;
