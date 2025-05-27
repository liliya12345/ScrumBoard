import React from 'react';
import {Button, Modal} from "react-bootstrap";

function MembersModal(props) {
    return (
        <>
            <Modal show={props.show} onHide={props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add a new team member</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="mb-3">
                            <label htmlFor="memberName" className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="memberName"
                                name="name"
                                value={props.newMember.name}
                                onChange={props.handleInputChangeName}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Category</label>
                            <select
                                className="form-select"
                                name="category"
                                defaultValue="ux"
                                value={props.newMember.category}
                                onChange={props.handleInputChangeName}
                            >
                                <option value="ux">UX</option>
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                            </select>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.handleClose}>Cancel</Button>
                    <Button variant="primary" onClick={props.handleAddMember}>Add</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MembersModal;
