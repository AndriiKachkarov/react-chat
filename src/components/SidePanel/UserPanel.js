import React, {Component} from 'react';
import {
    Button,
    Dropdown,
    Grid,
    GridColumn,
    GridRow,
    Header,
    HeaderContent,
    Icon,
    Image, Input,
    Modal, ModalActions, ModalContent,
    ModalHeader
} from "semantic-ui-react";
import firebase from "../../firebase";
import AvatarEditor from "react-avatar-editor";

class UserPanel extends Component {

    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        croppedImage: '',
        blob: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        metaData: {
            contentType: 'image/jpeg'
        },
        uploadedCroppedImage: '',
        usersRef: firebase.database().ref('users')
    };

    openModal = () => {
        this.setState({modal: true});
    };

    closeModal = () => {
        this.setState({modal: false});
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
                text: <span onClick={this.openModal}>Change Avatar</span>
            },
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

    handleChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                this.setState({previewImage: reader.result});
            })
        }
    };

    handleCropImage = () => {
        if (this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                const imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                })
            });
        }
    };

    uploadCroppedImage = () => {
        const {storageRef, userRef, blob, metaData} = this.state;

        storageRef
            .child(`avatars/users/${userRef.uid}`)
            .put(blob, metaData)
            .then(snap => {
                snap.ref.getDownloadURL().then(url => {
                    this.setState({uploadedCroppedImage: url}, () => {
                        this.changeAvatar();
                    })
                })
            })
    };

    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadedCroppedImage
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                this.closeModal();
            })

        this.state.usersRef
            .child(this.state.user.uid)
            .update({avatar: this.state.uploadedCroppedImage})
            .catch(err => {
                console.error(err);
            });
    };

    render() {
        const {user, modal, previewImage, croppedImage} = this.state;
        const {primaryColor} = this.props;

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
                    <Modal basic open={modal} onClose={this.closeModal}>
                        <ModalHeader>Change avatar</ModalHeader>
                        <ModalContent>
                            <Input
                                fluid
                                type='file'
                                label='New Avatar'
                                name='previewImage'
                                onChange={this.handleChange}
                            />
                            <Grid centered stackable columns={2}>
                                <GridRow centered>
                                    <GridColumn className='ui center aligned grid'>
                                        {previewImage && (
                                            <AvatarEditor
                                                ref={node => (this.avatarEditor = node)}
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        )}
                                    </GridColumn>
                                    <GridColumn>
                                        {croppedImage && (
                                            <Image
                                                style={{margin: '3.5em auto'}}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                            />
                                        )}
                                    </GridColumn>

                                </GridRow>
                            </Grid>
                        </ModalContent>
                        <ModalActions>
                            {croppedImage && (
                                <Button color='green' inverted onClick={this.uploadCroppedImage}>
                                    <Icon name='save'/> Change Avatar
                                </Button>
                            )}
                            <Button color='green' inverted onClick={this.handleCropImage}>
                                <Icon name='image'/> Preview
                            </Button>
                            <Button color='red' inverted onClick={this.closeModal}>
                                <Icon name='remove'/> Cancel
                            </Button>
                        </ModalActions>
                    </Modal>
                </GridColumn>
            </Grid>
        )
    }
}

export default UserPanel;
