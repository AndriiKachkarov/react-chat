import React, {Component} from 'react';
import {Dropdown, Grid, GridColumn, GridRow, Header, HeaderContent, Icon, Image} from "semantic-ui-react";
import firebase from "../../firebase";

class UserPanel extends Component {

    state = {
        user: this.props.currentUser
    };

    dropdownOptions = () => {
        return [
            {
                key: 'user',
                text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
                disabled: true
            },
            {
                key: 'avatar',
                text: <span>Change Avatar</span>
            } ,
            {
                key: 'signOut',
                text: <span onClick={this.handleSignOut}>Sign Out</span>
            }
        ]
    };

    handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log('signed out!'));
    };

    render() {
        const {user} = this.state;
        const { primaryColor } = this.props

        return (
            <Grid style={{background: primaryColor}}>
                <GridColumn>
                    <GridRow style={{padding: '1.2em', margin: 0}}>
                        <Header inverted floated='left' as='h2'>
                            <Icon name='code'/>
                            <HeaderContent>DevChat</HeaderContent>
                        </Header>
                    </GridRow>
                    <Header style={{padding: '0.25em'}} as='h4' inverted>
                        <Dropdown trigger={
                            <span>
                                <Image src={user.photoURL} spaced='right' avatar/>
                                {user.displayName}
                            </span>
                        } options={
                            this.dropdownOptions()
                        }/>
                    </Header>
                </GridColumn>
            </Grid>
        )
    }
}

export default UserPanel;
