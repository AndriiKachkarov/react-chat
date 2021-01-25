import React, {Component} from 'react';
import {Header, Icon, Input, Segment} from "semantic-ui-react";
import HeaderSubHeader from "semantic-ui-react/dist/commonjs/elements/Header/HeaderSubheader";


export default class MessagesHeader extends Component {
    render() {

        const {
            channelName,
            numUniqueUsers,
            handleSearchChange,
            searchLoading,
            isPrivateChannel,
            handleStar,
            isChannelStared
        } = this.props;

        return (
            <Segment clearing>
                <Header fluid='true' as='h2' floated='left' style={{marginBottom: 0}}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && (
                            <Icon
                                name={isChannelStared ? 'star' : 'star outline'}
                                color={isChannelStared ? 'yellow' : 'black'}
                                onClick={handleStar}
                            />
                        )}
                    </span>
                    <HeaderSubHeader>{numUniqueUsers }</HeaderSubHeader>
                </Header>
                <Header floated='right'>
                    <Input
                        loading={searchLoading}
                        onChange={handleSearchChange}
                        size='mini'
                        icon='search'
                        name='searchTerm'
                        placeholder='Search Messages'
                    />
                </Header>
            </Segment>
        )
    }
}
