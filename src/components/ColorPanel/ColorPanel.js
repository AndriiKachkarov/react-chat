import React, {Component} from 'react';
import {
    Button,
    Divider,
    Icon,
    Label,
    Menu,
    Modal,
    ModalActions,
    ModalContent,
    ModalHeader, Segment,
    Sidebar
} from "semantic-ui-react";
import {SliderPicker} from "react-color";
import firebase from "../../firebase";
import {connect} from "react-redux";
import {setColors} from "../../redux/actions";

class ColorPanel extends Component {

    state = {
        modal: false,
        primary: '',
        secondary: '',
        userRef: firebase.database().ref('users'),
        user: this.props.currentUser,
        userColors: []
    };

    componentDidMount() {
        if (this.state.user) {
            this.addListener(this.state.user.uid);
        }
    }

    addListener = userId => {
        let userColors = [];
        this.state.userRef
            .child(`${userId}/colors`)
            .on('child_added', snap => {
                userColors.unshift(snap.val());
                this.setState({userColors})
            })

    };

    openModal = () => {
        this.setState({modal: true});
    };

    closeModal = () => {
        this.setState({modal: false});
    };

    handleChangePrimary = color => {
        this.setState({primary: color.hex});
    };

    handleChangeSecondary = color => {
        this.setState({secondary: color.hex});
    };

    handleSaveColors = () => {
        if (this.state.primary && this.state.secondary && this.state.primary !== '#000000' && this.state.secondary !== '#000000') {
            this.saveColors(this.state.primary, this.state.secondary)
        }
    };

    saveColors = (primary, secondary) => {
        this.state.userRef
            .child(`${this.state.user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                this.closeModal();
            })
    };

    displayUserColors = colors => {
        return colors.length > 0 && colors.map((color, i) => (
            <React.Fragment key={i}>
                <Divider/>
                <div
                    className='color__container'
                    onClick={() => this.props.setColors(color.primary, color.secondary)}
                >
                    <div className="color__square" style={{background: color.primary}}>
                        <div className="color__overlay" style={{background: color.secondary}}>

                        </div>
                    </div>

                </div>
            </React.Fragment>
        ))
    };

    render() {

        const {modal, primary, secondary, userColors} = this.state;
        return (
            <Sidebar
                as={Menu}
                icon='labeled'
                inverted
                vertical
                visible
                width='very thin'
            >
                <Divider/>
                <Button icon='add' size='small' color='blue' onClick={this.openModal}/>
                {this.displayUserColors(userColors)}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <ModalHeader>Chose App Colors</ModalHeader>
                    <ModalContent>
                        <Segment>
                            <Label content='Primary Color'/>
                            <SliderPicker
                                color={primary}
                                onChangeComplete={this.handleChangePrimary}
                            />
                        </Segment>
                        <Segment>
                            <Label content='Secondary Color'/>
                            <SliderPicker
                                color={secondary}
                                onChangeComplete={this.handleChangeSecondary}
                            />
                        </Segment>


                    </ModalContent>
                    <ModalActions>
                        <Button color='green' inverted onClick={this.handleSaveColors}>
                            <Icon name='checkmark'/> Save Colors
                        </Button>
                        <Button color='red' inverted onClick={this.closeModal}>
                            <Icon name='remove'/> Cancel
                        </Button>
                    </ModalActions>
                </Modal>
            </Sidebar>
        )
    }
}

export default connect(null, { setColors })(ColorPanel);
