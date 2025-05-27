import React from 'react';
import {Button, Modal} from "react-bootstrap";


function OwnerModal(props) {
    return (
        <>

            <Modal show={props.show} onHide={props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add an owner</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="mb-3">
                            <label className="form-label">Owner</label>
                            <select
                                className="form-select"
                                name="owner"
                                value={props.ownerUpdate}
                                onChange={(e) => props.setOwnerUpdate(e.target.value)}
                            >
                                <option value="">Select owner</option>
                                {props.members.map(member => (
                                    <option key={member.id} value={member.name}>
                                        {member.name} ({member.category})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>Cancel</Button>
                    <Button variant="primary" onClick={props.handleAddOwner}>Add</Button>
                </Modal.Footer>
            </Modal>




        </>
    );
}

export default OwnerModal;