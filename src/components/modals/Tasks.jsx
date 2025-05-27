import React, {useEffect, useState} from 'react';
import {Button, Modal} from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";

function Tasks(props) {
    useEffect(() => {
        AOS.init({
            duration: 2000,
            easing: "ease-out-cubic",
        });
    }, []);

    return (
        <>
            <div data-aos="fade-left" data-aos-delay="50">
                <Modal  show={props.show} onHide={props.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add a new task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <div className="mb-3">
                                <label htmlFor="taskTitle" className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="taskTitle"
                                    name="title"
                                    value={props.newTask.title}
                                    onChange={props.handleInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="taskDescription" className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    id="taskDescription"
                                    rows="3"
                                    name="description"
                                    value={props.newTask.description}
                                    onChange={props.handleInputChange}
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="taskDueDate" className="form-label">Expiration date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="taskDueDate"
                                    name="dueDate"
                                    value={props.newTask.dueDate}
                                    onChange={props.handleInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-0">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    name="category"
                                    value={props.newTask.category}
                                    onChange={props.handleInputChange}
                                    required
                                >
                                    <option value="ux">UX</option>
                                    <option value="frontend">Frontend</option>
                                    <option value="backend">Backend</option>

                                </select>
                            </div>
                            <div className="mb-0">
                                <label htmlFor="taskOwner" className="form-label">Owner</label>
                                <select
                                    className="form-select"
                                    name="owner"
                                    id="taskOwner"
                                    value={props.newTask.owner}
                                    onChange={props.handleInputChange}

                                >
                                    <option value="Unassigned">Unassigned</option>
                                    {
                                        props.originalMembers
                                            .filter(member => member.category === props.newTask.category)
                                            .map(member => (

                                                <option key={member.id} value={member.name}>
                                                    {member.name} ({member.category})
                                                </option>

                                            ))}
                                </select>
                            </div>
                            <div className="mb-0">
                                <label className="form-label">Priority</label>
                                <select
                                    className="form-select"
                                    name="priority"
                                    value={props.newTask.priority}
                                    onChange={props.handleInputChange}
                                    required
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>

                                </select>
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.handleClose}>Cancel</Button>
                        <Button variant="primary" onClick={props.handleAddTask}>Add</Button>
                    </Modal.Footer>
                </Modal>
            </div>



        </>
    );
}

export default Tasks;

