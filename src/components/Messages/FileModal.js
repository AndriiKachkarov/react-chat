import React, {Component} from 'react';
import {Button, Icon, Input, Modal, ModalActions, ModalContent, ModalHeader} from "semantic-ui-react";
import mime from 'mime-types';

export default class FileModal extends Component{

    state = {
        file: null,
        authorized: ['image/jpeg', 'image/png']
    };

    addFile = event => {
      const file = event.target.files[0];
      if (file) {
          this.setState({file})
      }
    };

    sendFile = () => {
        const {file} = this.state;
        const {uploadFile, closeModal} = this.props;

        if (file) {
            if (this.isAuthorized(file.name)) {
                const metadata = {
                    contentType: mime.lookup(file.name)
                };
                uploadFile(file, metadata);
                closeModal();
                this.clearFile();
            }
        }
    };

    clearFile = () => this.setState({file: null});

    isAuthorized = fileType => this.state.authorized.includes(mime.lookup(fileType));

    render() {
        const {modal, closeModal} = this.props;

        return (
            <Modal basic open={modal} onClose={closeModal}>
                <ModalHeader>Select an Image File</ModalHeader>
                <ModalContent>
                    <Input
                        fluid
                        label='File types: jpg, png'
                        name='file'
                        type='file'
                        onChange={this.addFile}
                    />
                </ModalContent>
                <ModalActions>
                    <Button
                        color='green'
                        inverted
                        onClick={this.sendFile}
                    >
                        <Icon name='checkmark'/> Send
                    </Button>
                    <Button
                        color='red'
                        inverted
                        onClick={closeModal}
                    >
                        <Icon name='remove'/> Cancel
                    </Button>
                </ModalActions>
            </Modal>
        )
    }
}
