import React, {Component} from 'react';
import {Header, Icon, Input, Segment} from "semantic-ui-react";
import HeaderSubHeader from "semantic-ui-react/dist/commonjs/elements/Header/HeaderSubheader";


export default class MessagesHeader extends Component {
    render() {
        return (
            <Segment clearing>
                <Header fluid='true' as='h2' floated='left' style={{marginBottom: 0}}>
                    <span>
                        Channel
                        <Icon name='star outline' color='black'/>
                    </span>
                    <HeaderSubHeader>2 Users</HeaderSubHeader>
                </Header>
                <Header floated='right'>
                    <Input
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
