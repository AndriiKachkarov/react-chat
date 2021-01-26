import React, {Component} from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionTitle,
    Header,
    Icon,
    Image,
    List, ListContent, ListDescription, ListHeader,
    ListItem,
    Segment
} from "semantic-ui-react";

export default class MetaPanel extends Component {

    state = {
        channel: this.props.currentChanel,
        privateChannel: this.props.isPrivateChannel,
        activeIndex: 0
    };

    setActiveIndex = (event, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({ activeIndex: newIndex });
    };

    formatCount = count => count === 1 ? count + ' post' : count + ' posts';

    displayTopPosters = userPosts => {
        return Object.entries(userPosts)
            .sort((a, b) => a[1] - b[1])
            .map(([key, val], i) => (
                <ListItem key={i}>
                    <Image avatar src={val.avatar}/>
                    <ListContent>
                        <ListHeader as='a'>{key}</ListHeader>
                        <ListDescription>{this.formatCount(val.count)}</ListDescription>
                    </ListContent>
                </ListItem>
            ))
            .slice(0, 5);
    };

    render() {
         const { activeIndex, privateChannel, channel } = this.state;
         const { userPosts } = this.props;

         if (privateChannel) return null;

        return (
            <Segment loading={!channel}>
                <Header as='h3' attached='top'>
                    about # channel
                </Header>
                <Accordion styled attached='true'>
                    <AccordionTitle
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name='dropdown'/>
                        <Icon name='info'/>
                        Channel details
                    </AccordionTitle>
                    <AccordionContent active={activeIndex === 0}>
                        {channel && channel.details}
                    </AccordionContent>
                    <AccordionTitle
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name='dropdown'/>
                        <Icon name='user circle'/>
                        Top Posters
                    </AccordionTitle>
                    <AccordionContent active={activeIndex === 1}>
                        <List>
                            {userPosts && this.displayTopPosters(userPosts)}
                        </List>
                    </AccordionContent>
                    <AccordionTitle
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name='dropdown'/>
                        <Icon name='pencil alternate'/>
                        Created by
                    </AccordionTitle>
                    <AccordionContent active={activeIndex === 2}>
                        <Header as='h3'>
                            <Image circular src={channel && channel.createdBy.avatar}/>
                            {channel && channel.createdBy.name}
                        </Header>
                    </AccordionContent>
                </Accordion>
            </Segment>
        )
    }
}
